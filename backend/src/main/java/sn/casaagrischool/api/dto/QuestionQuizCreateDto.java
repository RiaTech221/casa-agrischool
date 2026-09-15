package sn.casaagrischool.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.List;

@Data
public class QuestionQuizCreateDto {
    @NotBlank
    private String enonce;

    private Integer ordre = 1;

    private Integer points = 1;

    private List<ReponseQuizCreateDto> reponses;
}
