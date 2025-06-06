package org.ms.facture_service.feign;

import org.ms.facture_service.model.Devis;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "DEVIS-SERVICE")
public interface DevisServiceClient {

    @GetMapping("/devis/{id}")
    Devis getDevisById(@PathVariable("id") Long id);
}
