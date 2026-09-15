package sn.casaagrischool.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import sn.casaagrischool.api.entity.LeconValidation;

import java.util.List;
import java.util.Optional;

@Repository
public interface LeconValidationRepository extends JpaRepository<LeconValidation, Long> {

    boolean existsByUserIdAndLeconId(Long userId, Long leconId);

    Optional<LeconValidation> findByUserIdAndLeconId(Long userId, Long leconId);

    @Query("SELECT lv.lecon.id FROM LeconValidation lv WHERE lv.user.id = :userId AND lv.lecon.module.formation.id = :formationId")
    List<Long> findValidatedLeconIdsByUserIdAndFormationId(@Param("userId") Long userId, @Param("formationId") Long formationId);

    @Query("SELECT lv.lecon.id FROM LeconValidation lv WHERE lv.user.id = :userId AND lv.lecon.module.formation.id = :formationId AND (lv.lectureTerminee = true OR lv.scoreQuiz >= 70)")
    List<Long> findReadLeconIdsByUserIdAndFormationId(@Param("userId") Long userId, @Param("formationId") Long formationId);

    @Query("SELECT COUNT(lv) FROM LeconValidation lv WHERE lv.user.id = :userId AND lv.lecon.module.formation.id = :formationId AND lv.scoreQuiz >= 70")
    long countValidatedByUserIdAndFormationId(@Param("userId") Long userId, @Param("formationId") Long formationId);

    @Query("SELECT COUNT(lv) FROM LeconValidation lv WHERE lv.user.id = :userId AND lv.lecon.module.formation.id = :formationId AND (lv.scoreQuiz >= 70 OR lv.lectureTerminee = true)")
    long countByUserIdAndFormationId(@Param("userId") Long userId, @Param("formationId") Long formationId);

    void deleteByLeconId(Long leconId);
}
