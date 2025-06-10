package org.ms.dashbordservice.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Produit {
    private Long id;
    private String nom;
    private BigDecimal prix;
    private long quantite;
    private String reference;
    private String imageUrl;
    private LocalDateTime createdAt;
    private Long categorieId;
    private Categorie categorie;
}
