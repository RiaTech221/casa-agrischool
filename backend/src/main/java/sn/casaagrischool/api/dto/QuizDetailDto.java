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
public class QuizDetailDto {
    private Long id;
    private String titre;
    private Integer dureeMinutes;
    private Integer scoreMinimum;
    private Long leconId;
    private List<QuestionQuizDto> questions;
}