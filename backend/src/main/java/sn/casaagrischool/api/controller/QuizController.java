package sn.casaagrischool.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import sn.casaagrischool.api.dto.QuizDetailDto;
import sn.casaagrischool.api.dto.QuizSubmitRequest;
import sn.casaagrischool.api.dto.QuizSubmitResponse;
import sn.casaagrischool.api.entity.ResultatQuiz;
import sn.casaagrischool.api.security.services.UserDetailsImpl;
import sn.casaagrischool.api.service.QuizService;

import java.util.List;

@RestController
@RequestMapping("/api/quiz")
@RequiredArgsConstructor
@Tag(name = "Quiz", description = "Quiz chronométrés, calcul sécurisé des scores et résultats")
public class QuizController {

    private final QuizService quizService;

    @GetMapping("/{id}")
    @Operation(summary = "Obtenir le quiz et ses questions sans les réponses pré-cochées")
    public ResponseEntity<QuizDetailDto> getQuizById(@PathVariable Long id) {
        return ResponseEntity.ok(quizService.getQuizById(id));
    }

    @PostMapping("/{id}/submit")
    @Operation(summary = "Soumettre les réponses du quiz pour notation backend et attribution des points")
    public ResponseEntity<QuizSubmitResponse> submitQuiz(
            @PathVariable Long id,
            @RequestBody QuizSubmitRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(quizService.submitQuiz(id, request, userDetails));
    }

    @GetMapping("/results")
    @Operation(summary = "Historique des résultats de quiz de l'utilisateur connecté")
    public ResponseEntity<List<ResultatQuiz>> getMyResults(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(quizService.getUserResults(userDetails));
    }
}