package org.ms.dashbordservice.feign;

import org.ms.dashbordservice.model.Client;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "CLIENT-SERVICE")
public interface ClientServiceClient {
    @GetMapping("/clients/{id}")
    Client getClientById(@PathVariable Long id);
    
    @GetMapping("/clients")
    List<Client> getAllClients();
}
