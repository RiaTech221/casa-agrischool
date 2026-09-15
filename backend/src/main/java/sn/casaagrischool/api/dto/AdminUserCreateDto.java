package sn.casaagrischool.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import sn.casaagrischool.api.entity.enums.ERole;

import java.util.Set;

@Data
public class AdminUserCreateDto {
    @NotBlank
    private String nom;

    @NotBlank
    private String prenom;

    @NotBlank
    private String telephone;

    @Email
    @NotBlank
    private String email;

    @NotBlank
    private String motDePasse;

    private String localisation;

    private Set<ERole> roles;

    private boolean actif = true;
}
