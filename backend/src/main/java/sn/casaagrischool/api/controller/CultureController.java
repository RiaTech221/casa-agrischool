package sn.casaagrischool.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import sn.casaagrischool.api.entity.Culture;
import sn.casaagrischool.api.service.CultureService;

import java.util.List;

@RestController
@RequestMapping("/api/cultures")
@RequiredArgsConstructor
@Tag(name = "Cultures", description = "Gestion des cultures maraîchères de Casamance")
public class CultureController {

    private final CultureService cultureService;

    @GetMapping
    @Operation(summary = "Lister toutes les cultures actives")
    public ResponseEntity<List<Culture>> getActiveCultures() {
        return ResponseEntity.ok(cultureService.getAllActiveCultures());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtenir les détails d'une culture")
    public ResponseEntity<Culture> getCultureById(@PathVariable Long id) {
        return ResponseEntity.ok(cultureService.getCultureById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Créer une nouvelle culture (Admin)")
    public ResponseEntity<Culture> createCulture(@RequestBody Culture culture) {
        return ResponseEntity.ok(cultureService.createCulture(culture));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Modifier une culture (Admin)")
    public ResponseEntity<Culture> updateCulture(@PathVariable Long id, @RequestBody Culture culture) {
        return ResponseEntity.ok(cultureService.updateCulture(id, culture));
    }
}