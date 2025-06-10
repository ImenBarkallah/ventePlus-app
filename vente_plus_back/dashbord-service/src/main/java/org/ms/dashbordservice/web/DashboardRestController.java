package org.ms.dashbordservice.web;

import lombok.extern.slf4j.Slf4j;
import org.ms.dashbordservice.entities.*;
import org.ms.dashbordservice.model.*;
import org.ms.dashbordservice.services.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/dashboard")
@Slf4j
public class DashboardRestController {

    @Autowired
    private DashboardService dashboardService;

    // Test endpoint for CORS and routing
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        log.info("Test endpoint called");
        return ResponseEntity.ok("Dashboard service is working! CORS and routing are functional.");
    }

    // Analytics par client
    @GetMapping("/client/{clientId}/analytics")
    public ResponseEntity<ClientAnalytics> getClientAnalytics(@PathVariable Long clientId) {
        log.info("Récupération des analytics pour le client: {}", clientId);
        ClientAnalytics analytics = dashboardService.getClientAnalytics(clientId);
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/clients/analytics")
    public ResponseEntity<List<ClientAnalytics>> getAllClientsAnalytics() {
        log.info("Récupération des analytics pour tous les clients");
        List<ClientAnalytics> analytics = dashboardService.getAllClientsAnalytics();
        return ResponseEntity.ok(analytics);
    }

    // Clients les plus fidèles
    @GetMapping("/clients/fideles")
    public ResponseEntity<List<Client>> getClientsPlusFideles(
            @RequestParam(defaultValue = "10") int limit) {
        log.info("Récupération des {} clients les plus fidèles", limit);
        List<Client> clientsFideles = dashboardService.getClientsPlusFideles(limit);
        return ResponseEntity.ok(clientsFideles);
    }

    // Produits les plus vendus
    @GetMapping("/produits/plus-vendus")
    public ResponseEntity<List<ProduitPopularite>> getProduitsPlusVendus(
            @RequestParam(defaultValue = "10") int limit) {
        log.info("Récupération des {} produits les plus vendus", limit);
        List<ProduitPopularite> produits = dashboardService.getProduitsPlusVendus(limit);
        return ResponseEntity.ok(produits);
    }

    @GetMapping("/produits/plus-vendus/annee/{annee}")
    public ResponseEntity<List<ProduitPopularite>> getProduitsPlusVendusParAnnee(
            @PathVariable int annee,
            @RequestParam(defaultValue = "10") int limit) {
        log.info("Récupération des {} produits les plus vendus pour l'année {}", limit, annee);
        List<ProduitPopularite> produits = dashboardService.getProduitsPlusVendusParAnnee(annee, limit);
        return ResponseEntity.ok(produits);
    }

    // Produits en rupture de stock
    @GetMapping("/produits/rupture-stock")
    public ResponseEntity<List<Produit>> getProduitsEnRuptureStock() {
        log.info("Récupération des produits en rupture de stock");
        List<Produit> produits = dashboardService.getProduitsEnRuptureStock();
        return ResponseEntity.ok(produits);
    }

    // Factures réglées et non réglées
    @GetMapping("/factures/reglees")
    public ResponseEntity<List<FactureStatus>> getFacturesReglees() {
        log.info("Récupération des factures réglées");
        List<FactureStatus> factures = dashboardService.getFacturesReglees();
        return ResponseEntity.ok(factures);
    }

    @GetMapping("/factures/non-reglees")
    public ResponseEntity<List<FactureStatus>> getFacturesNonReglees() {
        log.info("Récupération des factures non réglées");
        List<FactureStatus> factures = dashboardService.getFacturesNonReglees();
        return ResponseEntity.ok(factures);
    }

    @GetMapping("/factures/partiellement-reglees")
    public ResponseEntity<List<FactureStatus>> getFacturesPartiellemementReglees() {
        log.info("Récupération des factures partiellement réglées");
        List<FactureStatus> factures = dashboardService.getFacturesPartiellemementReglees();
        return ResponseEntity.ok(factures);
    }

    // Dettes par client
    @GetMapping("/dettes")
    public ResponseEntity<Map<Client, BigDecimal>> getDettesByClient() {
        log.info("Récupération des dettes par client");
        Map<Client, BigDecimal> dettes = dashboardService.getDettesByClient();
        return ResponseEntity.ok(dettes);
    }

    @GetMapping("/client/{clientId}/dettes")
    public ResponseEntity<BigDecimal> getDetteByClient(@PathVariable Long clientId) {
        log.info("Récupération des dettes pour le client: {}", clientId);
        BigDecimal dette = dashboardService.getDetteByClient(clientId);
        return ResponseEntity.ok(dette);
    }

    // Chiffre d'affaires
    @GetMapping("/client/{clientId}/chiffres-affaires")
    public ResponseEntity<BigDecimal> getChiffresAffairesClient(@PathVariable Long clientId) {
        log.info("Récupération du chiffre d'affaires pour le client: {}", clientId);
        BigDecimal chiffresAffaires = dashboardService.getChiffresAffairesClient(clientId);
        return ResponseEntity.ok(chiffresAffaires);
    }

    @GetMapping("/client/{clientId}/chiffres-affaires/annee/{annee}")
    public ResponseEntity<BigDecimal> getChiffresAffairesClientParAnnee(
            @PathVariable Long clientId, @PathVariable int annee) {
        log.info("Récupération du chiffre d'affaires pour le client {} en {}", clientId, annee);
        BigDecimal chiffresAffaires = dashboardService.getChiffresAffairesClientParAnnee(clientId, annee);
        return ResponseEntity.ok(chiffresAffaires);
    }
}
