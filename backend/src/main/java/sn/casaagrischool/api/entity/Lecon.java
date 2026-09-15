package sn.casaagrischool.api.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import sn.casaagrischool.api.entity.enums.TypeContenu;

@Entity
@Table(name = "lecons")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Lecon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String titre;

    @Column(columnDefinition = "LONGTEXT")
    private String contenu;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private TypeContenu typeContenu = TypeContenu.TEXTE;

    @Builder.Default
    private Integer ordre = 1;

    @Builder.Default
    private Integer dureeEstimee = 10; // minutes

    @Column(columnDefinition = "TEXT")
    private String fichierJointUrl;

    private String fichierJointNom;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "module_id", nullable = false)
    @JsonIgnore
    private Module module;

    @OneToOne(mappedBy = "lecon", cascade = CascadeType.ALL)
    private Quiz quiz;
}
