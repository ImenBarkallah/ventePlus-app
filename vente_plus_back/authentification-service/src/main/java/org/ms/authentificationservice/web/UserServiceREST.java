package org.ms.authentificationservice.web;

import lombok.RequiredArgsConstructor;
import org.ms.authentificationservice.entities.AppRole;
import org.ms.authentificationservice.entities.AppUser;
import org.ms.authentificationservice.services.UserService;
import org.ms.authentificationservice.dto.UserRoleData;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.web.bind.annotation.*;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users")
@CrossOrigin("*")
@RequiredArgsConstructor
public class UserServiceREST {

	private final UserService userService;
	public final String PREFIXE_JWT="Bearer ";
	public final String CLE_SIGNATURE ="MaClé";

	@GetMapping
	@PostAuthorize("hasAuthority('USER') or hasAuthority('ADMIN')")
	public List<AppUser> getAllUsers() {
		return userService.getAllUsers();
	}

	@PostMapping
	@PostAuthorize("hasAuthority('ADMIN')")
	public AppUser saveUser(@RequestBody AppUser appUser) {
		return userService.addUser(appUser);
	}

	@PostMapping("/roles")
	@PostAuthorize("hasAuthority('ADMIN')")
	public AppRole saveRole(@RequestBody AppRole appRole) {
		return userService.addRole(appRole);
	}

	@PostMapping("/addRoleToUser")
	@PostAuthorize("hasAuthority('ADMIN')")
	public void addRoleToUser(@RequestBody UserRoleData userRoleData) {
		userService.addRoleToUser(userRoleData.getUsername(), userRoleData.getRoleName());
	}

@GetMapping(path = "/refreshToken")
public void refreshToken(HttpServletRequest request, HttpServletResponse response) {
    String refreshToken = request.getHeader("Authorization");

    if (refreshToken != null && refreshToken.startsWith(PREFIXE_JWT)) {
        try {
            String jwtRefresh = refreshToken.substring(PREFIXE_JWT.length());
            Algorithm algo = Algorithm.HMAC256(CLE_SIGNATURE);

            JWTVerifier jwtVerifier = JWT.require(algo).build();
            DecodedJWT decodedJWT = jwtVerifier.verify(jwtRefresh);
            String username = decodedJWT.getSubject();

            AppUser user = userService.getUserByName(username);
            if (user == null) {
                throw new RuntimeException("Utilisateur introuvable.");
            }

            String[] roles = user.getAppRoles().stream()
                    .map(AppRole::getRoleName)
                    .toArray(String[]::new);

            String jwtAccessToken = JWT.create()
                    .withSubject(user.getUsername())
                    .withExpiresAt(new Date(System.currentTimeMillis() + 1 * 60 * 1000)) // 1 min
                    .withIssuer(request.getRequestURL().toString())
                    .withArrayClaim("roles", roles)
                    .sign(algo);

            Map<String, String> mapTokens = new HashMap<>();
            mapTokens.put("access-token", jwtAccessToken);
            mapTokens.put("refresh-token", jwtRefresh);

            response.setContentType("application/json");
            new ObjectMapper().writeValue(response.getOutputStream(), mapTokens);

        } catch (Exception e) {
            // Gestion propre de l’erreur
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json");
            Map<String, String> error = new HashMap<>();
            error.put("error-message", e.getMessage());
            try {
                new ObjectMapper().writeValue(response.getOutputStream(), error);
            } catch (IOException ioException) {
                ioException.printStackTrace();
            }
        }
    } else {
        // Refresh Token manquant ou mal formé
        response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        response.setContentType("application/json");
        Map<String, String> error = new HashMap<>();
        error.put("error-message", "Refresh Token non disponible ou invalide.");
        try {
            new ObjectMapper().writeValue(response.getOutputStream(), error);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}

}
