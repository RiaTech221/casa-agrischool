package sn.casaagrischool.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sn.casaagrischool.api.entity.ResultatQuiz;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResultatQuizRepository extends JpaRepository<ResultatQuiz, Long> {
    List<ResultatQuiz> findByUserIdAndQuizId(Long userId, Long quizId);
    Optional<ResultatQuiz> findFirstByUserIdAndQuizIdOrderByDatePassageDesc(Long userId, Long quizId);
    List<ResultatQuiz> findByUserIdOrderByDatePassageDesc(Long userId);
}
