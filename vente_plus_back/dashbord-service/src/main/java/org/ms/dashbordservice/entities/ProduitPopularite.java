package org.ms.dashbordservice.entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.ms.dashbordservice.model.Produit;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProduitPopularite {
    private Produit produit;
    private long quantiteVendue;
    private BigDecimal chiffresAffaires;
    private int nombreCommandes;
}
