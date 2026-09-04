package sn.casaagrischool.api.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Entity
@Table(name = "cultures")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Culture {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(unique = true, nullable = false, length = 100)
    private String nom; // ex: Tomate, Piment, Oignon, Gombo

    @Column(columnDefinition = "TEXT")
    private String description;

    private String imageUrl;

    @Builder.Default
    @Column(nullable = false)
    private boolean actif = true;
}
