package sn.casaagrischool.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class QuestionForumCreateDto {
    @NotBlank
    private String titre;

    @NotBlank
    private String contenu;

    private String imageUrl;

    @NotNull
    private Long categorieId;

    private Long cultureId;
}