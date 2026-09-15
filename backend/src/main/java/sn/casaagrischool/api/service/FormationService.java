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
    private final CultureRepository cultureRepository;

    private final LeconValidationRepository leconValidationRepository;

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

    public List<Formation> getMesCoursInscrits(UserDetailsImpl userDetails) {
        List<ProgressionFormation> progressions = progressionRepository.findByUserId(userDetails.getId());
        return progressions.stream()
                .map(ProgressionFormation::getFormation)
                .filter(f -> f != null && f.getStatut() == StatutContenu.PUBLIE)
                .distinct()
                .toList();
    }

    public sn.casaagrischool.api.dto.ProgressionFormationDto getProgression(Long formationId, UserDetailsImpl userDetails) {
        ProgressionFormation prog = progressionRepository.findByUserIdAndFormationId(userDetails.getId(), formationId)
                .orElse(null);

        List<Long> validatedLessonIds = leconValidationRepository.findValidatedLeconIdsByUserIdAndFormationId(userDetails.getId(), formationId);
        List<Long> readLessonIds = leconValidationRepository.findReadLeconIdsByUserIdAndFormationId(userDetails.getId(), formationId);

        return sn.casaagrischool.api.dto.ProgressionFormationDto.builder()
                .id(prog != null ? prog.getId() : null)
                .formationId(formationId)
                .pourcentage(prog != null ? prog.getPourcentage() : 0)
                .statut(prog != null ? prog.getStatut() : StatutProgression.NON_COMMENCEE)
                .dateDebut(prog != null ? prog.getDateDebut() : null)
                .dateFin(prog != null ? prog.getDateFin() : null)
                .estInscrit(prog != null)
                .leconsValideesIds(validatedLessonIds)
                .leconsLuesIds(readLessonIds)
                .build();
    }

    @Transactional
    public sn.casaagrischool.api.dto.ProgressionFormationDto inscrireFormation(Long formationId, UserDetailsImpl userDetails) {
        Formation formation = getFormationById(formationId);
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

        ProgressionFormation prog = progressionRepository.findByUserIdAndFormationId(user.getId(), formationId)
                .orElseGet(() -> {
                    ProgressionFormation newProg = ProgressionFormation.builder()
                            .formation(formation)
                            .user(user)
                            .pourcentage(0)
                            .statut(StatutProgression.EN_COURS)
                            .dateDebut(LocalDateTime.now())
                            .build();
                    return progressionRepository.save(newProg);
                });

        return getProgression(formationId, userDetails);
    }

    @Transactional
    public MessageResponse terminerLectureLecon(Long leconId, UserDetailsImpl userDetails) {
        Lecon lecon = getLeconById(leconId);
        Formation formation = lecon.getModule().getFormation();
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

        // Assurer que l'utilisateur est inscrit à la formation
        progressionRepository.findByUserIdAndFormationId(user.getId(), formation.getId())
                .orElseGet(() -> progressionRepository.save(ProgressionFormation.builder()
                        .formation(formation)
                        .user(user)
                        .pourcentage(0)
                        .statut(StatutProgression.EN_COURS)
                        .dateDebut(LocalDateTime.now())
                        .build()));

        LeconValidation validation = leconValidationRepository.findByUserIdAndLeconId(user.getId(), leconId)
                .orElseGet(() -> LeconValidation.builder()
                        .user(user)
                        .lecon(lecon)
                        .dateValidation(LocalDateTime.now())
                        .lectureTerminee(true)
                        .scoreQuiz(0)
                        .build());

        validation.setLectureTerminee(true);
        leconValidationRepository.save(validation);

        return new MessageResponse("Lecture terminée avec succès ! Le quiz d'évaluation est désormais débloqué.");
    }

    @Transactional
    public MessageResponse completeLecon(Long leconId, UserDetailsImpl userDetails) {
        Lecon lecon = getLeconById(leconId);
        Formation formation = lecon.getModule().getFormation();
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

        // Règle Casa AgriSchool : si la leçon a un quiz, la validation doit passer par le quiz
        if (lecon.getQuiz() != null) {
            throw new RuntimeException("Cette leçon comporte un quiz obligatoire. Vous devez réussir le quiz (>= " + lecon.getQuiz().getScoreMinimum() + "%) pour la valider.");
        }

        // Vérifier si déjà validée
        if (leconValidationRepository.existsByUserIdAndLeconId(user.getId(), leconId)) {
            return new MessageResponse("Leçon déjà validée précédemment. Aucun point supplémentaire.");
        }

        // Enregistrer la validation
        LeconValidation validation = LeconValidation.builder()
                .user(user)
                .lecon(lecon)
                .dateValidation(LocalDateTime.now())
                .scoreQuiz(100)
                .build();
        leconValidationRepository.save(validation);

        ProgressionFormation prog = progressionRepository
                .findByUserIdAndFormationId(user.getId(), formation.getId())
                .orElseGet(() -> ProgressionFormation.builder()
                        .formation(formation)
                        .user(user)
                        .pourcentage(0)
                        .statut(StatutProgression.EN_COURS)
                        .dateDebut(LocalDateTime.now())
                        .build());

        long totalLecons = leconRepository.countByModuleFormationId(formation.getId());
        long validCount = leconValidationRepository.countByUserIdAndFormationId(user.getId(), formation.getId());
        int nouveauPourcentage = totalLecons > 0 ? (int) Math.round(((double) validCount / totalLecons) * 100.0) : 100;

        prog.setPourcentage(nouveauPourcentage);
        if (nouveauPourcentage >= 100 && prog.getStatut() != StatutProgression.TERMINEE) {
            prog.setStatut(StatutProgression.TERMINEE);
            prog.setDateFin(LocalDateTime.now());
            user.setPoints(user.getPoints() + 100);
        } else {
            prog.setStatut(StatutProgression.EN_COURS);
        }

        user.setPoints(user.getPoints() + 10);
        userRepository.save(user);
        progressionRepository.save(prog);

        return new MessageResponse("Leçon validée ! +10 points gagnés.");
    }
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

    @Transactional
    public Formation updateFormation(Long id, Formation formation) {
        Formation existing = getFormationById(id);
        existing.setTitre(formation.getTitre());
        existing.setDescription(formation.getDescription());
        existing.setNiveau(formation.getNiveau());
        existing.setStatut(formation.getStatut());
        existing.setImageUrl(formation.getImageUrl());
        return formationRepository.save(existing);
    }

    @Transactional
    public void deleteFormation(Long id) {
        Formation existing = getFormationById(id);
        formationRepository.delete(existing);
    }
}