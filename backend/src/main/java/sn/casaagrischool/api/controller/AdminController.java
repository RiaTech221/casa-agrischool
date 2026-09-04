package sn.casaagrischool.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import sn.casaagrischool.api.dto.AdminStatsDto;
import sn.casaagrischool.api.dto.MessageResponse;
import sn.casaagrischool.api.entity.User;
import sn.casaagrischool.api.service.AdminService;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Tag(name = "Administration", description = "Back-office réservé aux administrateurs (statistiques, utilisateurs, validation experts, modération)")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/stats")
    @Operation(summary = "Indicateurs clés et statistiques globales")
    public ResponseEntity<AdminStatsDto> getStats() {
        return ResponseEntity.ok(adminService.getStatistics());
    }

    @GetMapping("/users")
    @Operation(summary = "Lister tous les utilisateurs de la plateforme")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PutMapping("/users/{id}/toggle-active")
    @Operation(summary = "Activer ou désactiver le compte d'un utilisateur")
    public ResponseEntity<MessageResponse> toggleUserActive(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.toggleUserActive(id));
    }

    @PutMapping("/experts/{id}/verify")
    @Operation(summary = "Valider ou révoquer le statut vérifié d'un expert")
    public ResponseEntity<MessageResponse> verifyExpert(@PathVariable Long id, @RequestParam boolean verify) {
        return ResponseEntity.ok(adminService.verifyExpert(id, verify));
    }

    @DeleteMapping("/forum/questions/{id}")
    @Operation(summary = "Modération : Supprimer une question du forum")
    public ResponseEntity<MessageResponse> deleteQuestion(@PathVariable Long id) {
        adminService.deleteQuestion(id);
        return ResponseEntity.ok(new MessageResponse("Question supprimée par la modération"));
    }

    @DeleteMapping("/forum/answers/{id}")
    @Operation(summary = "Modération : Supprimer une réponse du forum")
    public ResponseEntity<MessageResponse> deleteAnswer(@PathVariable Long id) {
        adminService.deleteAnswer(id);
        return ResponseEntity.ok(new MessageResponse("Réponse supprimée par la modération"));
    }
}