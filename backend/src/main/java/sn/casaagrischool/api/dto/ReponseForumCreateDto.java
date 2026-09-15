package sn.casaagrischool.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ReponseForumCreateDto {
    @NotBlank
    private String contenu;

    private String auteurNom;
}