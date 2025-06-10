package org.ms.devis_service.security;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.context.annotation.Bean;

import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.cors(cors -> cors.disable()).csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/dashboard/**").hasAnyRole("USER", "ADMIN") // Modifier selon les rÃ´les
                        .requestMatchers(HttpMethod.POST, "/dashboard/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/dashboard/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/dashboard/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/dashboard/**").hasRole("ADMIN")
                        .anyRequest().authenticated())
                .oauth2ResourceServer(
                        oauth2 -> oauth2.jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter())));

        return http.build();
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter jwtConverter = new JwtAuthenticationConverter();
        jwtConverter.setJwtGrantedAuthoritiesConverter(jwt -> {
            List<GrantedAuthority> authorities = new ArrayList<>();

            Map<String, Object> resourceAccess = jwt.getClaim("resource_access");
            if (resourceAccess != null && resourceAccess.containsKey("spring-app")) {
                Object springAppObj = resourceAccess.get("spring-app");
                if (springAppObj instanceof Map) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> springApp = (Map<String, Object>) springAppObj;
                    if (springApp != null && springApp.containsKey("roles")) {
                        Object rolesObj = springApp.get("roles");
                        if (rolesObj instanceof List<?>) {
                            List<?> rolesList = (List<?>) rolesObj;
                            for (Object roleObj : rolesList) {
                                if (roleObj instanceof String) {
                                    authorities.add(new SimpleGrantedAuthority("ROLE_" + roleObj));
                                }
                            }
                        }
                    }
                }
            }

            return authorities;
        });
        return jwtConverter;
    }

}