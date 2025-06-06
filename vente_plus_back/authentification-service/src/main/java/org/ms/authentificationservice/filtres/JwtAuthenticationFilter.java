package org.ms.authentificationservice.filtres;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

public class JwtAuthenticationFilter extends UsernamePasswordAuthenticationFilter {
	private AuthenticationManager authenticationManager;

	public JwtAuthenticationFilter(AuthenticationManager authenticationManager) {
		this.authenticationManager = authenticationManager;
	}

	@Override
	public Authentication attemptAuthentication(HttpServletRequest request,
	                                            HttpServletResponse response) throws AuthenticationException {
		System.out.println("🔐 [attemptAuthentication] Tentative de connexion reçue");

		String username = request.getParameter("username");
		String password = request.getParameter("password");

		System.out.println("👤 Nom d'utilisateur reçu : " + username);
		System.out.println("🔑 Mot de passe reçu : " + (password != null ? "[PROVIDED]" : "[NULL]"));

		UsernamePasswordAuthenticationToken authToken =
		        new UsernamePasswordAuthenticationToken(username, password);

		System.out.println("📤 Envoi de l'objet UsernamePasswordAuthenticationToken au AuthenticationManager");

		return authenticationManager.authenticate(authToken);
	}

	@Override
	protected void successfulAuthentication(HttpServletRequest request,
	                                        HttpServletResponse response,
	                                        FilterChain chain,
	                                        Authentication authResult) throws IOException, ServletException {

		System.out.println("✅ [successfulAuthentication] Authentification réussie");

		User user = (User) authResult.getPrincipal();
		System.out.println("👤 Utilisateur authentifié : " + user.getUsername());

		String[] roles = new String[user.getAuthorities().size()];
		int index = 0;
		for (GrantedAuthority authority : user.getAuthorities()) {
			roles[index] = authority.toString();
			System.out.println("🎭 Rôle[" + index + "] = " + roles[index]);
			index++;
		}

		Algorithm algo = Algorithm.HMAC256("MaClé");

		String jwtAccessToken = JWT.create()
			.withSubject(user.getUsername())
			.withExpiresAt(new Date(System.currentTimeMillis() + 1 * 60 * 1000))
			.withIssuer(request.getRequestURL().toString())
			.withArrayClaim("roles", roles)
			.sign(algo);

		System.out.println("🛡️ Access Token généré : " + jwtAccessToken);

		String jwtRefreshToken = JWT.create()
			.withSubject(user.getUsername())
			.withExpiresAt(new Date(System.currentTimeMillis() + 60 * 60 * 1000))
			.withIssuer(request.getRequestURL().toString())
			.sign(algo);

		System.out.println("♻️ Refresh Token généré : " + jwtRefreshToken);

		Map<String, String> mapTokens = new HashMap<>();
		mapTokens.put("access-token", jwtAccessToken);
		mapTokens.put("refresh-token", jwtRefreshToken);

		response.setContentType("application/json");
		new ObjectMapper().writeValue(response.getOutputStream(), mapTokens);

		System.out.println("📦 Tokens envoyés dans la réponse JSON");
	}
}
