package sn.casaagrischool.api.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import sn.casaagrischool.api.dto.AdminStatsDto;
import sn.casaagrischool.api.dto.AdminUserCreateDto;
import sn.casaagrischool.api.dto.AdminUserUpdateDto;
import sn.casaagrischool.api.dto.MessageResponse;
import sn.casaagrischool.api.entity.Exploitation;
import sn.casaagrischool.api.entity.ProfilExpert;
import sn.casaagrischool.api.entity.Role;
import sn.casaagrischool.api.entity.User;
import sn.casaagrischool.api.entity.enums.ERole;
import sn.casaagrischool.api.entity.enums.StatutQuestion;
import sn.casaagrischool.api.exception.BadRequestException;
import sn.casaagrischool.api.exception.ResourceNotFoundException;
import sn.casaagrischool.api.repository.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final ProfilExpertRepository profilExpertRepository;
    private final ExploitationRepository exploitationRepository;
    private final FormationRepository formationRepository;
    private final AlerteRepository alerteRepository;
    private final QuestionForumRepository questionForumRepository;
    private final ReponseForumRepository reponseForumRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final LeconValidationRepository leconValidationRepository;
    private final ProgressionFormationRepository progressionFormationRepository;
    private final ResultatQuizRepository resultatQuizRepository;

    public AdminStatsDto getStatistics() {
        long totalUsers = userRepository.count();
        long totalMaraichers = userRepository.findAll().stream()
                .filter(u -> u.getRoles().stream().anyMatch(r -> r.getNom() == ERole.ROLE_MARAICHER))
                .count();
        long totalExperts = profilExpertRepository.count();
        long expertsEnAttente = profilExpertRepository.findAll().stream()
                .filter(p -> !p.isEstVerifie())
                .count();

        long totalExploitations = exploitationRepository.count();
        long totalFormations = formationRepository.count();
        long totalAlertesActives = alerteRepository.findByStatutTrue().size();
        long totalQuestions = questionForumRepository.count();
        long questionsResolues = questionForumRepository.findAll().stream()
                .filter(q -> q.getStatut() == StatutQuestion.RESOLUE)
                .count();

        return AdminStatsDto.builder()
                .totalUsers(totalUsers)
                .totalMaraichers(totalMaraichers)
                .totalExperts(totalExperts)
                .totalExpertsEnAttente(expertsEnAttente)
                .totalExploitations(totalExploitations)
                .totalFormations(totalFormations)
                .totalAlertesActives(totalAlertesActives)
                .totalQuestionsForum(totalQuestions)
                .totalQuestionsResolues(questionsResolues)
                .build();
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional
    public MessageResponse toggleUserActive(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

        user.setActif(!user.isActif());
        userRepository.save(user);

        return new MessageResponse("Statut du compte mis à jour avec succès : " + (user.isActif() ? "Actif" : "Désactivé"));
    }

    @Transactional
    public User createUser(AdminUserCreateDto dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new BadRequestException("Cet email est déjà utilisé");
        }
        if (userRepository.existsByTelephone(dto.getTelephone())) {
            throw new BadRequestException("Ce numéro de téléphone est déjà utilisé");
        }

        Set<Role> roles = new HashSet<>();
        if (dto.getRoles() == null || dto.getRoles().isEmpty()) {
            Role defaultRole = roleRepository.findByNom(ERole.ROLE_MARAICHER)
                    .orElseThrow(() -> new ResourceNotFoundException("Rôle MARAICHER non trouvé"));
            roles.add(defaultRole);
        } else {
            for (ERole eRole : dto.getRoles()) {
                Role role = roleRepository.findByNom(eRole)
                        .orElseThrow(() -> new ResourceNotFoundException("Rôle non trouvé: " + eRole));
                roles.add(role);
            }
        }

        User user = User.builder()
                .nom(dto.getNom())
                .prenom(dto.getPrenom())
                .telephone(dto.getTelephone())
                .email(dto.getEmail())
                .motDePasse(passwordEncoder.encode(dto.getMotDePasse()))
                .localisation(dto.getLocalisation())
                .roles(roles)
                .actif(dto.isActif())
                .points(0)
                .build();

        User savedUser = userRepository.save(user);

        // Si l'utilisateur a le rôle EXPERT, créer son profil expert s'il n'existe pas
        if (roles.stream().anyMatch(r -> r.getNom() == ERole.ROLE_EXPERT)) {
            ProfilExpert profil = ProfilExpert.builder()
                    .user(savedUser)
                    .specialite("Expertise agricole")
                    .estVerifie(true)
                    .dateVerification(LocalDateTime.now())
                    .build();
            profilExpertRepository.save(profil);
        }

        return savedUser;
    }

    @Transactional
    public User updateUser(Long userId, AdminUserUpdateDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé avec l'ID: " + userId));

        if (!user.getEmail().equalsIgnoreCase(dto.getEmail()) && userRepository.existsByEmail(dto.getEmail())) {
            throw new BadRequestException("Cet email est déjà utilisé");
        }
        if (!user.getTelephone().equals(dto.getTelephone()) && userRepository.existsByTelephone(dto.getTelephone())) {
            throw new BadRequestException("Ce numéro de téléphone est déjà utilisé");
        }

        user.setNom(dto.getNom());
        user.setPrenom(dto.getPrenom());
        user.setTelephone(dto.getTelephone());
        user.setEmail(dto.getEmail());
        user.setLocalisation(dto.getLocalisation());

        if (dto.getActif() != null) {
            user.setActif(dto.getActif());
        }

        if (dto.getMotDePasse() != null && !dto.getMotDePasse().trim().isEmpty()) {
            user.setMotDePasse(passwordEncoder.encode(dto.getMotDePasse().trim()));
        }

        if (dto.getRoles() != null && !dto.getRoles().isEmpty()) {
            Set<Role> roles = new HashSet<>();
            for (ERole eRole : dto.getRoles()) {
                Role role = roleRepository.findByNom(eRole)
                        .orElseThrow(() -> new ResourceNotFoundException("Rôle non trouvé: " + eRole));
                roles.add(role);
            }
            user.setRoles(roles);

            // Synchroniser le profil expert
            boolean hasExpertRole = roles.stream().anyMatch(r -> r.getNom() == ERole.ROLE_EXPERT);
            boolean hasProfile = profilExpertRepository.findByUserId(userId).isPresent();
            if (hasExpertRole && !hasProfile) {
                ProfilExpert profil = ProfilExpert.builder()
                        .user(user)
                        .specialite("Expertise agricole")
                        .estVerifie(true)
                        .dateVerification(LocalDateTime.now())
                        .build();
                profilExpertRepository.save(profil);
            }
        }

        return userRepository.save(user);
    }

    @Transactional
    public MessageResponse deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé avec l'ID: " + userId));

        // Supprimer profil expert si existant
        profilExpertRepository.findByUserId(userId).ifPresent(profilExpertRepository::delete);

        userRepository.delete(user);
        return new MessageResponse("Utilisateur supprimé avec succès");
    }

    @Transactional
    public MessageResponse verifyExpert(Long expertProfileId, boolean verify) {
        ProfilExpert profil = profilExpertRepository.findById(expertProfileId)
                .orElseThrow(() -> new ResourceNotFoundException("Profil expert non trouvé"));

        profil.setEstVerifie(verify);
        profil.setDateVerification(verify ? LocalDateTime.now() : null);
        profilExpertRepository.save(profil);

        User user = profil.getUser();
        if (verify) {
            Role expertRole = roleRepository.findByNom(ERole.ROLE_EXPERT)
                    .orElseGet(() -> roleRepository.save(Role.builder()
                            .nom(ERole.ROLE_EXPERT)
                            .description("Rôle EXPERT")
                            .build()));
            user.getRoles().add(expertRole);
        } else {
            user.getRoles().removeIf(r -> r.getNom() == ERole.ROLE_EXPERT);
        }
        userRepository.save(user);

        return new MessageResponse(verify ? "Expert vérifié avec succès !" : "Statut vérifié retiré.");
    }

    @Transactional
    public void deleteQuestion(Long id) {
        questionForumRepository.deleteById(id);
    }

    @Transactional
    public void deleteAnswer(Long id) {
        reponseForumRepository.deleteById(id);
    }

    @Transactional
    public MessageResponse resetProgressAndPoints() {
        resultatQuizRepository.deleteAll();
        leconValidationRepository.deleteAll();
        progressionFormationRepository.deleteAll();

        List<User> allUsers = userRepository.findAll();
        for (User u : allUsers) {
            u.setPoints(0);
        }
        userRepository.saveAll(allUsers);

        return new MessageResponse("Toutes les progressions de cours et validations ont été réinitialisées, et les points de tous les utilisateurs remis à 0.");
    }

    public List<Exploitation> getAllExploitations() {
        return exploitationRepository.findAll();
    }
}