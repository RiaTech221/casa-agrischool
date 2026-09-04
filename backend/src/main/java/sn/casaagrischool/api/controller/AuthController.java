package sn.casaagrischool.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import sn.casaagrischool.api.dto.JwtResponse;
import sn.casaagrischool.api.dto.LoginRequest;
import sn.casaagrischool.api.dto.RegisterRequest;
import sn.casaagrischool.api.dto.UserProfileDto;
import sn.casaagrischool.api.security.services.UserDetailsImpl;
import sn.casaagrischool.api.service.AuthService;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentification", description = "Endpoints d'inscription, connexion et session")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Inscrire un nouvel utilisateur (maraîcher, expert)")
    public ResponseEntity<JwtResponse> register(@Valid @RequestBody RegisterRequest registerRequest) {
        return ResponseEntity.ok(authService.register(registerRequest));
    }

    @PostMapping("/login")
    @Operation(summary = "Authentifier un utilisateur via email/téléphone et mot de passe")
    public ResponseEntity<JwtResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        return ResponseEntity.ok(authService.login(loginRequest));
    }

    @GetMapping("/me")
    @Operation(summary = "Obtenir le profil de l'utilisateur connecté")
    public ResponseEntity<UserProfileDto> getCurrentUser(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(authService.getCurrentUserProfile(userDetails));
    }
}