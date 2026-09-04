package sn.casaagrischool.api.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Entity
@Table(name = "categories_forum")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategorieForum {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(unique = true, nullable = false)
    private String nom;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String icone; // nom d'icone Lucide (ex: ShieldAlert, Sprout, Droplets, Landmark)
}
