package sn.casaagrischool.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sn.casaagrischool.api.entity.UtilisateurAlerte;

import java.util.List;
import java.util.Optional;

@Repository
public interface UtilisateurAlerteRepository extends JpaRepository<UtilisateurAlerte, Long> {
    Optional<UtilisateurAlerte> findByUserIdAndAlerteId(Long userId, Long alerteId);
    List<UtilisateurAlerte> findByUserId(Long userId);
    List<UtilisateurAlerte> findByUserIdAndLuFalse(Long userId);
}
