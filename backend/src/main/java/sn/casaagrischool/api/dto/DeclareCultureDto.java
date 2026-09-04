package sn.casaagrischool.api.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import sn.casaagrischool.api.entity.enums.StatutCulture;

import java.time.LocalDate;

@Data
public class DeclareCultureDto {
    @NotNull
    private Long cultureId;
    private LocalDate dateDebut;
    private LocalDate dateFinPrevue;
    private Double superficieCultivee;
    private StatutCulture statut;
}