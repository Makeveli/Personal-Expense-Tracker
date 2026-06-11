package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.model.UserSession;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.UserSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class AuthController {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserSessionRepository userSessionRepository;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        log.info("Attempting to register user: {}", user.getUsername());
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            log.warn("Registration failed: Username {} already exists", user.getUsername());
            return ResponseEntity.badRequest().body(Map.of("message", "Username already exists"));
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
        log.info("User {} registered successfully", user.getUsername());
        return ResponseEntity.ok(Map.of("message", "User registered successfully"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginRequest) {
        log.info("Login attempt for user: {}", loginRequest.getUsername());
        return userRepository.findByUsername(loginRequest.getUsername())
                .filter(user -> passwordEncoder.matches(loginRequest.getPassword(), user.getPassword()))
                .map(user -> {
                    String token = UUID.randomUUID().toString();
                    LocalDateTime now = LocalDateTime.now();
                    UserSession session = new UserSession(user, token, now, now);
                    userSessionRepository.save(session);
                    log.info("User {} logged in successfully. Session created.", user.getUsername());
                    return ResponseEntity.ok(Map.of(
                        "token", token,
                        "username", user.getUsername()
                    ));
                })
                .orElseGet(() -> {
                    log.warn("Login failed for user: {}", loginRequest.getUsername());
                    return ResponseEntity.status(401).body(Map.of("message", "Invalid credentials"));
                });
    }

    @PostMapping("/logout")
    @Transactional
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            log.info("Logging out session for token: {}", token);
            userSessionRepository.deleteByToken(token);
        }
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    @PostMapping("/extend-session")
    public ResponseEntity<?> extendSession(@RequestHeader("Authorization") String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            return userSessionRepository.findByToken(token)
                    .map(session -> {
                        session.setLastActivity(LocalDateTime.now());
                        userSessionRepository.save(session);
                        log.info("Session extended for user: {}", session.getUser().getUsername());
                        return ResponseEntity.ok(Map.of("message", "Session extended"));
                    })
                    .orElseGet(() -> {
                        log.warn("Attempt to extend invalid or expired session");
                        return ResponseEntity.status(401).body(Map.of("message", "Invalid session"));
                    });
        }
        return ResponseEntity.status(401).body(Map.of("message", "Missing token"));
    }
}
