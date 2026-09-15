package sn.casaagrischool.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import sn.casaagrischool.api.entity.enums.TypeContenu;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeconCreateDto {
    @NotBlank
    private String titre;
    private String contenu;
    private TypeContenu typeContenu;
    private Integer ordre;
    private Integer dureeEstimee;
    private String fichierJointUrl;
    private String fichierJointNom;
    @NotNull
    private Long moduleId;
}
