package org.ms.produitservice.entities; 
 
import lombok.AllArgsConstructor; 
import lombok.Data; 
import lombok.NoArgsConstructor; 
import lombok.ToString;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.ms.produitservice.model.Categorie;

import jakarta.persistence.Column;
import jakarta.persistence.Entity; 
import jakarta.persistence.GeneratedValue; 
import jakarta.persistence.GenerationType; 
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Transient; 
@Entity 
@Data @NoArgsConstructor @AllArgsConstructor @ToString 
public class Produit { 
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY) 
    private Long id; 
    private String nom; 
    private BigDecimal prix; 
    private long quantite; 
    private String reference;
    private String imageUrl;
    @Column(updatable = false)
    private LocalDateTime createdAt;
    // Optionnel, pour afficher la catégorie côté API sans stocker en base
    @Transient 
    private Categorie categorie;
 // On garde juste l'ID de la catégorie, pas l'entité complète (remote)
    private Long categorieId;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
    }

  
} 