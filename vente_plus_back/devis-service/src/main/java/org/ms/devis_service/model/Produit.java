package org.ms.devis_service.model;

import java.math.BigDecimal;

import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @ToString 
public class Produit { 
    private Long id; 
    private String nom; 
    private BigDecimal prix; 
    private long quantite; 
   private String reference;    
   
} 