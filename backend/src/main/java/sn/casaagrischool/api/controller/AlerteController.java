package sn.casaagrischool.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import sn.casaagrischool.api.dto.AlerteCreateDto;
import sn.casaagrischool.api.dto.AlerteDto;
import sn.casaagrischool.api.dto.MessageResponse;
import sn.casaagrischool.api.entity.Alerte;
import sn.casaagrischool.api.security.services.UserDetailsImpl;
import sn.casaagrischool.api.service.AlerteService;

import java.util.List;

@RestController
@RequestMapping("/api/alertes")
@RequiredArgsConstructor
@Tag(name = "Alertes", description = "Alertes saisonnières ciblées selon les cultures déclarées")
public class AlerteController {

    private final AlerteService alerteService;

    @GetMapping
    @Operation(summary = "Obtenir les alertes actives ciblées pour l'utilisateur avec statut lu/non-lu")
    public ResponseEntity<List<AlerteDto>> getMyAlertes(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(alerteService.getAlertesForUser(userDetails));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Détail d'une alerte")
    public ResponseEntity<AlerteDto> getAlerteById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(alerteService.getAlerteById(id, userDetails));
    }

    @PutMapping("/{id}/read")
    @Operation(summary = "Marquer une alerte comme lue")
    public ResponseEntity<MessageResponse> markAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        alerteService.markAsRead(id, userDetails);
        return ResponseEntity.ok(new MessageResponse("Alerte marquée comme lue"));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('EXPERT')")
    @Operation(summary = "Créer une alerte saisonnière (Admin/Expert)")
    public ResponseEntity<Alerte> createAlerte(
            @Valid @RequestBody AlerteCreateDto dto,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(alerteService.createAlerte(dto, userDetails));
    }
}