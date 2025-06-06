package org.ms.produitservice.services;


import org.ms.produitservice.entities.Produit;
import org.ms.produitservice.feign.CategorieServiceClient;
import org.ms.produitservice.model.Categorie;
import org.ms.produitservice.repository.ProduitRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service

public class ProduitServiceImpl implements ProduitService {

    private final ProduitRepository produitRepository;
    private final CategorieServiceClient categorieServiceClient;
    private final CloudinaryService cloudinaryService;

    public ProduitServiceImpl(ProduitRepository produitRepository, CategorieServiceClient categorieRestClient, CloudinaryService cloudinaryService) {
        this.produitRepository = produitRepository;
        this.categorieServiceClient = categorieRestClient;
        this.cloudinaryService = cloudinaryService;
    }
    
    
    @Override
    public Produit saveProduitWithImage(Produit produit, MultipartFile image) {
        if (image != null && !image.isEmpty()) {
            try {
                String imageUrl = cloudinaryService.uploadImage(image);
                produit.setImageUrl(imageUrl);
            } catch (IOException e) {
                throw new RuntimeException("Erreur lors de l’upload de l’image", e);
            }
        }

        Produit savedProduit = produitRepository.save(produit);

        try {
            Categorie cat = categorieServiceClient.findCategorieById(produit.getCategorieId());
            savedProduit.setCategorie(cat);
        } catch (Exception e) {
            System.out.println("Erreur lors de la récupération de la catégorie : " + e.getMessage());
        }

        return savedProduit;
    }




   /* @Override
    public Produit saveProduit(Produit produit) {
        Produit savedProduit = produitRepository.save(produit);
        try {
            Categorie cat = categorieServiceClient.findCategorieById(produit.getCategorieId());
            savedProduit.setCategorie(cat);
        } catch (Exception e) {
            System.out.println("Erreur lors de la récupération de la catégorie : " + e.getMessage());
        }
        return savedProduit;
    }
    */
    @Override
    public Produit getProduitWithCategorie(Long id) {
        Produit produit = produitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produit non trouvé"));

        if (produit.getCategorieId() != null) {
            Categorie categorie = categorieServiceClient.findCategorieById(produit.getCategorieId());
            produit.setCategorie(categorie);
        }

        return produit;
    }

    @Override
    public List<Produit> getAllProduits() {
        List<Produit> produits = produitRepository.findAllByOrderByCreatedAtDesc();

        // Charger la catégorie pour chaque produit (optionnel)
        produits.forEach(p -> {
            if (p.getCategorieId() != null) {
                Categorie c = categorieServiceClient.findCategorieById(p.getCategorieId());
                p.setCategorie(c);
            }
        });

        return produits;
    }
    
    
  /*  @Override
    public Produit updateProduit(Long id, Produit updatedProduit) {
        Produit existingProduit = produitRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Produit introuvable avec id : " + id));

        existingProduit.setNom(updatedProduit.getNom());
        existingProduit.setPrix(updatedProduit.getPrix());
        existingProduit.setQuantite(updatedProduit.getQuantite());
        existingProduit.setReference(updatedProduit.getReference());

        // Met à jour la catégorie via le Feign Client
        if (updatedProduit.getCategorieId() != null) {
            Categorie categorie = categorieServiceClient.findCategorieById(updatedProduit.getCategorieId());
            existingProduit.setCategorieId(categorie.getId());
            existingProduit.setCategorie(categorie);
        }

        return produitRepository.save(existingProduit);
    }
    */
    
    @Override
    public Produit updateProduitWithImage(Long id, Produit updatedProduit, MultipartFile image) {
        Produit existingProduit = produitRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Produit introuvable avec id : " + id));

        existingProduit.setNom(updatedProduit.getNom());
        existingProduit.setPrix(updatedProduit.getPrix());
        existingProduit.setQuantite(updatedProduit.getQuantite());
        existingProduit.setReference(updatedProduit.getReference());

        // Mise à jour de la catégorie
        if (updatedProduit.getCategorieId() != null) {
            Categorie categorie = categorieServiceClient.findCategorieById(updatedProduit.getCategorieId());
            existingProduit.setCategorieId(categorie.getId());
            existingProduit.setCategorie(categorie);
        }

        // Mise à jour de l'image (upload via Cloudinary)
        if (image != null && !image.isEmpty()) {
            try {
                String imageUrl = cloudinaryService.uploadImage(image);
                existingProduit.setImageUrl(imageUrl);
            } catch (IOException e) {
                throw new RuntimeException("Erreur lors de l’upload de l’image", e);
            }
        }

        return produitRepository.save(existingProduit);
    }


    @Override
    public void deleteProduit(Long id) {
        produitRepository.deleteById(id);
    }
}