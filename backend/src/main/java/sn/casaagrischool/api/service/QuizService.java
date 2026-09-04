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

        if (reussi) {
            pointsGagnes = 20; // +20 pts pour un quiz réussi
            user.setPoints(user.getPoints() + pointsGagnes);
            userRepository.save(user);
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

        String message = reussi
                ? "Félicitations ! Vous avez réussi le quiz avec " + scorePourcent + "%. +" + pointsGagnes + " points attribués."
                : "Score insuffisant (" + scorePourcent + "%). Le score minimum requis est de " + quiz.getScoreMinimum() + "%. Réessayez !";

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

    public List<ResultatQuiz> getUserResults(UserDetailsImpl userDetails) {
        return resultatQuizRepository.findByUserIdOrderByDatePassageDesc(userDetails.getId());
    }
}