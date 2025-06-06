package org.ms.authentificationservice.filtres;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;

public class JwtAuthorizationFilter extends OncePerRequestFilter {
	public final String PREFIXE_JWT = "Bearer ";
	public final String CLE_SIGNATURE = "MaClé";

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
	        throws ServletException, IOException {

	    System.out.println("📩 Requête interceptée : " + request.getRequestURI());

	    // Exclure le chemin /refreshToken du filtre
	    if (request.getServletPath().equals("/refreshToken")) {
	        System.out.println("🔁 Chemin exclu (/refreshToken), on continue sans vérification");
	        filterChain.doFilter(request, response);
	    } else {
	        String authorizationToken = request.getHeader("Authorization");

	        if (authorizationToken != null && authorizationToken.startsWith(PREFIXE_JWT)) {
	            try {
	                System.out.println("✅ Authorization header détecté : " + authorizationToken);

	                String jwt = authorizationToken.substring(PREFIXE_JWT.length());
	                System.out.println("🔐 Token extrait : " + jwt);

	                Algorithm algo = Algorithm.HMAC256(CLE_SIGNATURE);
	                JWTVerifier jwtVerifier = JWT.require(algo).build();
	                DecodedJWT decodedJWT = jwtVerifier.verify(jwt);

	                String username = decodedJWT.getSubject();
	                String[] roles = decodedJWT.getClaim("roles").asArray(String.class);

	                System.out.println("👤 Utilisateur extrait : " + username);
	                System.out.println("🎭 Rôles extraits : " + Arrays.toString(roles));

	                Collection<GrantedAuthority> permissions = new ArrayList<>();
	                for (String r : roles) {
	                    permissions.add(new SimpleGrantedAuthority(r));
	                }

	                UsernamePasswordAuthenticationToken authenticationToken =
	                        new UsernamePasswordAuthenticationToken(username, null, permissions);

	                SecurityContextHolder.getContext().setAuthentication(authenticationToken);

	                System.out.println("✅ Authentification injectée dans le contexte avec rôles : " + permissions);

	                filterChain.doFilter(request, response);

	            } catch (Exception e) {
	                System.out.println("❌ Erreur lors du traitement du JWT : " + e.getMessage());
	                response.setHeader("error-message", e.getMessage());
	                response.sendError(HttpServletResponse.SC_FORBIDDEN);
	            }
	        } else {
	            System.out.println("⚠️ Aucun token JWT valide trouvé dans l'en-tête Authorization.");
	            filterChain.doFilter(request, response);
	        }
	    }
	}
}
