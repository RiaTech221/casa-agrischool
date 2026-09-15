package sn.casaagrischool.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ReponseQuizCreateDto {
    @NotBlank
    private String texte;

    private boolean estCorrecte = false;

    private Integer ordre = 1;
}
