package org.ms.dashbordservice.feign;

import org.ms.dashbordservice.model.Produit;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "PRODUIT-SERVICE")
public interface ProduitServiceClient {
    @GetMapping("/produits/{id}")
    Produit findProductById(@PathVariable Long id);

    @GetMapping("/produits")
    List<Produit> getAllProduits();
}
