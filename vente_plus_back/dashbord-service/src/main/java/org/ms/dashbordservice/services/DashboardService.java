package org.ms.dashbordservice.services;

import org.ms.dashbordservice.entities.*;
import org.ms.dashbordservice.model.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public interface DashboardService {

    // Analytics par client
    ClientAnalytics getClientAnalytics(Long clientId);
    List<ClientAnalytics> getAllClientsAnalytics();

    // Clients les plus fidèles
    List<Client> getClientsPlusFideles(int limit);

    // Produits les plus vendus
    List<ProduitPopularite> getProduitsPlusVendus(int limit);
    List<ProduitPopularite> getProduitsPlusVendusParAnnee(int annee, int limit);

    // Produits en rupture de stock
    List<Produit> getProduitsEnRuptureStock();

    // Factures réglées et non réglées
    List<FactureStatus> getFacturesReglees();
    List<FactureStatus> getFacturesNonReglees();
    List<FactureStatus> getFacturesPartiellemementReglees();

    // Dettes par client
    Map<Client, BigDecimal> getDettesByClient();
    BigDecimal getDetteByClient(Long clientId);

    // Chiffre d'affaires par client et année
    BigDecimal getChiffresAffairesClient(Long clientId);
    BigDecimal getChiffresAffairesClientParAnnee(Long clientId, int annee);
}
