package org.ms.facture_service.model;

import java.math.BigDecimal;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DevisLigne {
    private Long id;
    private Long produitId;
    private int quantite;
    private BigDecimal prixUnitaire;
}
