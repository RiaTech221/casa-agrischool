package sn.casaagrischool.api.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sn.casaagrischool.api.dto.*;
import sn.casaagrischool.api.entity.*;
import sn.casaagrischool.api.exception.ResourceNotFoundException;
import sn.casaagrischool.api.repository.*;
import sn.casaagrischool.api.security.services.UserDetailsImpl;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuestionQuizRepository questionQuizRepository;
    private final ReponseQuizRepository reponseQuizRepository;
    private final ResultatQuizRepository resultatQuizRepository;
    private final UserRepository userRepository;
    private final LeconRepository leconRepository;
    private final LeconValidationRepository leconValidationRepository;
    private final ProgressionFormationRepository progressionRepository;

    public QuizDetailDto getQuizById(Long quizId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz introuvable avec l'ID: " + quizId));

        List<QuestionQuiz> questions = questionQuizRepository.findByQuizIdOrderByOrdreAsc(quizId);

        List<QuestionQuizDto> questionDtos = questions.stream().map(q -> {
            List<ReponseQuiz> reponses = reponseQuizRepository.findByQuestionQuizIdOrderByOrdreAsc(q.getId());
            List<ReponseQuizDto> reponseDtos = reponses.stream().map(r ->
                    ReponseQuizDto.builder()
                            .id(r.getId())
                            .texte(r.getTexte())
                            .ordre(r.getOrdre())
                            .build() // IMPORTANT: On ne transmet PAS estCorrecte au frontend
            ).collect(Collectors.toList());

            return QuestionQuizDto.builder()
                    .id(q.getId())
                    .enonce(q.getEnonce())
                    .ordre(q.getOrdre())
                    .points(q.getPoints())
                    .reponses(reponseDtos)
                    .build();
        }).collect(Collectors.toList());

        return QuizDetailDto.builder()
                .id(quiz.getId())
                .titre(quiz.getTitre())
                .dureeMinutes(quiz.getDureeMinutes())
                .scoreMinimum(quiz.getScoreMinimum())
                .leconId(quiz.getLecon().getId())
                .questions(questionDtos)
                .build();
    }

    @Transactional
    public QuizSubmitResponse submitQuiz(Long quizId, QuizSubmitRequest request, UserDetailsImpl userDetails) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz introuvable avec l'ID: " + quizId));

        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));

        List<QuestionQuiz> questions = questionQuizRepository.findByQuizIdOrderByOrdreAsc(quizId);
        int totalQuestions = questions.size();
        int bonnesReponses = 0;
        Map<Long, Long> mapBonnesReponses = new HashMap<>();

        Map<Long, Long> userReponses = request.getReponsesChoisies() != null ? request.getReponsesChoisies() : new HashMap<>();

        for (QuestionQuiz q : questions) {
            List<ReponseQuiz> choices = reponseQuizRepository.findByQuestionQuizIdOrderByOrdreAsc(q.getId());
            ReponseQuiz correctChoice = choices.stream()
                    .filter(ReponseQuiz::isEstCorrecte)
                    .findFirst()
                    .orElse(null);

            if (correctChoice != null) {
                mapBonnesReponses.put(q.getId(), correctChoice.getId());
                Long userChoiceId = userReponses.get(q.getId());
                if (userChoiceId != null && userChoiceId.equals(correctChoice.getId())) {
                    bonnesReponses++;
                }
            }
        }

        int scorePourcent = totalQuestions > 0 ? (int) Math.round(((double) bonnesReponses / totalQuestions) * 100.0) : 0;
        boolean reussi = scorePourcent >= quiz.getScoreMinimum();
        int pointsGagnes = 0;

        Lecon lecon = quiz.getLecon();
        Formation formation = (lecon != null && lecon.getModule() != null) ? lecon.getModule().getFormation() : null;
        boolean dejaValidee = lecon != null && leconValidationRepository.existsByUserIdAndLeconId(user.getId(), lecon.getId());

        String message;

        if (reussi) {
            if (!dejaValidee && lecon != null && formation != null) {
                // Première réussite : validation officielle de la leçon et attribution des points
                pointsGagnes = 20; // +20 points pour la réussite du quiz
                user.setPoints(user.getPoints() + pointsGagnes);

                LeconValidation validation = LeconValidation.builder()
                        .user(user)
                        .lecon(lecon)
                        .dateValidation(LocalDateTime.now())
                        .scoreQuiz(scorePourcent)
                        .build();
                leconValidationRepository.save(validation);

                // Mettre à jour la progression de la formation
                ProgressionFormation prog = progressionRepository
                        .findByUserIdAndFormationId(user.getId(), formation.getId())
                        .orElseGet(() -> ProgressionFormation.builder()
                                .formation(formation)
                                .user(user)
                                .pourcentage(0)
                                .statut(sn.casaagrischool.api.entity.enums.StatutProgression.EN_COURS)
                                .dateDebut(LocalDateTime.now())
                                .build());

                long totalLecons = leconRepository.countByModuleFormationId(formation.getId());
                long validCount = leconValidationRepository.countByUserIdAndFormationId(user.getId(), formation.getId());
                int nouveauPourcentage = totalLecons > 0 ? (int) Math.round(((double) validCount / totalLecons) * 100.0) : 100;

                prog.setPourcentage(nouveauPourcentage);
                if (nouveauPourcentage >= 100 && prog.getStatut() != sn.casaagrischool.api.entity.enums.StatutProgression.TERMINEE) {
                    prog.setStatut(sn.casaagrischool.api.entity.enums.StatutProgression.TERMINEE);
                    prog.setDateFin(LocalDateTime.now());
                    user.setPoints(user.getPoints() + 100); // Bonus formation complète
                    pointsGagnes += 100;
                    message = "Félicitations ! Vous avez réussi avec " + scorePourcent + "% ! Leçon validée (+20 pts) et formation terminée avec succès (+100 pts bonus) !";
                } else {
                    prog.setStatut(sn.casaagrischool.api.entity.enums.StatutProgression.EN_COURS);
                    message = "Félicitations ! Vous avez réussi le quiz avec " + scorePourcent + "%. Leçon validée ! +" + pointsGagnes + " points attribués. La leçon suivante est débloquée !";
                }

                userRepository.save(user);
                progressionRepository.save(prog);
            } else {
                pointsGagnes = 0; // Aucun point supplémentaire en cas de re-passage
                if (lecon != null) {
                    leconValidationRepository.findByUserIdAndLeconId(user.getId(), lecon.getId())
                            .ifPresent(v -> {
                                if (v.getScoreQuiz() == null || scorePourcent > v.getScoreQuiz()) {
                                    v.setScoreQuiz(scorePourcent);
                                    leconValidationRepository.save(v);
                                }
                            });
                }
                message = "Félicitations ! Vous avez réussi le quiz avec " + scorePourcent + "%. (Leçon déjà validée précédemment, aucun point supplémentaire attribué).";
            }
        } else {
            message = "Score insuffisant (" + scorePourcent + "%). Le score minimum requis pour valider cette leçon et débloquer la suite est de " + quiz.getScoreMinimum() + "%. Réessayez !";
        }

        ResultatQuiz resultat = ResultatQuiz.builder()
                .quiz(quiz)
                .user(user)
                .score(scorePourcent)
                .nombreBonnesReponses(bonnesReponses)
                .totalQuestions(totalQuestions)
                .reussi(reussi)
                .dureeReelleSecondes(request.getDureeReelleSecondes())
                .datePassage(LocalDateTime.now())
                .build();

        ResultatQuiz saved = resultatQuizRepository.save(resultat);

        return QuizSubmitResponse.builder()
                .resultatId(saved.getId())
                .score(scorePourcent)
                .nombreBonnesReponses(bonnesReponses)
                .totalQuestions(totalQuestions)
                .reussi(reussi)
                .pointsGagnes(pointsGagnes)
                .message(message)
                .datePassage(saved.getDatePassage())
                .bonnesReponses(mapBonnesReponses)
                .build();
    }

    public QuizDetailDto getQuizByLeconId(Long leconId) {
        Quiz quiz = quizRepository.findByLeconId(leconId)
                .orElseThrow(() -> new ResourceNotFoundException("Aucun quiz associé à la leçon ID: " + leconId));
        return getQuizById(quiz.getId());
    }

    @Transactional
    public QuizDetailDto createQuiz(QuizCreateDto dto) {
        Lecon lecon = leconRepository.findById(dto.getLeconId())
                .orElseThrow(() -> new ResourceNotFoundException("Leçon introuvable avec l'ID: " + dto.getLeconId()));

        if (quizRepository.findByLeconId(dto.getLeconId()).isPresent()) {
            throw new RuntimeException("Un quiz existe déjà pour cette leçon.");
        }

        Quiz quiz = Quiz.builder()
                .titre(dto.getTitre())
                .dureeMinutes(dto.getDureeMinutes() != null ? dto.getDureeMinutes() : 5)
                .scoreMinimum(dto.getScoreMinimum() != null ? dto.getScoreMinimum() : 70)
                .lecon(lecon)
                .build();

        Quiz savedQuiz = quizRepository.save(quiz);

        if (dto.getQuestions() != null) {
            int qOrdre = 1;
            for (QuestionQuizCreateDto qDto : dto.getQuestions()) {
                QuestionQuiz question = QuestionQuiz.builder()
                        .quiz(savedQuiz)
                        .enonce(qDto.getEnonce())
                        .ordre(qDto.getOrdre() != null ? qDto.getOrdre() : qOrdre++)
                        .points(qDto.getPoints() != null ? qDto.getPoints() : 1)
                        .build();
                QuestionQuiz savedQuestion = questionQuizRepository.save(question);

                if (qDto.getReponses() != null) {
                    int rOrdre = 1;
                    for (ReponseQuizCreateDto rDto : qDto.getReponses()) {
                        ReponseQuiz reponse = ReponseQuiz.builder()
                                .questionQuiz(savedQuestion)
                                .texte(rDto.getTexte())
                                .estCorrecte(rDto.isEstCorrecte())
                                .ordre(rDto.getOrdre() != null ? rDto.getOrdre() : rOrdre++)
                                .build();
                        reponseQuizRepository.save(reponse);
                    }
                }
            }
        }

        return getQuizById(savedQuiz.getId());
    }

    @Transactional
    public QuizDetailDto updateQuiz(Long id, QuizCreateDto dto) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz introuvable avec l'ID: " + id));

        quiz.setTitre(dto.getTitre());
        if (dto.getDureeMinutes() != null) quiz.setDureeMinutes(dto.getDureeMinutes());
        if (dto.getScoreMinimum() != null) quiz.setScoreMinimum(dto.getScoreMinimum());

        if (dto.getQuestions() != null) {
            // Nettoyer anciennes questions
            List<QuestionQuiz> oldQuestions = questionQuizRepository.findByQuizIdOrderByOrdreAsc(id);
            for (QuestionQuiz oq : oldQuestions) {
                reponseQuizRepository.deleteAll(reponseQuizRepository.findByQuestionQuizIdOrderByOrdreAsc(oq.getId()));
            }
            questionQuizRepository.deleteAll(oldQuestions);

            // Insérer nouvelles questions
            int qOrdre = 1;
            for (QuestionQuizCreateDto qDto : dto.getQuestions()) {
                QuestionQuiz question = QuestionQuiz.builder()
                        .quiz(quiz)
                        .enonce(qDto.getEnonce())
                        .ordre(qDto.getOrdre() != null ? qDto.getOrdre() : qOrdre++)
                        .points(qDto.getPoints() != null ? qDto.getPoints() : 1)
                        .build();
                QuestionQuiz savedQuestion = questionQuizRepository.save(question);

                if (qDto.getReponses() != null) {
                    int rOrdre = 1;
                    for (ReponseQuizCreateDto rDto : qDto.getReponses()) {
                        ReponseQuiz reponse = ReponseQuiz.builder()
                                .questionQuiz(savedQuestion)
                                .texte(rDto.getTexte())
                                .estCorrecte(rDto.isEstCorrecte())
                                .ordre(rDto.getOrdre() != null ? rDto.getOrdre() : rOrdre++)
                                .build();
                        reponseQuizRepository.save(reponse);
                    }
                }
            }
        }

        quizRepository.save(quiz);
        return getQuizById(quiz.getId());
    }

    @Transactional
    public MessageResponse deleteQuiz(Long id) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz introuvable avec l'ID: " + id));
        quizRepository.delete(quiz);
        return new MessageResponse("Quiz supprimé avec succès");
    }

    public List<ResultatQuiz> getUserResults(UserDetailsImpl userDetails) {
        return resultatQuizRepository.findByUserIdOrderByDatePassageDesc(userDetails.getId());
    }
}