package sn.casaagrischool.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import sn.casaagrischool.api.dto.*;
import sn.casaagrischool.api.entity.Formation;
import sn.casaagrischool.api.entity.Lecon;
import sn.casaagrischool.api.entity.Module;
import sn.casaagrischool.api.security.services.UserDetailsImpl;
import sn.casaagrischool.api.service.ExpertService;

import java.util.List;

@RestController
@RequestMapping("/api/expert")
@PreAuthorize("hasRole('EXPERT') or hasRole('ADMIN')")
@RequiredArgsConstructor
@Tag(name = "Espace Expert", description = "Interface dédiée aux experts agronomes : gestion de leurs formations, cours et suivi des apprenants")
public class ExpertController {

    private final ExpertService expertService;

    private boolean isUserAdmin(UserDetailsImpl userDetails) {
        return userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }

    @GetMapping("/stats")
    @Operation(summary = "Statistiques de l'expert connecté")
    public ResponseEntity<ExpertStatsDto> getStats(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(expertService.getStats(userDetails.getId()));
    }

    @GetMapping("/formations")
    @Operation(summary = "Lister uniquement les formations créées par l'expert connecté")
    public ResponseEntity<List<Formation>> getMyFormations(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(expertService.getMyFormations(userDetails.getId()));
    }

    @GetMapping("/apprenants")
    @Operation(summary = "Suivi des apprenants inscrits aux formations de l'expert")
    public ResponseEntity<List<ExpertApprenantDto>> getMyApprenants(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(expertService.getMyApprenants(userDetails.getId()));
    }

    @PostMapping("/formations")
    @Operation(summary = "Créer une nouvelle formation rattachée à l'expert connecté")
    public ResponseEntity<Formation> createFormation(
            @Valid @RequestBody FormationCreateDto dto,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(expertService.createFormation(dto, userDetails));
    }

    @PutMapping("/formations/{id}")
    @Operation(summary = "Modifier une formation existante de l'expert")
    public ResponseEntity<Formation> updateFormation(
            @PathVariable Long id,
            @Valid @RequestBody FormationCreateDto dto,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(expertService.updateFormation(id, dto, userDetails.getId(), isUserAdmin(userDetails)));
    }

    @DeleteMapping("/formations/{id}")
    @Operation(summary = "Supprimer une formation de l'expert")
    public ResponseEntity<MessageResponse> deleteFormation(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(expertService.deleteFormation(id, userDetails.getId(), isUserAdmin(userDetails)));
    }

    @PostMapping("/modules")
    @Operation(summary = "Ajouter un module à une formation")
    public ResponseEntity<Module> createModule(
            @Valid @RequestBody ModuleCreateDto dto,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(expertService.createModule(dto, userDetails.getId(), isUserAdmin(userDetails)));
    }

    @DeleteMapping("/modules/{id}")
    @Operation(summary = "Supprimer un module")
    public ResponseEntity<MessageResponse> deleteModule(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(expertService.deleteModule(id, userDetails.getId(), isUserAdmin(userDetails)));
    }

    @PostMapping("/lecons")
    @Operation(summary = "Ajouter une leçon à un module")
    public ResponseEntity<Lecon> createLecon(
            @Valid @RequestBody LeconCreateDto dto,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(expertService.createLecon(dto, userDetails.getId(), isUserAdmin(userDetails)));
    }

    @GetMapping("/cultures")
    @Operation(summary = "Lister les cultures autorisées pour le domaine de l'expert")
    public ResponseEntity<List<sn.casaagrischool.api.entity.Culture>> getMyAllowedCultures(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(expertService.getMyAllowedCultures(userDetails.getId()));
    }

    @PutMapping("/lecons/{id}")
    @Operation(summary = "Modifier une leçon existante")
    public ResponseEntity<Lecon> updateLecon(
            @PathVariable Long id,
            @Valid @RequestBody LeconCreateDto dto,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(expertService.updateLecon(id, dto, userDetails.getId(), isUserAdmin(userDetails)));
    }

    @DeleteMapping("/lecons/{id}")
    @Operation(summary = "Supprimer une leçon")
    public ResponseEntity<MessageResponse> deleteLecon(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(expertService.deleteLecon(id, userDetails.getId(), isUserAdmin(userDetails)));
    }
}
