package sn.casaagrischool.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
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
    @Size(min = 10, message = "Le mot de passe doit contenir au moins 10 caractères")
    @Pattern(regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=_!]).*$", 
             message = "Le mot de passe doit contenir au moins un chiffre, une minuscule, une majuscule et un caractère spécial")
    private String motDePasse;

    private String localisation;

    private ERole role; // Par défaut ROLE_MARAICHER si null

    // Informations complémentaires pour un expert
    private String specialite;
    private String biographie;
    private String organisme;
}