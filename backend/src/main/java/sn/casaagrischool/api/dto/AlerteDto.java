package sn.casaagrischool.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import sn.casaagrischool.api.entity.Culture;
import sn.casaagrischool.api.entity.enums.NiveauAlerte;
import sn.casaagrischool.api.entity.enums.TypeAlerte;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlerteDto {
    private Long id;
    private String titre;
    private String message;
    private TypeAlerte type;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private NiveauAlerte niveau;
    private boolean statut;
    private Culture culture;
    private boolean lu;
    private LocalDateTime dateLecture;
    private LocalDateTime createdAt;
}