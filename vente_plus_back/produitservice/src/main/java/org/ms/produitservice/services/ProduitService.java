package org.ms.produitservice.services;

import java.util.List;

import org.ms.produitservice.entities.Produit;
import org.springframework.web.multipart.MultipartFile;

public interface ProduitService {
	Produit saveProduitWithImage(Produit produit, MultipartFile image);
  //  Produit saveProduit(Produit produit);
    Produit getProduitWithCategorie(Long id);
    List<Produit> getAllProduits();
  //  Produit updateProduit(Long id, Produit produit);
    Produit updateProduitWithImage(Long id, Produit updatedProduit, MultipartFile image);

    void deleteProduit(Long id);

    // Stock management methods
    boolean reduireStock(Long produitId, long quantite);
    boolean augmenterStock(Long produitId, long quantite);
    long getStockDisponible(Long produitId);
}
