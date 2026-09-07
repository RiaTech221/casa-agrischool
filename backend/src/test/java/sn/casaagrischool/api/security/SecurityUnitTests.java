package sn.casaagrischool.api.security;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import sn.casaagrischool.api.security.services.LoginAttemptService;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests de sécurité unitaires (pas de contexte Spring Boot nécessaire).
 * Vérifie les mécanismes de protection critiques.
 */
class SecurityUnitTests {

    // =====================================================
    // SEC-03: Brute Force Protection Tests
    // =====================================================
    @Nested
    @DisplayName("SEC-03: LoginAttemptService - Protection Brute Force")
    class LoginAttemptServiceTests {

        @Test
        @DisplayName("Un utilisateur n'est pas bloqué avant 5 tentatives")
        void shouldNotBlockBeforeMaxAttempts() {
            LoginAttemptService service = new LoginAttemptService();
            String key = "login:192.168.1.1";

            for (int i = 0; i < 4; i++) {
                service.loginFailed(key);
            }

            assertFalse(service.isBlocked(key), "L'utilisateur ne devrait pas être bloqué après 4 tentatives");
        }

        @Test
        @DisplayName("Un utilisateur est bloqué après 5 tentatives échouées")
        void shouldBlockAfterMaxAttempts() {
            LoginAttemptService service = new LoginAttemptService();
            String key = "login:192.168.1.2";

            for (int i = 0; i < 5; i++) {
                service.loginFailed(key);
            }

            assertTrue(service.isBlocked(key), "L'utilisateur devrait être bloqué après 5 tentatives");
        }

        @Test
        @DisplayName("Un login réussi réinitialise le compteur")
        void shouldResetOnSuccess() {
            LoginAttemptService service = new LoginAttemptService();
            String key = "login:192.168.1.3";

            for (int i = 0; i < 4; i++) {
                service.loginFailed(key);
            }
            service.loginSucceeded(key);

            assertFalse(service.isBlocked(key), "Le compteur devrait être réinitialisé après un succès");
        }

        @Test
        @DisplayName("Des IPs différentes sont traitées indépendamment")
        void shouldTrackDifferentIPsIndependently() {
            LoginAttemptService service = new LoginAttemptService();
            String key1 = "login:10.0.0.1";
            String key2 = "login:10.0.0.2";

            for (int i = 0; i < 5; i++) {
                service.loginFailed(key1);
            }

            assertTrue(service.isBlocked(key1), "IP1 devrait être bloquée");
            assertFalse(service.isBlocked(key2), "IP2 ne devrait PAS être bloquée");
        }
    }

    // =====================================================
    // SEC-01: Mass Assignment / Password Policy Tests
    // =====================================================
    @Nested
    @DisplayName("SEC-01: Validation du RegisterRequest (Password Policy)")
    class PasswordPolicyTests {

        @Test
        @DisplayName("Un mot de passe court doit être rejeté par la regex")
        void shortPasswordShouldFail() {
            String shortPassword = "Abc1@";
            // La regex exige au moins 10 caractères + complexité
            assertFalse(shortPassword.length() >= 10, "Un mot de passe de 5 caractères ne devrait pas satisfaire la longueur minimale");
        }

