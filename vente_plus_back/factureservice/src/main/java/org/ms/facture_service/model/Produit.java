package org.ms.facture_service.model;


import java.math.BigDecimal;

import lombok.AllArgsConstructor; 
import lombok.Data; 
import lombok.NoArgsConstructor; 
import lombok.ToString; 
 
@Data @NoArgsConstructor @AllArgsConstructor @ToString 
public class Produit { 
    private Long id; 
    private String nom; 
    private BigDecimal prix; 
    private long quantite; 
   
} 