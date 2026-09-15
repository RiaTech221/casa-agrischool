package sn.casaagrischool.api.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sn.casaagrischool.api.dto.*;
import sn.casaagrischool.api.entity.*;
import sn.casaagrischool.api.entity.Module;
import sn.casaagrischool.api.entity.enums.StatutContenu;
import sn.casaagrischool.api.entity.enums.StatutProgression;
import sn.casaagrischool.api.exception.ResourceNotFoundException;
import sn.casaagrischool.api.repository.*;
import sn.casaagrischool.api.security.services.UserDetailsImpl;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExpertService {

    private final FormationRepository formationRepository;
    private final ModuleRepository moduleRepository;
    private final LeconRepository leconRepository;
    private final ProgressionFormationRepository progressionRepository;
    private final UserRepository userRepository;
    private final CultureRepository cultureRepository;

    public ExpertStatsDto getStats(Long expertId) {
        long totalFormations = formationRepository.countByCreateurId(expertId);
        List<Formation> formations = formationRepository.findByCreateurIdOrderByCreatedAtDesc(expertId);
        long totalLecons = formations.stream()
                .flatMap(f -> f.getModules() != null ? f.getModules().stream() : java.util.stream.Stream.empty())
                .mapToLong(m -> m.getLecons() != null ? m.getLecons().size() : 0)
                .sum();
        long totalApprenants = progressionRepository.countByFormationCreateurId(expertId);
        long totalTermines = progressionRepository.countByFormationCreateurIdAndStatut(expertId, StatutProgression.TERMINEE);

        return ExpertStatsDto.builder()
                .totalFormations(totalFormations)
                .totalLecons(totalLecons)
                .totalApprenants(totalApprenants)
                .totalTermines(totalTermines)
                .build();
    }

    public List<Formation> getMyFormations(Long expertId) {
        return formationRepository.findByCreateurIdOrderByCreatedAtDesc(expertId);
    }

    public List<ExpertApprenantDto> getMyApprenants(Long expertId) {
        List<ProgressionFormation> list = progressionRepository.findByFormationCreateurIdOrderByDateDebutDesc(expertId);
        return list.stream().map(p -> {
            User u = p.getUser();
            return ExpertApprenantDto.builder()
                    .id(p.getId())
                    .apprenantId(u.getId())
                    .nom(u.getNom())
                    .prenom(u.getPrenom())
                    .email(u.getEmail())
                    .telephone(u.getTelephone())
                    .localisation(u.getLocalisation())
                    .formationId(p.getFormation().getId())
                    .formationTitre(p.getFormation().getTitre())
                    .pourcentage(p.getPourcentage())
                    .statut(p.getStatut())
                    .dateDebut(p.getDateDebut())
                    .dateFin(p.getDateFin())
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional
    public Formation createFormation(FormationCreateDto dto, UserDetailsImpl userDetails) {
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

        Culture culture = null;
        if (dto.getCultureId() != null) {
            culture = cultureRepository.findById(dto.getCultureId())
                    .orElseThrow(() -> new ResourceNotFoundException("Culture non trouvée"));
        }

        // Restriction de domaine pour l'expert
        boolean isAdmin = userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin && user.getProfilExpert() != null && user.getProfilExpert().getSpecialite() != null && culture != null) {
            String spec = user.getProfilExpert().getSpecialite().toLowerCase();
            String cultNom = culture.getNom().toLowerCase();
            if (!spec.contains("général") && !spec.contains("tous") && !spec.contains("polyvalent") && !spec.contains(cultNom) && !spec.contains("agroécologie")) {
                throw new org.springframework.security.access.AccessDeniedException(
                        "En tant qu'expert, vous devez vous limiter aux formations de votre domaine d'expertise : " + user.getProfilExpert().getSpecialite());
            }
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
    public Formation updateFormation(Long id, FormationCreateDto dto, Long expertId, boolean isAdmin) {
        Formation existing = formationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Formation introuvable"));

        if (!isAdmin && (existing.getCreateur() == null || !existing.getCreateur().getId().equals(expertId))) {
            throw new RuntimeException("Accès refusé : vous ne pouvez modifier que vos propres formations");
        }

        existing.setTitre(dto.getTitre());
        existing.setDescription(dto.getDescription());
        if (dto.getNiveau() != null) existing.setNiveau(dto.getNiveau());
        if (dto.getImageUrl() != null) existing.setImageUrl(dto.getImageUrl());
        if (dto.getCultureId() != null) {
            Culture c = cultureRepository.findById(dto.getCultureId())
                    .orElseThrow(() -> new ResourceNotFoundException("Culture introuvable"));
            
            User user = userRepository.findById(expertId).orElse(null);
            if (!isAdmin && user != null && user.getProfilExpert() != null && user.getProfilExpert().getSpecialite() != null) {
                String spec = user.getProfilExpert().getSpecialite().toLowerCase();
                String cultNom = c.getNom().toLowerCase();
                if (!spec.contains("général") && !spec.contains("tous") && !spec.contains("polyvalent") && !spec.contains(cultNom) && !spec.contains("agroécologie")) {
                    throw new org.springframework.security.access.AccessDeniedException(
                            "Vous êtes limité aux formations de votre domaine : " + user.getProfilExpert().getSpecialite());
                }
            }
            existing.setCulture(c);
        }

        return formationRepository.save(existing);
    }

    @Transactional
    public MessageResponse deleteFormation(Long id, Long expertId, boolean isAdmin) {
        Formation existing = formationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Formation introuvable"));

        if (!isAdmin && (existing.getCreateur() == null || !existing.getCreateur().getId().equals(expertId))) {
            throw new RuntimeException("Accès refusé : vous ne pouvez supprimer que vos propres formations");
        }

        formationRepository.delete(existing);
        return new MessageResponse("Formation supprimée avec succès");
    }

    @Transactional
    public Module createModule(ModuleCreateDto dto, Long expertId, boolean isAdmin) {
        Formation formation = formationRepository.findById(dto.getFormationId())
                .orElseThrow(() -> new ResourceNotFoundException("Formation introuvable"));

        if (!isAdmin && (formation.getCreateur() == null || !formation.getCreateur().getId().equals(expertId))) {
            throw new RuntimeException("Accès refusé : vous ne pouvez ajouter des modules qu'à vos propres formations");
        }

        Module mod = Module.builder()
                .titre(dto.getTitre())
                .description(dto.getDescription())
                .ordre(dto.getOrdre() != null ? dto.getOrdre() : 1)
                .formation(formation)
                .build();

        return moduleRepository.save(mod);
    }

    @Transactional
    public MessageResponse deleteModule(Long moduleId, Long expertId, boolean isAdmin) {
        Module mod = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Module introuvable"));

        if (!isAdmin && (mod.getFormation().getCreateur() == null || !mod.getFormation().getCreateur().getId().equals(expertId))) {
            throw new RuntimeException("Accès refusé");
        }

        moduleRepository.delete(mod);
        return new MessageResponse("Module supprimé avec succès");
    }

    @Transactional
    public Lecon createLecon(LeconCreateDto dto, Long expertId, boolean isAdmin) {
        Module mod = moduleRepository.findById(dto.getModuleId())
                .orElseThrow(() -> new ResourceNotFoundException("Module introuvable"));

        if (!isAdmin && (mod.getFormation().getCreateur() == null || !mod.getFormation().getCreateur().getId().equals(expertId))) {
            throw new RuntimeException("Accès refusé : vous ne pouvez ajouter des leçons qu'à vos propres formations");
        }

        Lecon lecon = Lecon.builder()
                .titre(dto.getTitre())
                .contenu(dto.getContenu())
                .typeContenu(dto.getTypeContenu() != null ? dto.getTypeContenu() : sn.casaagrischool.api.entity.enums.TypeContenu.TEXTE)
                .ordre(dto.getOrdre() != null ? dto.getOrdre() : 1)
                .dureeEstimee(dto.getDureeEstimee() != null ? dto.getDureeEstimee() : 10)
                .fichierJointUrl(dto.getFichierJointUrl())
                .fichierJointNom(dto.getFichierJointNom())
                .module(mod)
                .build();

        return leconRepository.save(lecon);
    }

    @Transactional
    public Lecon updateLecon(Long leconId, LeconCreateDto dto, Long expertId, boolean isAdmin) {
        Lecon lecon = leconRepository.findById(leconId)
                .orElseThrow(() -> new ResourceNotFoundException("Leçon introuvable"));

        if (!isAdmin && (lecon.getModule().getFormation().getCreateur() == null || !lecon.getModule().getFormation().getCreateur().getId().equals(expertId))) {
            throw new RuntimeException("Accès refusé");
        }

        lecon.setTitre(dto.getTitre());
        lecon.setContenu(dto.getContenu());
        if (dto.getTypeContenu() != null) lecon.setTypeContenu(dto.getTypeContenu());
        if (dto.getOrdre() != null) lecon.setOrdre(dto.getOrdre());
        if (dto.getDureeEstimee() != null) lecon.setDureeEstimee(dto.getDureeEstimee());
        if (dto.getFichierJointUrl() != null) lecon.setFichierJointUrl(dto.getFichierJointUrl());
        if (dto.getFichierJointNom() != null) lecon.setFichierJointNom(dto.getFichierJointNom());

        return leconRepository.save(lecon);
    }

    @Transactional
    public MessageResponse deleteLecon(Long leconId, Long expertId, boolean isAdmin) {
        Lecon lecon = leconRepository.findById(leconId)
                .orElseThrow(() -> new ResourceNotFoundException("Leçon introuvable"));

        if (!isAdmin && (lecon.getModule().getFormation().getCreateur() == null || !lecon.getModule().getFormation().getCreateur().getId().equals(expertId))) {
            throw new RuntimeException("Accès refusé");
        }

        leconRepository.delete(lecon);
        return new MessageResponse("Leçon supprimée avec succès");
    }

    public List<Culture> getMyAllowedCultures(Long expertId) {
        User user = userRepository.findById(expertId).orElse(null);
        List<Culture> all = cultureRepository.findAll();
        if (user == null || user.getProfilExpert() == null || user.getProfilExpert().getSpecialite() == null) {
            return all;
        }

        String spec = user.getProfilExpert().getSpecialite().toLowerCase();
        if (spec.contains("général") || spec.contains("tous") || spec.contains("polyvalent") || spec.contains("agroécologie")) {
            return all;
        }

        return all.stream()
                .filter(c -> spec.contains(c.getNom().toLowerCase()))
                .toList();
    }
}
