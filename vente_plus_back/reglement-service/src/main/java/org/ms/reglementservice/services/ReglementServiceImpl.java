package org.ms.reglementservice.services;

import lombok.extern.slf4j.Slf4j;
import org.ms.reglementservice.entities.FactureStatus;
import org.ms.reglementservice.entities.ModeReglement;
import org.ms.reglementservice.entities.Reglement;
import org.ms.reglementservice.feign.ClientServiceClient;
import org.ms.reglementservice.feign.FactureServiceClient;
import org.ms.reglementservice.feign.ProduitServiceClient;
import org.ms.reglementservice.model.Client;
import org.ms.reglementservice.model.Facture;
import org.ms.reglementservice.model.FactureLigne;
import org.ms.reglementservice.repository.ReglementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
@Slf4j
public class ReglementServiceImpl implements ReglementService {

    @Autowired
    private ReglementRepository reglementRepository;
    
    @Autowired
    private FactureServiceClient factureServiceClient;

    @Autowired
    private ClientServiceClient clientServiceClient;

    @Autowired
    private ProduitServiceClient produitServiceClient;

    @Override
    public Reglement createReglement(Reglement reglement) {
        log.info("Création d'un nouveau règlement");
        
        // Générer le numéro de règlement
        reglement.setNumeroReglement(genererNumeroReglement());
        
        // Valider que la facture existe
        Facture facture = factureServiceClient.getFactureById(reglement.getFactureId());
        if (facture == null) {
            throw new IllegalArgumentException("Facture introuvable avec l'ID: " + reglement.getFactureId());
        }
        
        // Valider que le montant n'excède pas le montant restant
        BigDecimal montantRestant = getMontantRestantFacture(reglement.getFactureId());
        if (reglement.getMontantPaye().compareTo(montantRestant) > 0) {
            throw new IllegalArgumentException("Le montant du règlement excède le montant restant de la facture");
        }
        
        reglement.setClientId(facture.getClientID());

        // Sauvegarder le règlement
        Reglement savedReglement = reglementRepository.save(reglement);

        // Vérifier si la facture est maintenant complètement payée
        if (isFactureCompletelyPayee(reglement.getFactureId())) {
            log.info("Facture {} complètement payée, réduction du stock", reglement.getFactureId());
            reduireStockPourFacture(facture);
        }

        log.info("Règlement créé avec succès: {}", savedReglement.getNumeroReglement());
        return savedReglement;
    }

    @Override
    public Reglement getReglementById(Long id) {
        return reglementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Règlement introuvable avec l'ID: " + id));
    }

    @Override
    public List<Reglement> getAllReglements() {
        return reglementRepository.findAll();
    }

    @Override
    public Reglement updateReglement(Long id, Reglement reglementDetails) {
        log.info("Mise à jour du règlement avec l'ID: {}", id);
        Reglement reglement = getReglementById(id);
        
        reglement.setMontantPaye(reglementDetails.getMontantPaye());
        reglement.setModeReglement(reglementDetails.getModeReglement());
        reglement.setReference(reglementDetails.getReference());
        reglement.setCommentaire(reglementDetails.getCommentaire());
        
        return reglementRepository.save(reglement);
    }

    @Override
    public void deleteReglement(Long id) {
        log.info("Suppression du règlement avec l'ID: {}", id);
        reglementRepository.deleteById(id);
    }

    @Override
    public List<Reglement> getReglementsByFacture(Long factureId) {
        return reglementRepository.findByFactureId(factureId);
    }

    @Override
    public List<Reglement> getReglementsByClient(Long clientId) {
        return reglementRepository.findByClientIdOrderByDateReglementDesc(clientId);
    }

    @Override
    public List<Reglement> getReglementsByModeReglement(ModeReglement modeReglement) {
        return reglementRepository.findByModeReglement(modeReglement);
    }

    @Override
    public List<Reglement> getReglementsByPeriode(LocalDateTime dateDebut, LocalDateTime dateFin) {
        return reglementRepository.findByDateReglementBetween(dateDebut, dateFin);
    }

    @Override
    public BigDecimal getTotalReglementsByFacture(Long factureId) {
        BigDecimal total = reglementRepository.getTotalReglementsByFacture(factureId);
        return total != null ? total : BigDecimal.ZERO;
    }

    @Override
    public BigDecimal getTotalReglementsByClient(Long clientId) {
        BigDecimal total = reglementRepository.getTotalReglementsByClient(clientId);
        return total != null ? total : BigDecimal.ZERO;
    }

    @Override
    public BigDecimal getTotalReglementsByClientAndYear(Long clientId, int annee) {
        BigDecimal total = reglementRepository.getTotalReglementsByClientAndYear(clientId, annee);
        return total != null ? total : BigDecimal.ZERO;
    }

    @Override
    public BigDecimal getMontantRestantFacture(Long factureId) {
        Facture facture = factureServiceClient.getFactureById(factureId);
        if (facture == null) {
            throw new IllegalArgumentException("Facture introuvable");
        }
        
        BigDecimal totalReglements = getTotalReglementsByFacture(factureId);
        return facture.getMontantTTC().subtract(totalReglements);
    }

    @Override
    public boolean isFactureCompletelyPayee(Long factureId) {
        BigDecimal montantRestant = getMontantRestantFacture(factureId);
        return montantRestant.compareTo(BigDecimal.ZERO) <= 0;
    }

