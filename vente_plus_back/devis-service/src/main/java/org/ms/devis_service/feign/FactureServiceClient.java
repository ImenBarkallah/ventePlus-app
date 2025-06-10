package org.ms.devis_service.feign;

import org.ms.devis_service.model.Facture;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;

@FeignClient(name = "FACTURE-SERVICE")
public interface FactureServiceClient {

    @PostMapping("/factures/from-devis/{devisId}")
    Facture creerFactureDepuisDevis(@PathVariable("devisId") Long devisId);
}