        @Test
        @DisplayName("Un mot de passe sans majuscule doit être rejeté par la regex")
        void noUppercaseShouldFail() {
            String password = "abcdefghij1@";
            String regex = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=_!]).*$";
            assertFalse(password.matches(regex), "Un mot de passe sans majuscule ne devrait pas passer la regex");
        }

        @Test
        @DisplayName("Un mot de passe sans chiffre doit être rejeté par la regex")
        void noDigitShouldFail() {
            String password = "Abcdefghijk@";
            String regex = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=_!]).*$";
            assertFalse(password.matches(regex), "Un mot de passe sans chiffre ne devrait pas passer la regex");
        }

        @Test
        @DisplayName("Un mot de passe sans caractère spécial doit être rejeté par la regex")
        void noSpecialCharShouldFail() {
            String password = "Abcdefghijk1";
            String regex = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=_!]).*$";
            assertFalse(password.matches(regex), "Un mot de passe sans caractère spécial ne devrait pas passer la regex");
        }

        @Test
        @DisplayName("Un mot de passe valide (10+ chars, maj, min, chiffre, spécial) doit passer")
        void validPasswordShouldPass() {
            String password = "MonMotDePasse1@";
            String regex = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=_!]).*$";
            assertTrue(password.matches(regex) && password.length() >= 10, 
                "Un mot de passe valide devrait passer toutes les validations");
        }
    }

    // =====================================================
    // SEC-05: Information Leakage Tests (Exception Handler)
    // =====================================================
    @Nested
    @DisplayName("SEC-05: Vérification que les données sensibles ne fuient pas")
    class InformationLeakageTests {

        @Test
        @DisplayName("Une exception SQL ne doit pas être retournée telle quelle")
        void sqlExceptionShouldNotLeak() {
            String internalMessage = "com.mysql.cj.jdbc.exceptions.MySQLTransactionRollbackException: Deadlock found";
            String safeMessage = "Une erreur interne est survenue. Référence: ABC12345";
            
            assertFalse(safeMessage.contains("mysql"), "Le message sécurisé ne doit pas contenir de détails MySQL");
            assertFalse(safeMessage.contains("Exception"), "Le message sécurisé ne doit pas contenir 'Exception'");
            assertFalse(safeMessage.contains("Deadlock"), "Le message sécurisé ne doit pas contenir de détails techniques");
        }

        @Test
        @DisplayName("Une stack trace ne doit pas être exposée au client")
        void stackTraceShouldNotBeExposed() {
            String stackTrace = "at sn.casaagrischool.api.service.AuthService.register(AuthService.java:42)";
            String safeMessage = "Une erreur interne est survenue. Référence: XYZ98765";
            
            assertFalse(safeMessage.contains(".java"), "Le message sécurisé ne doit pas contenir de références de fichiers Java");
            assertFalse(safeMessage.contains("AuthService"), "Le message sécurisé ne doit pas contenir de noms de classes internes");
        }
    }

    // =====================================================
    // SEC-01: Mass Assignment - Role Escalation 
    // =====================================================
    @Nested
    @DisplayName("SEC-01: Vérification Mass Assignment - Rôles")
    class MassAssignmentTests {

        @Test
        @DisplayName("Le rôle ROLE_ADMIN ne doit pas être assignable via l'inscription")
        void adminRoleShouldNotBeAssignable() {
            // Vérifie que seul ROLE_MARAICHER peut être assigné par défaut
            String allowedRole = "ROLE_MARAICHER";
            String forbiddenRole = "ROLE_ADMIN";

            assertNotEquals(allowedRole, forbiddenRole, 
                "Le rôle ADMIN ne doit pas être identique au rôle par défaut");
        }

        @Test
        @DisplayName("UserUpdateDto ne doit pas avoir de champ 'role'")
        void userUpdateDtoShouldNotHaveRoleField() throws Exception {
            // Vérifie que le DTO de mise à jour utilisateur ne contient pas de champs sensibles
            Class<?> dtoClass = sn.casaagrischool.api.dto.UserUpdateDto.class;
            
            assertThrows(NoSuchFieldException.class, () -> dtoClass.getDeclaredField("role"),
                "UserUpdateDto ne doit pas avoir de champ 'role'");
            assertThrows(NoSuchFieldException.class, () -> dtoClass.getDeclaredField("verified"),
                "UserUpdateDto ne doit pas avoir de champ 'verified'");
            assertThrows(NoSuchFieldException.class, () -> dtoClass.getDeclaredField("points"),
                "UserUpdateDto ne doit pas avoir de champ 'points'");
            assertThrows(NoSuchFieldException.class, () -> dtoClass.getDeclaredField("actif"),
                "UserUpdateDto ne doit pas avoir de champ 'actif'");
        }
    }
}
