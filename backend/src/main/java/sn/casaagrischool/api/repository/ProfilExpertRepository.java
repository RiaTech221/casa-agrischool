package sn.casaagrischool.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sn.casaagrischool.api.entity.ProfilExpert;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProfilExpertRepository extends JpaRepository<ProfilExpert, Long> {
    Optional<ProfilExpert> findByUserId(Long userId);
    List<ProfilExpert> findByEstVerifieTrue();
}
