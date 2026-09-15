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
    @JoinColumn(name = "auteur_id", nullable = true)
    private User auteur;

    private String auteurNom;

    @Builder.Default
    private Integer votes = 0;

    @Builder.Default
    private Double noteMoyenne = 0.0;

    @Builder.Default
    private Integer totalVotes = 0;

    @Builder.Default
    private Integer etoiles = 0;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
