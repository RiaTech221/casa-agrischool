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
public class QuestionQuizDto {
    private Long id;
    private String enonce;
    private Integer ordre;
    private Integer points;
    private List<ReponseQuizDto> reponses;
}