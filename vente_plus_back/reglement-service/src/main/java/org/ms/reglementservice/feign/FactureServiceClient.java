package org.ms.reglementservice.feign;

import org.ms.reglementservice.model.Facture;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "FACTURE-SERVICE")
public interface FactureServiceClient {
    @GetMapping("/factures/{id}")
    Facture getFactureById(@PathVariable Long id);

    @GetMapping("/factures")
    List<Facture> getAllFactures();
}
