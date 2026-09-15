package sn.casaagrischool.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import sn.casaagrischool.api.entity.enums.StatutProgression;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpertApprenantDto {
    private Long id;
    private Long apprenantId;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private String localisation;
    private Long formationId;
    private String formationTitre;
    private Integer pourcentage;
    private StatutProgression statut;
    private LocalDateTime dateDebut;
    private LocalDateTime dateFin;
}
