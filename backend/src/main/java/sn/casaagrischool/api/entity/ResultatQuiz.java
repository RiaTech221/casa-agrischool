package sn.casaagrischool.api.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "resultats_quiz")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResultatQuiz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer score; // en %

    private Integer nombreBonnesReponses;

    private Integer totalQuestions;

    @Builder.Default
    private boolean reussi = false;

    private LocalDateTime datePassage;

    private Integer dureeReelleSecondes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;
}
