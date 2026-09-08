package sn.casaagrischool.api.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sn.casaagrischool.api.dto.ExpertUpdateDto;
import sn.casaagrischool.api.dto.MessageResponse;
import sn.casaagrischool.api.dto.UserProfileDto;
import sn.casaagrischool.api.dto.UserUpdateDto;
import sn.casaagrischool.api.entity.ProfilExpert;
import sn.casaagrischool.api.entity.User;
import sn.casaagrischool.api.exception.BadRequestException;
import sn.casaagrischool.api.exception.ResourceNotFoundException;
import sn.casaagrischool.api.repository.ProfilExpertRepository;
import sn.casaagrischool.api.repository.UserRepository;
import sn.casaagrischool.api.security.services.UserDetailsImpl;
import sn.casaagrischool.api.util.PhoneUtils;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final ProfilExpertRepository profilExpertRepository;
    private final AuthService authService;

    @Transactional
    public UserProfileDto updateProfile(UserUpdateDto dto, UserDetailsImpl userDetails) {
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

        // Vérifier unicité du téléphone s'il a changé
        if (dto.getTelephone() != null) {
            dto.setTelephone(PhoneUtils.normalize(dto.getTelephone()));
        }

        if (!user.getTelephone().equals(dto.getTelephone())) {
            if (userRepository.existsByTelephone(dto.getTelephone())) {
                throw new BadRequestException("Ce numéro de téléphone est déjà utilisé !");
            }
        }

        user.setNom(dto.getNom());
        user.setPrenom(dto.getPrenom());
        user.setTelephone(dto.getTelephone());
        user.setLocalisation(dto.getLocalisation());

        userRepository.save(user);

        return authService.getCurrentUserProfile(userDetails);
    }

    @Transactional
    public UserProfileDto updateExpertProfile(ExpertUpdateDto dto, UserDetailsImpl userDetails) {
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

        boolean isExpert = user.getRoles().stream()
                .anyMatch(r -> r.getNom().name().equals("ROLE_EXPERT"));

        if (!isExpert) {
            throw new BadRequestException("Vous n'avez pas le rôle expert.");
        }

        ProfilExpert profil = user.getProfilExpert();
        if (profil == null) {
            profil = ProfilExpert.builder()
                    .user(user)
                    .estVerifie(false)
                    .build();
        }

        if (dto.getSpecialite() != null) profil.setSpecialite(dto.getSpecialite());
        if (dto.getBiographie() != null) profil.setBiographie(dto.getBiographie());
        if (dto.getOrganisme() != null) profil.setOrganisme(dto.getOrganisme());

        profilExpertRepository.save(profil);
        user.setProfilExpert(profil);
        userRepository.save(user);

        return authService.getCurrentUserProfile(userDetails);
    }
}
