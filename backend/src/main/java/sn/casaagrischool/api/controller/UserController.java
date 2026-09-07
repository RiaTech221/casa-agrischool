package sn.casaagrischool.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import sn.casaagrischool.api.dto.ExpertUpdateDto;
import sn.casaagrischool.api.dto.UserProfileDto;
import sn.casaagrischool.api.dto.UserUpdateDto;
import sn.casaagrischool.api.security.services.UserDetailsImpl;
import sn.casaagrischool.api.service.UserService;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Utilisateurs", description = "Gestion du profil de l'utilisateur connecté")
public class UserController {

    private final UserService userService;

    @PutMapping("/me")
    @Operation(summary = "Mettre à jour les informations du profil utilisateur")
    public ResponseEntity<UserProfileDto> updateProfile(
            @Valid @RequestBody UserUpdateDto dto,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(userService.updateProfile(dto, userDetails));
    }

    @PutMapping("/me/expert")
    @Operation(summary = "Mettre à jour les informations du profil expert")
    public ResponseEntity<UserProfileDto> updateExpertProfile(
            @Valid @RequestBody ExpertUpdateDto dto,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(userService.updateExpertProfile(dto, userDetails));
    }
}
