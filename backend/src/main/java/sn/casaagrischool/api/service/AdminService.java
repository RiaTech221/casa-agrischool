package sn.casaagrischool.api.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sn.casaagrischool.api.dto.AdminStatsDto;
import sn.casaagrischool.api.dto.MessageResponse;
import sn.casaagrischool.api.entity.ProfilExpert;
import sn.casaagrischool.api.entity.Role;
import sn.casaagrischool.api.entity.User;
import sn.casaagrischool.api.entity.enums.ERole;
import sn.casaagrischool.api.entity.enums.StatutQuestion;
import sn.casaagrischool.api.exception.ResourceNotFoundException;
import sn.casaagrischool.api.repository.*;

import java.time.LocalDateTime;
import java.util.List;

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
}