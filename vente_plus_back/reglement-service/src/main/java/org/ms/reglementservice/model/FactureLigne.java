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
public class FactureLigne {
    private Long id;
    private Long produitID;
    private BigDecimal prix;
    private int quantite;
    private Produit produit;
}
