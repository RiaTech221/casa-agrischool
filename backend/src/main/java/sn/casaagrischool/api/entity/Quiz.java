package sn.casaagrischool.api.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "quiz")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Quiz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String titre;

    @Builder.Default
    private Integer dureeMinutes = 10;

    @Builder.Default
    private Integer scoreMinimum = 70; // 70% pour réussir

    @OneToOne
    @JoinColumn(name = "lecon_id", unique = true, nullable = false)
    @JsonIgnore
    private Lecon lecon;

    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("ordre ASC")
    @Builder.Default
    private List<QuestionQuiz> questions = new ArrayList<>();
}
