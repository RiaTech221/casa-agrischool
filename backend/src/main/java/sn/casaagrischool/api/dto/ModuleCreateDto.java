package sn.casaagrischool.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModuleCreateDto {
    @NotBlank
    private String titre;
    private String description;
    private Integer ordre;
    @NotNull
    private Long formationId;
}
