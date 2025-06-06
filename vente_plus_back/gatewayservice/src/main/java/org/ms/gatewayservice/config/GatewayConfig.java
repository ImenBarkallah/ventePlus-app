package org.ms.gatewayservice.config;

import org.ms.gatewayservice.filters.AuthenticationFilter;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayConfig {

	private final AuthenticationFilter authenticationFilter;

	public GatewayConfig(AuthenticationFilter authenticationFilter) {
		this.authenticationFilter = authenticationFilter;
	}

	@Bean
	public RouteLocator customRoutes(RouteLocatorBuilder builder) {
		return builder.routes()
		        // Authentification service - sans filtre
		        .route("authentification-service",
		            r -> r.path("/login", "/users/**")
		                  .uri("lb://AUTHENTIFICATION-SERVICE"))
				.route("produitservice",
						r -> r.path("/produits/**").filters(f -> f.filter(authenticationFilter))
								.uri("lb://PRODUITSERVICE"))
				.route("client-service",
						r -> r.path("/clients/**").filters(f -> f.filter(authenticationFilter))
								.uri("lb://CLIENT-SERVICE"))
				.route("categorie-service",
						r -> r.path("/categories/**").filters(f -> f.filter(authenticationFilter))
								.uri("lb://CATEGORIE-SERVICE"))
				.route("factureservice",
						r -> r.path("/factures/**").filters(f -> f.filter(authenticationFilter))
								.uri("lb://FACTURESERVICE"))
				.route("devis-service",
						r -> r.path("/devis/**").filters(f -> f.filter(authenticationFilter)).uri("lb://DEVIS-SERVICE"))
				.build();
	}

}
