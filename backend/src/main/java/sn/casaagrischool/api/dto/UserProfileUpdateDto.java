package sn.casaagrischool.api.dto;

import lombok.Data;

@Data
public class UserProfileUpdateDto {
    private String nom;
    private String prenom;
    private String telephone;
    private String localisation;

    // Champs pour expert
    private String specialite;
    private String biographie;
    private String organisme;
}