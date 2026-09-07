package sn.casaagrischool.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import sn.casaagrischool.api.dto.JwtResponse;
import sn.casaagrischool.api.dto.LoginRequest;
import sn.casaagrischool.api.dto.MessageResponse;
import sn.casaagrischool.api.dto.RegisterRequest;
import sn.casaagrischool.api.dto.UserProfileDto;
import sn.casaagrischool.api.security.services.LoginAttemptService;
import sn.casaagrischool.api.security.services.UserDetailsImpl;
import sn.casaagrischool.api.service.AuthService;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentification", description = "Endpoints d'inscription, connexion et session")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    private final AuthService authService;
    private final LoginAttemptService loginAttemptService;

    @PostMapping("/register")
    @Operation(summary = "Inscrire un nouvel utilisateur (maraîcher, expert)")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest registerRequest, HttpServletRequest request) {
        String ip = getClientIP(request);
        if (loginAttemptService.isBlocked(ip)) {
            logger.warn("SEC-03: Tentative d'inscription bloquée (rate limit) pour IP: {}", ip);
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(new MessageResponse("Trop de tentatives. Veuillez réessayer dans quelques minutes."));
        }
        return ResponseEntity.ok(authService.register(registerRequest));
    }

    @PostMapping("/login")
    @Operation(summary = "Authentifier un utilisateur via email/téléphone et mot de passe")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest, HttpServletRequest request) {
        String ip = getClientIP(request);
        String loginKey = "login:" + ip;

        if (loginAttemptService.isBlocked(loginKey)) {
            logger.warn("SEC-03: Tentative de connexion bloquée (rate limit) pour IP: {}", ip);
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(new MessageResponse("Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes."));
        }

        try {
            JwtResponse response = authService.login(loginRequest);
            loginAttemptService.loginSucceeded(loginKey);
            logger.info("AUDIT: LOGIN_SUCCESS user={}", loginRequest.getIdentifiant());
            return ResponseEntity.ok(response);
        } catch (BadCredentialsException e) {
            loginAttemptService.loginFailed(loginKey);
            logger.warn("AUDIT: LOGIN_FAILED user={} ip={}", loginRequest.getIdentifiant(), ip);
            throw e; // Let GlobalExceptionHandler handle it
        }
    }

    @GetMapping("/me")
    @Operation(summary = "Obtenir le profil de l'utilisateur connecté")
    public ResponseEntity<UserProfileDto> getCurrentUser(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(authService.getCurrentUserProfile(userDetails));
    }

    private String getClientIP(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}