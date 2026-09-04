package sn.casaagrischool.api.dto;

import lombok.Data;
import java.util.Map;

@Data
public class QuizSubmitRequest {
    // Map of questionId -> selectedReponseId
    private Map<Long, Long> reponsesChoisies;
    private Integer dureeReelleSecondes;
}