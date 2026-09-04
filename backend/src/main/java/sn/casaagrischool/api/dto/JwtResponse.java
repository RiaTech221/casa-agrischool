package sn.casaagrischool.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JwtResponse {
    private String token;
    @Builder.Default
    private String type = "Bearer";
    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private String localisation;
    private Integer points;
    private List<String> roles;
    private ProfilExpertDto profilExpert;
}