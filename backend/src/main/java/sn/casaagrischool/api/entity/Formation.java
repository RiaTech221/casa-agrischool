package sn.casaagrischool.api.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import sn.casaagrischool.api.entity.enums.NiveauFormation;
import sn.casaagrischool.api.entity.enums.StatutContenu;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "formations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Formation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String titre;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private NiveauFormation niveau = NiveauFormation.DEBUTANT;

    private String imageUrl;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private StatutContenu statut = StatutContenu.PUBLIE;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "culture_id")
    private Culture culture;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "createur_id")
    @JsonIgnore
    private User createur;

    @OneToMany(mappedBy = "formation", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("ordre ASC")
    @Builder.Default
    private List<Module> modules = new ArrayList<>();

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
