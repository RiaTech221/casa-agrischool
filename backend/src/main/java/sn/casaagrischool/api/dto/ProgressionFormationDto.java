package sn.casaagrischool.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import sn.casaagrischool.api.entity.enums.StatutProgression;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProgressionFormationDto {
    private Long id;
    private Long formationId;
    private Integer pourcentage;
    private StatutProgression statut;
    private LocalDateTime dateDebut;
    private LocalDateTime dateFin;
    private boolean estInscrit;

    @Builder.Default
    private List<Long> leconsValideesIds = new ArrayList<>();

    @Builder.Default
    private List<Long> leconsLuesIds = new ArrayList<>();
}
