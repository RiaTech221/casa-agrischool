package sn.casaagrischool.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank
    private String identifiant; // email ou telephone

    @NotBlank
    private String motDePasse;
}