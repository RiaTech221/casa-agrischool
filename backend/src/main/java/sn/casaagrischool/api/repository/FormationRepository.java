package sn.casaagrischool.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sn.casaagrischool.api.entity.Formation;
import sn.casaagrischool.api.entity.enums.StatutContenu;

import java.util.List;

@Repository
public interface FormationRepository extends JpaRepository<Formation, Long> {
    List<Formation> findByStatut(StatutContenu statut);
    List<Formation> findByCultureIdAndStatut(Long cultureId, StatutContenu statut);
    List<Formation> findByCreateurIdOrderByCreatedAtDesc(Long createurId);
    long countByCreateurId(Long createurId);
}
