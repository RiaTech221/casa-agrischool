package sn.casaagrischool.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class QuizCreateDto {
    @NotBlank
    private String titre;

    private Integer dureeMinutes = 5;

    private Integer scoreMinimum = 70;

    @NotNull
    private Long leconId;

    private List<QuestionQuizCreateDto> questions;
}
