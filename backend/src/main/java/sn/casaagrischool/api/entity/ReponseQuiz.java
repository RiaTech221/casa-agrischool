package sn.casaagrischool.api.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Entity
@Table(name = "reponses_quiz")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReponseQuiz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(columnDefinition = "TEXT", nullable = false)
    private String texte;

    @Builder.Default
    @Column(nullable = false)
    private boolean estCorrecte = false;

    @Builder.Default
    private Integer ordre = 1;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_quiz_id", nullable = false)
    @JsonIgnore
    private QuestionQuiz questionQuiz;
}
