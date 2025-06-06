package org.ms.devis_service.feign;

import org.ms.devis_service.model.Client;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "CLIENT-SERVICE")
public interface ClientServiceClient {
    @GetMapping("/clients/{id}")
    Client getClientById(@PathVariable Long id);
}
