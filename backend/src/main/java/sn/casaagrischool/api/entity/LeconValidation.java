package sn.casaagrischool.api.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "lecons_validees", uniqueConstraints = {
        @UniqueConstraint(name = "uk_user_lecon", columnNames = {"user_id", "lecon_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeconValidation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lecon_id", nullable = false)
    private Lecon lecon;

    @Column(nullable = false)
    private LocalDateTime dateValidation;

    private Integer scoreQuiz;

    @Builder.Default
    @Column(nullable = false)
    private boolean lectureTerminee = false;
}
