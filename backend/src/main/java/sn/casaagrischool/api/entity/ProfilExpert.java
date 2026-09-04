package sn.casaagrischool.api.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "profils_experts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfilExpert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String specialite; // ex: Maraîchage agroécologique, Protection des cultures

    @Column(columnDefinition = "TEXT")
    private String biographie;

    private String organisme; // ex: ISRA, ANCIS, Direction Régionale du Développement Rural

    @Builder.Default
    @Column(nullable = false)
    private boolean estVerifie = false;

    private LocalDateTime dateVerification;

    @JsonIgnore
    @OneToOne
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    private User user;
}
