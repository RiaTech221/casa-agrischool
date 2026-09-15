package sn.casaagrischool.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpertStatsDto {
    private long totalFormations;
    private long totalLecons;
    private long totalApprenants;
    private long totalTermines;
}
