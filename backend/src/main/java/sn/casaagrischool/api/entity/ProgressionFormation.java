package sn.casaagrischool.api.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import sn.casaagrischool.api.entity.enums.StatutProgression;

import java.time.LocalDateTime;

@Entity
@Table(name = "progressions_formations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProgressionFormation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Builder.Default
    private Integer pourcentage = 0;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private StatutProgression statut = StatutProgression.NON_COMMENCEE;

    private LocalDateTime dateDebut;

    private LocalDateTime dateFin;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "formation_id", nullable = false)
    private Formation formation;
}
