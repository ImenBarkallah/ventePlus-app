package org.ms.reglementservice.web;

import lombok.extern.slf4j.Slf4j;
import org.ms.reglementservice.entities.FactureStatus;
import org.ms.reglementservice.entities.ModeReglement;
import org.ms.reglementservice.entities.Reglement;
import org.ms.reglementservice.services.ReglementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/reglements")
@Slf4j
public class ReglementRestController {

    @Autowired
    private ReglementService reglementService;

    @PostMapping
    public ResponseEntity<Reglement> createReglement(@RequestBody Reglement reglement) {
        log.info("Création d'un nouveau règlement");
        Reglement nouveauReglement = reglementService.createReglement(reglement);
        return ResponseEntity.ok(nouveauReglement);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Reglement> getReglementById(@PathVariable Long id) {
        log.info("Récupération du règlement avec l'ID: {}", id);
        Reglement reglement = reglementService.getReglementById(id);
        return ResponseEntity.ok(reglement);
    }

    @GetMapping
    public ResponseEntity<List<Reglement>> getAllReglements() {
        log.info("Récupération de tous les règlements");
        List<Reglement> reglements = reglementService.getAllReglements();
        return ResponseEntity.ok(reglements);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Reglement> updateReglement(@PathVariable Long id, @RequestBody Reglement reglement) {
        log.info("Mise à jour du règlement avec l'ID: {}", id);
        Reglement reglementMisAJour = reglementService.updateReglement(id, reglement);
        return ResponseEntity.ok(reglementMisAJour);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReglement(@PathVariable Long id) {
        log.info("Suppression du règlement avec l'ID: {}", id);
        reglementService.deleteReglement(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/facture/{factureId}")
    public ResponseEntity<List<Reglement>> getReglementsByFacture(@PathVariable Long factureId) {
        log.info("Récupération des règlements pour la facture: {}", factureId);
        List<Reglement> reglements = reglementService.getReglementsByFacture(factureId);
        return ResponseEntity.ok(reglements);
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<Reglement>> getReglementsByClient(@PathVariable Long clientId) {
        log.info("Récupération des règlements pour le client: {}", clientId);
        List<Reglement> reglements = reglementService.getReglementsByClient(clientId);
        return ResponseEntity.ok(reglements);
    }

    @GetMapping("/mode/{modeReglement}")
    public ResponseEntity<List<Reglement>> getReglementsByMode(@PathVariable ModeReglement modeReglement) {
        log.info("Récupération des règlements par mode: {}", modeReglement);
        List<Reglement> reglements = reglementService.getReglementsByModeReglement(modeReglement);
        return ResponseEntity.ok(reglements);
    }

    @GetMapping("/periode")
    public ResponseEntity<List<Reglement>> getReglementsByPeriode(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateDebut,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateFin) {
        log.info("Récupération des règlements entre {} et {}", dateDebut, dateFin);
        List<Reglement> reglements = reglementService.getReglementsByPeriode(dateDebut, dateFin);
        return ResponseEntity.ok(reglements);
    }

    @GetMapping("/total/facture/{factureId}")
    public ResponseEntity<BigDecimal> getTotalReglementsByFacture(@PathVariable Long factureId) {
        log.info("Calcul du total des règlements pour la facture: {}", factureId);
        BigDecimal total = reglementService.getTotalReglementsByFacture(factureId);
        return ResponseEntity.ok(total);
    }

    @GetMapping("/total/client/{clientId}")
    public ResponseEntity<BigDecimal> getTotalReglementsByClient(@PathVariable Long clientId) {
        log.info("Calcul du total des règlements pour le client: {}", clientId);
        BigDecimal total = reglementService.getTotalReglementsByClient(clientId);
        return ResponseEntity.ok(total);
    }

    @GetMapping("/total/client/{clientId}/annee/{annee}")
    public ResponseEntity<BigDecimal> getTotalReglementsByClientAndYear(
            @PathVariable Long clientId, @PathVariable int annee) {
        log.info("Calcul du total des règlements pour le client {} en {}", clientId, annee);
        BigDecimal total = reglementService.getTotalReglementsByClientAndYear(clientId, annee);
        return ResponseEntity.ok(total);
    }

    @GetMapping("/restant/facture/{factureId}")
    public ResponseEntity<BigDecimal> getMontantRestantFacture(@PathVariable Long factureId) {
        log.info("Calcul du montant restant pour la facture: {}", factureId);
        BigDecimal montantRestant = reglementService.getMontantRestantFacture(factureId);
        return ResponseEntity.ok(montantRestant);
    }

    @GetMapping("/facture/{factureId}/payee")
    public ResponseEntity<Boolean> isFactureCompletelyPayee(@PathVariable Long factureId) {
        log.info("Vérification si la facture {} est complètement payée", factureId);
        boolean estPayee = reglementService.isFactureCompletelyPayee(factureId);
        return ResponseEntity.ok(estPayee);
    }

    @GetMapping("/factures/non-reglees")
    public ResponseEntity<List<Long>> getFacturesNonReglees() {
        log.info("Récupération des factures non réglées");
        List<Long> facturesNonReglees = reglementService.getFacturesNonReglees();
        return ResponseEntity.ok(facturesNonReglees);
    }

    @GetMapping("/factures/partiellement-reglees")
    public ResponseEntity<List<Long>> getFacturesPartiellemementReglees() {
        log.info("Récupération des factures partiellement réglées");
        List<Long> facturesPartielles = reglementService.getFacturesPartiellemementReglees();
        return ResponseEntity.ok(facturesPartielles);
    }

    @GetMapping("/factures/reglees")
    public ResponseEntity<List<Long>> getFacturesReglees() {
        log.info("Récupération des factures complètement réglées");
        List<Long> facturesReglees = reglementService.getFacturesReglees();
        return ResponseEntity.ok(facturesReglees);
    }

    @GetMapping("/annee/{annee}")
    public ResponseEntity<List<Reglement>> getReglementsByYear(@PathVariable int annee) {
        log.info("Récupération des règlements pour l'année: {}", annee);
        List<Reglement> reglements = reglementService.getReglementsByYear(annee);
        return ResponseEntity.ok(reglements);
    }

    // New endpoints for FactureStatus with details
    @GetMapping("/factures/non-reglees/details")
    public ResponseEntity<List<FactureStatus>> getFacturesNonRegleesWithDetails() {
        log.info("Récupération des factures non réglées avec détails");
        List<FactureStatus> facturesStatus = reglementService.getFacturesNonRegleesWithDetails();
        return ResponseEntity.ok(facturesStatus);
    }

    @GetMapping("/factures/partiellement-reglees/details")
    public ResponseEntity<List<FactureStatus>> getFacturesPartiellemementRegleesWithDetails() {
        log.info("Récupération des factures partiellement réglées avec détails");
        List<FactureStatus> facturesStatus = reglementService.getFacturesPartiellemementRegleesWithDetails();
        return ResponseEntity.ok(facturesStatus);
    }

    @GetMapping("/factures/reglees/details")
    public ResponseEntity<List<FactureStatus>> getFacturesRegleesWithDetails() {
        log.info("Récupération des factures complètement réglées avec détails");
        List<FactureStatus> facturesStatus = reglementService.getFacturesRegleesWithDetails();
        return ResponseEntity.ok(facturesStatus);
    }
}