    @Override
    public List<Long> getFacturesNonReglees() {
        List<Facture> factures = factureServiceClient.getAllFactures();
        return factures.stream()
                .filter(facture -> getTotalReglementsByFacture(facture.getId()).compareTo(BigDecimal.ZERO) == 0)
                .map(Facture::getId)
                .collect(Collectors.toList());
    }

    @Override
    public List<Long> getFacturesPartiellemementReglees() {
        List<Facture> factures = factureServiceClient.getAllFactures();
        return factures.stream()
                .filter(facture -> {
                    BigDecimal totalReglements = getTotalReglementsByFacture(facture.getId());
                    return totalReglements.compareTo(BigDecimal.ZERO) > 0 && 
                           totalReglements.compareTo(facture.getMontantTTC()) < 0;
                })
                .map(Facture::getId)
                .collect(Collectors.toList());
    }

    private String genererNumeroReglement() {
        return "REG-" + System.currentTimeMillis() + "-" + new Random().nextInt(1000);
    }

    @Override
    public List<Long> getFacturesReglees() {
        log.info("Récupération des factures complètement réglées");
        try {
            List<Facture> allFactures = factureServiceClient.getAllFactures();
            return allFactures.stream()
                    .filter(facture -> isFactureCompletelyPayee(facture.getId()))
                    .map(Facture::getId)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Erreur lors de la récupération des factures réglées: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    @Override
    public List<Reglement> getReglementsByYear(int annee) {
        log.info("Récupération des règlements pour l'année: {}", annee);
        try {
            return reglementRepository.findAll().stream()
                    .filter(reglement -> reglement.getDateReglement().getYear() == annee)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Erreur lors de la récupération des règlements par année: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    /**
     * Réduit le stock des produits d'une facture quand elle est complètement payée
     */
    private void reduireStockPourFacture(Facture facture) {
        try {
            log.info("Début de la réduction du stock pour la facture {}", facture.getId());

            if (facture.getFacturelignes() == null || facture.getFacturelignes().isEmpty()) {
                log.warn("Aucune ligne de facture trouvée pour la facture {}", facture.getId());
                return;
            }

            for (FactureLigne ligne : facture.getFacturelignes()) {
                try {
                    boolean success = produitServiceClient.reduireStock(ligne.getProduitID(), ligne.getQuantite());
                    if (success) {
                        log.info("Stock réduit avec succès pour le produit {} : -{} unités",
                                ligne.getProduitID(), ligne.getQuantite());
                    } else {
                        log.error("Échec de la réduction du stock pour le produit {} : -{} unités",
                                ligne.getProduitID(), ligne.getQuantite());
                    }
                } catch (Exception e) {
                    log.error("Erreur lors de la réduction du stock pour le produit {} : {}",
                            ligne.getProduitID(), e.getMessage());
                }
            }

            log.info("Fin de la réduction du stock pour la facture {}", facture.getId());
        } catch (Exception e) {
            log.error("Erreur générale lors de la réduction du stock pour la facture {} : {}",
                    facture.getId(), e.getMessage());
        }
    }

    @Override
    public List<FactureStatus> getFacturesNonRegleesWithDetails() {
        log.info("Récupération des factures non réglées avec détails");
        try {
            List<Facture> factures = factureServiceClient.getAllFactures();
            return factures.stream()
                    .filter(facture -> getTotalReglementsByFacture(facture.getId()).compareTo(BigDecimal.ZERO) == 0)
                    .map(this::createFactureStatus)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Erreur lors de la récupération des factures non réglées: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    @Override
    public List<FactureStatus> getFacturesPartiellemementRegleesWithDetails() {
        log.info("Récupération des factures partiellement réglées avec détails");
        try {
            List<Facture> factures = factureServiceClient.getAllFactures();
            return factures.stream()
                    .filter(facture -> {
                        BigDecimal totalReglements = getTotalReglementsByFacture(facture.getId());
                        return totalReglements.compareTo(BigDecimal.ZERO) > 0 &&
                               totalReglements.compareTo(facture.getMontantTTC()) < 0;
                    })
                    .map(this::createFactureStatus)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Erreur lors de la récupération des factures partiellement réglées: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    @Override
    public List<FactureStatus> getFacturesRegleesWithDetails() {
        log.info("Récupération des factures complètement réglées avec détails");
        try {
            List<Facture> factures = factureServiceClient.getAllFactures();
            return factures.stream()
                    .filter(facture -> isFactureCompletelyPayee(facture.getId()))
                    .map(this::createFactureStatus)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Erreur lors de la récupération des factures réglées: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    private FactureStatus createFactureStatus(Facture facture) {
        try {
            Client client = clientServiceClient.getClientById(facture.getClientID());
            BigDecimal montantPaye = getTotalReglementsByFacture(facture.getId());
            BigDecimal montantRestant = getMontantRestantFacture(facture.getId());
            boolean estCompletelyPayee = montantRestant.compareTo(BigDecimal.ZERO) <= 0;

            return new FactureStatus(facture, client, montantPaye, montantRestant, estCompletelyPayee);
        } catch (Exception e) {
            log.error("Erreur lors de la création du FactureStatus pour la facture {}: {}", facture.getId(), e.getMessage());
            // Return a basic FactureStatus with null client if client service fails
            BigDecimal montantPaye = getTotalReglementsByFacture(facture.getId());
            BigDecimal montantRestant = getMontantRestantFacture(facture.getId());
            boolean estCompletelyPayee = montantRestant.compareTo(BigDecimal.ZERO) <= 0;

            return new FactureStatus(facture, null, montantPaye, montantRestant, estCompletelyPayee);
        }
    }
}
