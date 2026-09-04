package sn.casaagrischool.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sn.casaagrischool.api.entity.ProgressionFormation;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProgressionFormationRepository extends JpaRepository<ProgressionFormation, Long> {
    Optional<ProgressionFormation> findByUserIdAndFormationId(Long userId, Long formationId);
    List<ProgressionFormation> findByUserId(Long userId);
}
