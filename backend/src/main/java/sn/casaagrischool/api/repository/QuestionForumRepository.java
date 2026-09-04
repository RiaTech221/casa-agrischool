package sn.casaagrischool.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import sn.casaagrischool.api.entity.QuestionForum;

import java.util.List;

@Repository
public interface QuestionForumRepository extends JpaRepository<QuestionForum, Long> {
    List<QuestionForum> findAllByOrderByCreatedAtDesc();
    List<QuestionForum> findByCategorieIdOrderByCreatedAtDesc(Long categorieId);
    List<QuestionForum> findByCultureIdOrderByCreatedAtDesc(Long cultureId);

    @Query("SELECT q FROM QuestionForum q WHERE LOWER(q.titre) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(q.contenu) LIKE LOWER(CONCAT('%', :query, '%')) ORDER BY q.createdAt DESC")
    List<QuestionForum> searchByQuery(@Param("query") String query);
}
