package sn.casaagrischool.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import sn.casaagrischool.api.entity.Alerte;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AlerteRepository extends JpaRepository<Alerte, Long> {
    List<Alerte> findByStatutTrue();

    @Query("SELECT a FROM Alerte a WHERE a.statut = true " +
           "AND (a.dateDebut IS NULL OR a.dateDebut <= :today) " +
           "AND (a.dateFin IS NULL OR a.dateFin >= :today) " +
           "AND (a.culture IS NULL OR a.culture.id IN :cultureIds)")
    List<Alerte> findActiveAlertesForCultures(@Param("today") LocalDate today, @Param("cultureIds") List<Long> cultureIds);

    @Query("SELECT a FROM Alerte a WHERE a.statut = true " +
           "AND (a.dateDebut IS NULL OR a.dateDebut <= :today) " +
           "AND (a.dateFin IS NULL OR a.dateFin >= :today) " +
           "AND a.culture IS NULL")
    List<Alerte> findActiveGeneralAlertes(@Param("today") LocalDate today);
}
