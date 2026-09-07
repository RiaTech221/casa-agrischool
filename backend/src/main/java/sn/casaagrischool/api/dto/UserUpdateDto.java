package sn.casaagrischool.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserUpdateDto {
    @NotBlank
    private String nom;
    
    @NotBlank
    private String prenom;
    
    @NotBlank
    private String telephone;
    
    private String localisation;
}
