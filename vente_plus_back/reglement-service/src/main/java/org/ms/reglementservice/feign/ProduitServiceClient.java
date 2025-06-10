package org.ms.reglementservice.feign;

import org.ms.reglementservice.model.Produit;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;

import java.util.List;

@FeignClient(name = "PRODUIT-SERVICE")
public interface ProduitServiceClient {
    @GetMapping("/produits/{id}")
    Produit findProductById(@PathVariable Long id);
    
    @GetMapping("/produits")
    List<Produit> getAllProduits();
    
    @PutMapping("/produits/{id}/reduire-stock/{quantite}")
    boolean reduireStock(@PathVariable Long id, @PathVariable long quantite);
    
    @PutMapping("/produits/{id}/augmenter-stock/{quantite}")
    boolean augmenterStock(@PathVariable Long id, @PathVariable long quantite);
    
    @GetMapping("/produits/{id}/stock")
    long getStockDisponible(@PathVariable Long id);
}
