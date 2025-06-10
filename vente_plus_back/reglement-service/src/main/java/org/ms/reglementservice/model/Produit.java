package org.ms.reglementservice.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.math.BigDecimal;

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
    private Long categorieId;
}
