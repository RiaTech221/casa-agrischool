package sn.casaagrischool.api.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sn.casaagrischool.api.dto.*;
import sn.casaagrischool.api.entity.ProfilExpert;
import sn.casaagrischool.api.entity.Role;
import sn.casaagrischool.api.entity.User;
import sn.casaagrischool.api.entity.enums.ERole;
import sn.casaagrischool.api.exception.BadRequestException;
import sn.casaagrischool.api.exception.ResourceNotFoundException;
import sn.casaagrischool.api.repository.ProfilExpertRepository;
import sn.casaagrischool.api.repository.RoleRepository;
import sn.casaagrischool.api.repository.UserRepository;
import sn.casaagrischool.api.security.jwt.JwtUtils;
import sn.casaagrischool.api.security.services.UserDetailsImpl;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final ProfilExpertRepository profilExpertRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @Transactional
    public JwtResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Erreur: Cet email est déjà utilisé !");
        }

        if (userRepository.existsByTelephone(request.getTelephone())) {
            throw new BadRequestException("Erreur: Ce numéro de téléphone est déjà utilisé !");
        }

        User user = User.builder()
                .nom(request.getNom())
                .prenom(request.getPrenom())
                .email(request.getEmail())
                .telephone(request.getTelephone())
                .motDePasse(passwordEncoder.encode(request.getMotDePasse()))
                .localisation(request.getLocalisation())
                .actif(true)
                .points(0)
                .build();

        Set<Role> roles = new HashSet<>();
        ERole roleEnum = request.getRole() != null ? request.getRole() : ERole.ROLE_MARAICHER;

        Role userRole = roleRepository.findByNom(roleEnum)
                .orElseGet(() -> roleRepository.save(Role.builder()
                        .nom(roleEnum)
                        .description("Rôle " + roleEnum.name())
                        .build()));
        roles.add(userRole);
        user.setRoles(roles);

        User savedUser = userRepository.save(user);

        // Si rôle EXPERT, créer le profil expert
        if (roleEnum == ERole.ROLE_EXPERT) {
            ProfilExpert profil = ProfilExpert.builder()
                    .user(savedUser)
                    .specialite(request.getSpecialite() != null ? request.getSpecialite() : "Expert Agricole")
                    .biographie(request.getBiographie())
                    .organisme(request.getOrganisme())
                    .estVerifie(false)
                    .build();
            profilExpertRepository.save(profil);
            savedUser.setProfilExpert(profil);
        }

        // Connexion automatique après inscription
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getMotDePasse()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        List<String> rolesList = savedUser.getRoles().stream()
                .map(r -> r.getNom().name())
                .collect(Collectors.toList());

        ProfilExpertDto expertDto = null;
        if (savedUser.getProfilExpert() != null) {
            ProfilExpert p = savedUser.getProfilExpert();
            expertDto = ProfilExpertDto.builder()
                    .id(p.getId())
                    .specialite(p.getSpecialite())
                    .biographie(p.getBiographie())
                    .organisme(p.getOrganisme())
                    .estVerifie(p.isEstVerifie())
                    .dateVerification(p.getDateVerification())
                    .build();
        }

        return JwtResponse.builder()
                .token(jwt)
                .id(savedUser.getId())
                .nom(savedUser.getNom())
                .prenom(savedUser.getPrenom())
                .email(savedUser.getEmail())
                .telephone(savedUser.getTelephone())
                .localisation(savedUser.getLocalisation())
                .points(savedUser.getPoints())
                .roles(rolesList)
                .profilExpert(expertDto)
                .build();
    }

    public JwtResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getIdentifiant(), loginRequest.getMotDePasse()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

        List<String> roles = user.getRoles().stream()
                .map(r -> r.getNom().name())
                .collect(Collectors.toList());

        ProfilExpertDto expertDto = null;
        if (user.getProfilExpert() != null) {
            ProfilExpert p = user.getProfilExpert();
            expertDto = ProfilExpertDto.builder()
                    .id(p.getId())
                    .specialite(p.getSpecialite())
                    .biographie(p.getBiographie())
                    .organisme(p.getOrganisme())
                    .estVerifie(p.isEstVerifie())
                    .dateVerification(p.getDateVerification())
                    .build();
        }

        return JwtResponse.builder()
                .token(jwt)
                .id(user.getId())
                .nom(user.getNom())
                .prenom(user.getPrenom())
                .email(user.getEmail())
                .telephone(user.getTelephone())
                .localisation(user.getLocalisation())
                .points(user.getPoints())
                .roles(roles)
                .profilExpert(expertDto)
                .build();
    }

    public UserProfileDto getCurrentUserProfile(UserDetailsImpl userDetails) {
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

        List<String> roles = user.getRoles().stream()
                .map(r -> r.getNom().name())
                .collect(Collectors.toList());

        ProfilExpertDto expertDto = null;
        if (user.getProfilExpert() != null) {
            ProfilExpert p = user.getProfilExpert();
            expertDto = ProfilExpertDto.builder()
                    .id(p.getId())
                    .specialite(p.getSpecialite())
                    .biographie(p.getBiographie())
                    .organisme(p.getOrganisme())
                    .estVerifie(p.isEstVerifie())
                    .dateVerification(p.getDateVerification())
                    .build();
        }

        return UserProfileDto.builder()
                .id(user.getId())
                .nom(user.getNom())
                .prenom(user.getPrenom())
                .email(user.getEmail())
                .telephone(user.getTelephone())
                .localisation(user.getLocalisation())
                .points(user.getPoints())
                .actif(user.isActif())
                .roles(roles)
                .profilExpert(expertDto)
                .createdAt(user.getCreatedAt())
                .build();
    }
    @Transactional
    public UserProfileDto updateProfile(UserDetailsImpl userDetails, UserProfileUpdateDto dto) {
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

        if (dto.getNom() != null && !dto.getNom().isBlank()) user.setNom(dto.getNom());
        if (dto.getPrenom() != null && !dto.getPrenom().isBlank()) user.setPrenom(dto.getPrenom());
        if (dto.getTelephone() != null && !dto.getTelephone().isBlank()) user.setTelephone(dto.getTelephone());
        if (dto.getLocalisation() != null) user.setLocalisation(dto.getLocalisation());

        if (user.getProfilExpert() != null) {
            ProfilExpert p = user.getProfilExpert();
            if (dto.getSpecialite() != null) p.setSpecialite(dto.getSpecialite());
            if (dto.getBiographie() != null) p.setBiographie(dto.getBiographie());
            if (dto.getOrganisme() != null) p.setOrganisme(dto.getOrganisme());
            profilExpertRepository.save(p);
        }

        User saved = userRepository.save(user);
        return getCurrentUserProfile(UserDetailsImpl.build(saved));
    }
}