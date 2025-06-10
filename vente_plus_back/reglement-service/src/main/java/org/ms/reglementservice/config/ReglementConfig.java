package org.ms.reglementservice.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@Configuration
@EnableJpaRepositories(basePackages = "org.ms.reglementservice.repository")
public class ReglementConfig {
}
