package sn.casaagrischool.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReponseQuizDto {
    private Long id;
    private String texte;
    private Integer ordre;
}