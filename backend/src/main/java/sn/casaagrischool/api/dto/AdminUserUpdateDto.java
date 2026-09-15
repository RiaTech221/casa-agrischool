package sn.casaagrischool.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import sn.casaagrischool.api.entity.enums.ERole;

import java.util.Set;

@Data
public class AdminUserUpdateDto {
    @NotBlank
    private String nom;

    @NotBlank
    private String prenom;

    @NotBlank
    private String telephone;

    @Email
    @NotBlank
    private String email;

    private String motDePasse; // Optionnel lors de la mise à jour

    private String localisation;

    private Set<ERole> roles;

    private Boolean actif;
}
