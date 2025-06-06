package org.ms.categorie_service.entities; 
 
import lombok.AllArgsConstructor; 
import lombok.Data; 
import lombok.NoArgsConstructor; 
import lombok.ToString;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity; 
import jakarta.persistence.GeneratedValue; 
import jakarta.persistence.GenerationType; 
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist; 
@Entity 
@Data @NoArgsConstructor @AllArgsConstructor @ToString 
public class Categorie { 
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY) 
    private Long id; 
    private String nom;    
    private String description;
        private String imageUrl;
    @Column(updatable = false)
    private LocalDateTime createdAt;
     private Boolean etat = true;
     @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
    }

     
} 