package org.ms.dashbordservice.entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.ms.dashbordservice.model.Facture;
import org.ms.dashbordservice.model.Client;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FactureStatus {
    private Facture facture;
    private Client client;
    private BigDecimal montantPaye;
    private BigDecimal montantRestant;
    private boolean estCompletelyPayee;
}
