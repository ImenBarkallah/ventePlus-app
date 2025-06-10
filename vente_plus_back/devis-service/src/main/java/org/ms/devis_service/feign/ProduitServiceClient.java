package org.ms.devis_service.feign;

import java.util.List;

import org.ms.devis_service.model.Produit;
import org.springframework.cloud.openfeign.FeignClient; 
import org.springframework.web.bind.annotation.GetMapping; 
import org.springframework.web.bind.annotation.PathVariable; 
 
@FeignClient(name="PRODUIT-SERVICE")
public interface ProduitServiceClient { 
    @GetMapping(path="/produits") 
    List<Produit> getAllProduits(); 
    @GetMapping(path="/produits/{id}") 
    Produit findProductById(@PathVariable(name="id") Long id); 
} 
