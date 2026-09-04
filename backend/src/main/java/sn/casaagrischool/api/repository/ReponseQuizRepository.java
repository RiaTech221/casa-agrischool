package sn.casaagrischool.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sn.casaagrischool.api.entity.ReponseQuiz;

import java.util.List;

@Repository
public interface ReponseQuizRepository extends JpaRepository<ReponseQuiz, Long> {
    List<ReponseQuiz> findByQuestionQuizIdOrderByOrdreAsc(Long questionQuizId);
}
