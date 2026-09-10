package sn.casaagrischool.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import sn.casaagrischool.api.entity.enums.NiveauFormation;

@Data
public class FormationCreateDto {
    @NotBlank
    private String titre;
    @NotBlank
    private String description;
    private NiveauFormation niveau;
    private String imageUrl;
    private Long cultureId;
}