package sn.casaagrischool.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsDto {
    private long totalUsers;
    private long totalMaraichers;
    private long totalExperts;
    private long totalExpertsEnAttente;
    private long totalExploitations;
    private long totalFormations;
    private long totalAlertesActives;
    private long totalQuestionsForum;
    private long totalQuestionsResolues;
}