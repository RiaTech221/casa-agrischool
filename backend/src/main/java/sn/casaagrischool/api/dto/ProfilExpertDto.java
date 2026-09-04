package sn.casaagrischool.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfilExpertDto {
    private Long id;
    private String specialite;
    private String biographie;
    private String organisme;
    private boolean estVerifie;
    private LocalDateTime dateVerification;
}