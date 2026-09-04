package sn.casaagrischool.api.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sn.casaagrischool.api.dto.AlerteCreateDto;
import sn.casaagrischool.api.dto.AlerteDto;
import sn.casaagrischool.api.entity.Alerte;
import sn.casaagrischool.api.entity.Culture;
import sn.casaagrischool.api.entity.User;
import sn.casaagrischool.api.entity.UtilisateurAlerte;
import sn.casaagrischool.api.exception.ResourceNotFoundException;
import sn.casaagrischool.api.repository.AlerteRepository;
import sn.casaagrischool.api.repository.CultureRepository;
import sn.casaagrischool.api.repository.ExploitationCultureRepository;
import sn.casaagrischool.api.repository.UserRepository;
import sn.casaagrischool.api.repository.UtilisateurAlerteRepository;
import sn.casaagrischool.api.security.services.UserDetailsImpl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AlerteService {

    private final AlerteRepository alerteRepository;
    private final UtilisateurAlerteRepository utilisateurAlerteRepository;
    private final ExploitationCultureRepository exploitationCultureRepository;
    private final CultureRepository cultureRepository;
    private final UserRepository userRepository;

    public List<AlerteDto> getAlertesForUser(UserDetailsImpl userDetails) {
        LocalDate today = LocalDate.now();

        // Trouver les cultures de l'agriculteur
        List<Culture> myCultures = exploitationCultureRepository.findDistinctCulturesByUserId(userDetails.getId());
        List<Long> cultureIds = myCultures.stream().map(Culture::getId).collect(Collectors.toList());

        List<Alerte> alertes;
        if (cultureIds.isEmpty()) {
            alertes = alerteRepository.findActiveGeneralAlertes(today);
        } else {
            alertes = alerteRepository.findActiveAlertesForCultures(today, cultureIds);
        }

        // Récupérer le statut de lecture de l'utilisateur
        Map<Long, UtilisateurAlerte> lectureMap = utilisateurAlerteRepository.findByUserId(userDetails.getId())
                .stream()
                .collect(Collectors.toMap(ua -> ua.getAlerte().getId(), ua -> ua, (existing, replace) -> existing));

        return alertes.stream().map(a -> {
            UtilisateurAlerte ua = lectureMap.get(a.getId());
            boolean lu = ua != null && ua.isLu();
            LocalDateTime dateLecture = ua != null ? ua.getDateLecture() : null;

            return AlerteDto.builder()
                    .id(a.getId())
                    .titre(a.getTitre())
                    .message(a.getMessage())
                    .type(a.getType())
                    .dateDebut(a.getDateDebut())
                    .dateFin(a.getDateFin())
                    .niveau(a.getNiveau())
                    .statut(a.isStatut())
                    .culture(a.getCulture())
                    .lu(lu)
                    .dateLecture(dateLecture)
                    .createdAt(a.getCreatedAt())
                    .build();
        }).collect(Collectors.toList());
    }

    public Alerte getAlerteById(Long id) {
        return alerteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Alerte introuvable avec l'ID: " + id));
    }

    @Transactional
    public void markAsRead(Long alerteId, UserDetailsImpl userDetails) {
        Alerte alerte = getAlerteById(alerteId);
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

        UtilisateurAlerte ua = utilisateurAlerteRepository.findByUserIdAndAlerteId(user.getId(), alerte.getId())
                .orElseGet(() -> UtilisateurAlerte.builder()
                        .user(user)
                        .alerte(alerte)
                        .build());

        ua.setLu(true);
        ua.setDateLecture(LocalDateTime.now());
        utilisateurAlerteRepository.save(ua);
    }

    @Transactional
    public Alerte createAlerte(AlerteCreateDto dto, UserDetailsImpl userDetails) {
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

        Culture culture = null;
        if (dto.getCultureId() != null) {
            culture = cultureRepository.findById(dto.getCultureId())
                    .orElseThrow(() -> new ResourceNotFoundException("Culture non trouvée"));
        }

        Alerte alerte = Alerte.builder()
                .titre(dto.getTitre())
                .message(dto.getMessage())
                .type(dto.getType())
                .dateDebut(dto.getDateDebut() != null ? dto.getDateDebut() : LocalDate.now())
                .dateFin(dto.getDateFin())
                .niveau(dto.getNiveau())
                .statut(true)
                .culture(culture)
                .createur(user)
                .build();

        return alerteRepository.save(alerte);
    }
}