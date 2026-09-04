package sn.casaagrischool.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import sn.casaagrischool.api.dto.MessageResponse;
import sn.casaagrischool.api.dto.QuestionForumCreateDto;
import sn.casaagrischool.api.dto.ReponseForumCreateDto;
import sn.casaagrischool.api.entity.CategorieForum;
import sn.casaagrischool.api.entity.QuestionForum;
import sn.casaagrischool.api.entity.ReponseForum;
import sn.casaagrischool.api.security.services.UserDetailsImpl;
import sn.casaagrischool.api.service.ForumService;

import java.util.List;

@RestController
@RequestMapping("/api/forum")
@RequiredArgsConstructor
@Tag(name = "Forum", description = "Questions/Réponses agricoles et identification des experts")
public class ForumController {

    private final ForumService forumService;

    @GetMapping("/categories")
    @Operation(summary = "Lister les catégories du forum")
    public ResponseEntity<List<CategorieForum>> getCategories() {
        return ResponseEntity.ok(forumService.getAllCategories());
    }

    @GetMapping("/questions")
    @Operation(summary = "Lister les questions (filtrable par catégorie, culture ou mot-clé)")
    public ResponseEntity<List<QuestionForum>> getQuestions(
            @RequestParam(required = false) Long categorieId,
            @RequestParam(required = false) Long cultureId,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(forumService.getQuestions(categorieId, cultureId, search));
    }

    @GetMapping("/questions/{id}")
    @Operation(summary = "Consulter une question avec toutes ses réponses")
    public ResponseEntity<QuestionForum> getQuestionById(@PathVariable Long id) {
        return ResponseEntity.ok(forumService.getQuestionById(id));
    }

    @PostMapping("/questions")
    @Operation(summary = "Poser une nouvelle question")
    public ResponseEntity<QuestionForum> createQuestion(
            @Valid @RequestBody QuestionForumCreateDto dto,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(forumService.createQuestion(dto, userDetails));
    }

    @PostMapping("/questions/{id}/answers")
    @Operation(summary = "Répondre à une question")
    public ResponseEntity<ReponseForum> addAnswer(
            @PathVariable Long id,
            @Valid @RequestBody ReponseForumCreateDto dto,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(forumService.addAnswer(id, dto, userDetails));
    }

    @PutMapping("/answers/{answerId}/best")
    @Operation(summary = "Désigner la meilleure réponse")
    public ResponseEntity<MessageResponse> markBestAnswer(
            @PathVariable Long answerId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(forumService.markBestAnswer(answerId, userDetails));
    }

    @DeleteMapping("/questions/{id}")
    @Operation(summary = "Supprimer une question")
    public ResponseEntity<MessageResponse> deleteQuestion(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        forumService.deleteQuestion(id, userDetails);
        return ResponseEntity.ok(new MessageResponse("Question supprimée avec succès"));
    }
}