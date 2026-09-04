package sn.casaagrischool.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import sn.casaagrischool.api.entity.enums.NiveauAlerte;
import sn.casaagrischool.api.entity.enums.TypeAlerte;

import java.time.LocalDate;

@Data
public class AlerteCreateDto {
    @NotBlank
    private String titre;
    @NotBlank
    private String message;
    @NotNull
    private TypeAlerte type;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    @NotNull
    private NiveauAlerte niveau;
    private Long cultureId; // Null si alerte générale
}