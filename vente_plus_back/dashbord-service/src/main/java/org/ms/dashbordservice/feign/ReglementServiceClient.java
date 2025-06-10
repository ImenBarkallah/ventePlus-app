package org.ms.dashbordservice.feign;

import org.ms.dashbordservice.model.Reglement;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.math.BigDecimal;
import java.util.List;

@FeignClient(name = "REGLEMENT-SERVICE")
public interface ReglementServiceClient {
    @GetMapping("/reglements/{id}")
    Reglement getReglementById(@PathVariable Long id);
    
    @GetMapping("/reglements")
    List<Reglement> getAllReglements();
    
    @GetMapping("/reglements/client/{clientId}")
    List<Reglement> getReglementsByClient(@PathVariable Long clientId);
    
    @GetMapping("/reglements/facture/{factureId}")
    List<Reglement> getReglementsByFacture(@PathVariable Long factureId);
    
    @GetMapping("/reglements/total/client/{clientId}")
    BigDecimal getTotalReglementsByClient(@PathVariable Long clientId);
    
    @GetMapping("/reglements/total/client/{clientId}/annee/{annee}")
    BigDecimal getTotalReglementsByClientAndYear(@PathVariable Long clientId, @PathVariable int annee);
    
    @GetMapping("/reglements/total/facture/{factureId}")
    BigDecimal getTotalReglementsByFacture(@PathVariable Long factureId);
    
    @GetMapping("/reglements/restant/facture/{factureId}")
    BigDecimal getMontantRestantFacture(@PathVariable Long factureId);
    
    @GetMapping("/reglements/facture/{factureId}/payee")
    Boolean isFactureCompletelyPayee(@PathVariable Long factureId);
    
    @GetMapping("/reglements/factures/non-reglees")
    List<Long> getFacturesNonReglees();
    
    @GetMapping("/reglements/factures/partiellement-reglees")
    List<Long> getFacturesPartiellemementReglees();
}
