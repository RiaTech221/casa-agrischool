package sn.casaagrischool.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import sn.casaagrischool.api.entity.enums.ERole;

@Data
public class RegisterRequest {
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

    private ERole role; // Par défaut ROLE_MARAICHER si null

    // Informations complémentaires pour un expert
    private String specialite;
    private String biographie;
    private String organisme;
}