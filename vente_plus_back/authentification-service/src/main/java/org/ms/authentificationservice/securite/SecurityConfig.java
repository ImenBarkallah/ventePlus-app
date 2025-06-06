package org.ms.authentificationservice.securite;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.ms.authentificationservice.entities.AppUser;
import org.ms.authentificationservice.filtres.JwtAuthenticationFilter;
import org.ms.authentificationservice.filtres.JwtAuthorizationFilter;
import org.ms.authentificationservice.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.ArrayList;
import java.util.Collection;

@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(securedEnabled = true)
public class SecurityConfig {
	@Bean
	public AuthenticationManager authenticationManager(AuthenticationConfiguration
	authenticationConfiguration) throws Exception {
	return authenticationConfiguration.getAuthenticationManager();
	}

	private final UserService userService;

	public SecurityConfig(UserService userService) {
		this.userService = userService;
	}

	@Autowired
	public void globalConfig(AuthenticationManagerBuilder auth) throws Exception {
		auth.userDetailsService(new UserDetailsService() {
			@Override
			public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
				// Récupérer l'utilisateur via UserService
				AppUser appUser = userService.getUserByName(username);
				if (appUser == null) {
					throw new UsernameNotFoundException("Utilisateur non trouvé");
				}

				// Construire la liste des rôles au format Spring Security
				Collection<GrantedAuthority> permissions = new ArrayList<>();
				appUser.getAppRoles().forEach(r -> {
					permissions.add(new SimpleGrantedAuthority(r.getRoleName()));
				});

				// Retourner un User Spring Security avec username, password et roles
				return new User(appUser.getUsername(), appUser.getPassword(), permissions);
			}
		});
	}

	@Bean
	public SecurityFilterChain filterChain(HttpSecurity http, AuthenticationManager authenticationManager) throws Exception {
	    http.csrf().disable();
	    http.sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS);

	    // désactive la page login HTML (pas de redirect 302)
	    http.formLogin().disable();

	    http.authorizeRequests()
	        .requestMatchers("/refreshToken/**", "/login/**").permitAll()
	        .anyRequest().authenticated();

	    // configure le filtre d’authentification avec le bon endpoint de login
	    JwtAuthenticationFilter jwtAuthenticationFilter = new JwtAuthenticationFilter(authenticationManager);
	    jwtAuthenticationFilter.setFilterProcessesUrl("/login");  // ou "/auth/login" selon ta config Gateway

	    http.addFilter(jwtAuthenticationFilter);
	    http.addFilterBefore(new JwtAuthorizationFilter(), UsernamePasswordAuthenticationFilter.class);

	    return http.build();
	}


}
