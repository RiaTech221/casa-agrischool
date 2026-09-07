package sn.casaagrischool.api.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sn.casaagrischool.api.dto.MessageResponse;
import sn.casaagrischool.api.entity.*;
import sn.casaagrischool.api.entity.Module;
import sn.casaagrischool.api.entity.enums.StatutContenu;
import sn.casaagrischool.api.entity.enums.StatutProgression;
import sn.casaagrischool.api.exception.ResourceNotFoundException;
import sn.casaagrischool.api.repository.*;
import sn.casaagrischool.api.security.services.UserDetailsImpl;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FormationService {

    private final FormationRepository formationRepository;
    private final ModuleRepository moduleRepository;
    private final LeconRepository leconRepository;
    private final ProgressionFormationRepository progressionRepository;
    private final UserRepository userRepository;

    public List<Formation> getAllPublishedFormations(Long cultureId) {
        if (cultureId != null) {
            return formationRepository.findByCultureIdAndStatut(cultureId, StatutContenu.PUBLIE);
        }
        return formationRepository.findByStatut(StatutContenu.PUBLIE);
    }

    public Formation getFormationById(Long id) {
        return formationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Formation introuvable avec l'ID: " + id));
    }

    public Module getModuleById(Long id) {
        return moduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Module introuvable avec l'ID: " + id));
    }

    public Lecon getLeconById(Long id) {
        return leconRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leçon introuvable avec l'ID: " + id));
    }

    public ProgressionFormation getProgression(Long formationId, UserDetailsImpl userDetails) {
        return progressionRepository.findByUserIdAndFormationId(userDetails.getId(), formationId)
                .orElseGet(() -> {
                    Formation f = getFormationById(formationId);
                    User u = userRepository.getReferenceById(userDetails.getId());
                    return ProgressionFormation.builder()
                            .formation(f)
                            .user(u)
                            .pourcentage(0)
                            .statut(StatutProgression.NON_COMMENCEE)
                            .build();
                });
    }

    @Transactional
    public MessageResponse completeLecon(Long leconId, UserDetailsImpl userDetails) {
        Lecon lecon = getLeconById(leconId);
        Formation formation = lecon.getModule().getFormation();
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

        ProgressionFormation prog = progressionRepository
                .findByUserIdAndFormationId(user.getId(), formation.getId())
                .orElseGet(() -> ProgressionFormation.builder()
                        .formation(formation)
                        .user(user)
                        .pourcentage(0)
                        .statut(StatutProgression.EN_COURS)
                        .dateDebut(LocalDateTime.now())
                        .build());

        // Calculer le pourcentage d'avancement
        long totalLecons = leconRepository.countByModuleFormationId(formation.getId());
        int nouveauPourcentage = Math.min(100, prog.getPourcentage() + (int) Math.ceil(100.0 / Math.max(1, totalLecons)));

        prog.setPourcentage(nouveauPourcentage);
        if (nouveauPourcentage >= 100) {
            prog.setStatut(StatutProgression.TERMINEE);
            prog.setDateFin(LocalDateTime.now());
            // Bonus formation terminée (+100 pts)
            user.setPoints(user.getPoints() + 100);
        } else {
            prog.setStatut(StatutProgression.EN_COURS);
        }

        // Récompense leçon terminée : +10 points
        user.setPoints(user.getPoints() + 10);
        userRepository.save(user);
        progressionRepository.save(prog);

        return new MessageResponse("Leçon validée ! +10 points gagnés.");
    }
    private final CultureRepository cultureRepository;

    @Transactional
    public Formation createFormation(sn.casaagrischool.api.dto.FormationCreateDto dto, UserDetailsImpl userDetails) {
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

        Culture culture = null;
        if (dto.getCultureId() != null) {
            culture = cultureRepository.findById(dto.getCultureId())
                    .orElseThrow(() -> new ResourceNotFoundException("Culture non trouvée"));
        }

        Formation formation = Formation.builder()
                .titre(dto.getTitre())
                .description(dto.getDescription())
                .niveau(dto.getNiveau() != null ? dto.getNiveau() : sn.casaagrischool.api.entity.enums.NiveauFormation.DEBUTANT)
                .imageUrl(dto.getImageUrl())
                .statut(StatutContenu.PUBLIE)
                .culture(culture)
                .createur(user)
                .build();

        return formationRepository.save(formation);
    }
}