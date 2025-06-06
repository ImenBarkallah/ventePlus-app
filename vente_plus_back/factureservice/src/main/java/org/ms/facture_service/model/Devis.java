package org.ms.facture_service.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Devis {
    private Long id;
    private Long clientId;
    private LocalDate dateDevis;
    private BigDecimal montantTotal;
    private String statut;
    private List<DevisLigne> lignes;
}