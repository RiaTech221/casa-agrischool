package sn.casaagrischool.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sn.casaagrischool.api.entity.Culture;

import java.util.List;
import java.util.Optional;

@Repository
public interface CultureRepository extends JpaRepository<Culture, Long> {
    Optional<Culture> findByNomIgnoreCase(String nom);
    List<Culture> findByActifTrue();
}
