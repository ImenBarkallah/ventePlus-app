package org.ms.gatewayservice.utils;


import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureException;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureException;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class JwtUtil {

    private final String secret = "MaCléSuperSecrèteÀChanger"; // 🔐 À mettre dans application.yml plus tard

    // ✅ Valider le token (signature + format)
    public boolean validateToken(String token) {
        try {
            extractAllClaims(token); // Déclenche une exception si invalide
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    // ✅ Extraire le username (subject du JWT)
    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject(); // "sub" du token
    }

    // ✅ Extraire les rôles (claim personnalisée)
    public List<String> extractRoles(String token) {
        Claims claims = extractAllClaims(token);
        return claims.get("roles", List.class); // Assure-toi que tu as bien "roles" dans le JWT
    }

    // ✅ Extraction interne
    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .setSigningKey(secret.getBytes()) // clé symétrique
                .parseClaimsJws(token)
                .getBody();
    }
}
