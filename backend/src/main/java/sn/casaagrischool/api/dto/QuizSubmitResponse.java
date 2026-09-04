package sn.casaagrischool.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizSubmitResponse {
    private Long resultatId;
    private Integer score; // en %
    private Integer nombreBonnesReponses;
    private Integer totalQuestions;
    private boolean reussi;
    private Integer pointsGagnes;
    private String message;
    private LocalDateTime datePassage;
    // Map de questionId -> ID de la bonne reponse (pour correction visuelle apres soumission)
    private Map<Long, Long> bonnesReponses;
}