package sn.casaagrischool.api.entity;

import jakarta.persistence.*;
import lombok.*;
import sn.casaagrischool.api.entity.enums.ERole;

@Entity
@Table(name = "roles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(length = 30, unique = true, nullable = false)
    private ERole nom;

    private String description;
}
