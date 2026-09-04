package sn.casaagrischool.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sn.casaagrischool.api.entity.Role;
import sn.casaagrischool.api.entity.enums.ERole;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByNom(ERole nom);
}
