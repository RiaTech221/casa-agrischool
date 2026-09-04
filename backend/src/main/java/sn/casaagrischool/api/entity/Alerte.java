package sn.casaagrischool.api.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import sn.casaagrischool.api.entity.enums.NiveauAlerte;
import sn.casaagrischool.api.entity.enums.TypeAlerte;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "alertes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Alerte {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String titre;

    @NotBlank
    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private TypeAlerte type = TypeAlerte.PARASITE;

    private LocalDate dateDebut;

    private LocalDate dateFin;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private NiveauAlerte niveau = NiveauAlerte.ATTENTION;

    @Builder.Default
    @Column(nullable = false)
    private boolean statut = true; // active ou non

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "culture_id")
    private Culture culture; // Nullable si alerte générale

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "createur_id")
    @JsonIgnore
    private User createur;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
