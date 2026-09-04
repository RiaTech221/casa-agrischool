package sn.casaagrischool.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sn.casaagrischool.api.entity.CategorieForum;

import java.util.Optional;

@Repository
public interface CategorieForumRepository extends JpaRepository<CategorieForum, Long> {
    Optional<CategorieForum> findByNom(String nom);
}
