package sn.casaagrischool.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sn.casaagrischool.api.entity.QuestionQuiz;

import java.util.List;

@Repository
public interface QuestionQuizRepository extends JpaRepository<QuestionQuiz, Long> {
    List<QuestionQuiz> findByQuizIdOrderByOrdreAsc(Long quizId);
}
