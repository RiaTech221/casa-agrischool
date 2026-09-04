package sn.casaagrischool.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import sn.casaagrischool.api.dto.MessageResponse;
import sn.casaagrischool.api.entity.Formation;
import sn.casaagrischool.api.entity.Lecon;
import sn.casaagrischool.api.entity.ProgressionFormation;
import sn.casaagrischool.api.security.services.UserDetailsImpl;
import sn.casaagrischool.api.service.FormationService;

import java.util.List;

@RestController
@RequestMapping("/api/formations")
@RequiredArgsConstructor
@Tag(name = "Formations", description = "Catalogue des cours, modules, leçons et progression")
public class FormationController {

    private final FormationService formationService;

    @GetMapping
    @Operation(summary = "Lister les formations publiées (filtrable par culture)")
    public ResponseEntity<List<Formation>> getAllFormations(@RequestParam(required = false) Long cultureId) {
        return ResponseEntity.ok(formationService.getAllPublishedFormations(cultureId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtenir les détails complets d'une formation avec ses modules et leçons")
    public ResponseEntity<Formation> getFormationById(@PathVariable Long id) {
        return ResponseEntity.ok(formationService.getFormationById(id));
    }

    @GetMapping("/{id}/progression")
    @Operation(summary = "Obtenir la progression de l'utilisateur connecté sur la formation")
    public ResponseEntity<ProgressionFormation> getProgression(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(formationService.getProgression(id, userDetails));
    }

    @PostMapping("/lecons/{leconId}/complete")
    @Operation(summary = "Marquer une leçon comme terminée et cumuler des points")
    public ResponseEntity<MessageResponse> completeLecon(
            @PathVariable Long leconId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(formationService.completeLecon(leconId, userDetails));
    }
}