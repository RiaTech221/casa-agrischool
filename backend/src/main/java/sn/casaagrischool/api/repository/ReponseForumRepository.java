package sn.casaagrischool.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sn.casaagrischool.api.entity.ReponseForum;

import java.util.List;

@Repository
public interface ReponseForumRepository extends JpaRepository<ReponseForum, Long> {
    List<ReponseForum> findByQuestionIdOrderByVotesDescCreatedAtAsc(Long questionId);
    List<ReponseForum> findByQuestionIdOrderByCreatedAtAsc(Long questionId);
}
