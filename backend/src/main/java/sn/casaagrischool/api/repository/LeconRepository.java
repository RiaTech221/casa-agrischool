package sn.casaagrischool.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sn.casaagrischool.api.entity.Lecon;

import java.util.List;

@Repository
public interface LeconRepository extends JpaRepository<Lecon, Long> {
    List<Lecon> findByModuleIdOrderByOrdreAsc(Long moduleId);
    long countByModuleFormationId(Long formationId);
}
