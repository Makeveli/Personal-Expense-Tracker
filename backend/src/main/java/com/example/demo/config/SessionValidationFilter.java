package com.example.demo.config;

import com.example.demo.model.UserSession;
import com.example.demo.repository.UserSessionRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class SessionValidationFilter extends OncePerRequestFilter {

    private final UserSessionRepository userSessionRepository;
    private static final int SESSION_TIMEOUT_MINUTES = 15;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        
        // Skip auth endpoints and OPTIONS requests
        if (path.startsWith("/api/auth/") || request.getMethod().equalsIgnoreCase("OPTIONS")) {
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.warn("Missing or invalid Authorization header for path: {}", path);
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"message\": \"Missing token\"}");
            return;
        }

        String token = authHeader.substring(7);
        Optional<UserSession> sessionOpt = userSessionRepository.findByToken(token);

        if (sessionOpt.isEmpty()) {
            log.warn("Invalid session token for path: {}", path);
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"message\": \"Invalid session\"}");
            return;
        }

        UserSession session = sessionOpt.get();
        LocalDateTime now = LocalDateTime.now();

        if (session.getLastActivity().plusMinutes(SESSION_TIMEOUT_MINUTES).isBefore(now)) {
            log.info("Session expired for user: {}", session.getUser().getUsername());
            userSessionRepository.delete(session);
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"message\": \"Session expired\"}");
            return;
        }

        // Extend sliding window
        session.setLastActivity(now);
        userSessionRepository.save(session);
        
        log.debug("Session validated and extended for user: {}", session.getUser().getUsername());

        // We could populate Spring Security context here if needed, but keeping it simple for MVP
        filterChain.doFilter(request, response);
    }
}
