package org.ms.dashbordservice.entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.ms.dashbordservice.model.Client;

import java.math.BigDecimal;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClientAnalytics {
    private Client client;
    private BigDecimal chiffresAffairesTotal;
    private Map<Integer, BigDecimal> chiffresAffairesParAnnee;
    private BigDecimal montantNonPaye;
    private int nombreFacturesReglees;
    private int nombreFacturesNonReglees;
    private int nombreCommandes;
    private BigDecimal montantMoyenCommande;
}
