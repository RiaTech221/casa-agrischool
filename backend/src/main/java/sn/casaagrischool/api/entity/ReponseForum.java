package sn.casaagrischool.api.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "reponses_forum")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReponseForum {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(columnDefinition = "TEXT", nullable = false)
    private String contenu;

    @Builder.Default
    @Column(nullable = false)
    private boolean estMeilleureReponse = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_forum_id", nullable = false)
    @JsonIgnore
    private QuestionForum question;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "auteur_id", nullable = false)
    private User auteur;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
