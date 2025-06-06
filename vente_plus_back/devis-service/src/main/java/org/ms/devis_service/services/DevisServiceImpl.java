package org.ms.devis_service.services;

import java.util.List;
import java.util.Random;

import org.ms.devis_service.entities.Devis;
import org.ms.devis_service.entities.DevisLigne;
import org.ms.devis_service.entities.StatutDevis;
import org.ms.devis_service.feign.ClientServiceClient;
import org.ms.devis_service.feign.FactureServiceClient;
import org.ms.devis_service.feign.ProduitServiceClient;
import org.ms.devis_service.model.Client;
import org.ms.devis_service.model.Produit;
import org.ms.devis_service.repository.DevisRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
@Transactional
@Slf4j
public class DevisServiceImpl implements DevisService {

    @Autowired
    private DevisRepository devisRepository;
    
    @Autowired
    private ClientServiceClient clientService;
    
    @Autowired
    private ProduitServiceClient produitService;
    @Autowired
    private FactureServiceClient factureServiceClient;

    @Override
    public Devis createDevis(Devis devis) {
        log.info("Création d'un nouveau devis");
        // Générer le numéro de devis
        devis.setNumeroDevis(genererNumeroDevis());
        // Définir la date de création
        devis.setDateDevis(LocalDate.now());
        // Définir le statut initial
        devis.setStatut(StatutDevis.EN_ATTENTE);
        // Calculer les montants
        calculerMontants(devis);
        return devisRepository.save(devis);
    }

    @Override
    public Devis getDevisById(Long id) {
        log.info("Récupération du devis avec l'id: {}", id);
        Devis devis = devisRepository.findById(id).orElse(null);
        if (devis == null) {
            throw new RuntimeException("Devis non trouvé avec l'id: " + id);
        }
        return devis;
    }

    @Override
    public List<Devis> getAllDevis() {
        log.info("Récupération de tous les devis");

        List<Devis> devisList = devisRepository.findAll();

        for (Devis devis : devisList) {
            // Récupérer le client via Feign
            if (devis.getClientId() != null) {
                try {
                    Client client = clientService.getClientById(devis.getClientId());
                    devis.setClient(client);
                } catch (Exception e) {
                    log.error("Erreur lors de la récupération du client pour le devis id {}: {}", devis.getId(), e.getMessage());
                }
            }

            // Récupérer les produits pour chaque ligne
            for (DevisLigne ligne : devis.getLignes()) {
                if (ligne.getProduitId() != null) {
                    try {
                        Produit produit = produitService.findProductById(ligne.getProduitId());
                        ligne.setProduit(produit);
                    } catch (Exception e) {
                        log.error("Erreur lors de la récupération du produit pour la ligne id {}: {}", ligne.getId(), e.getMessage());
                    }
                }
            }
        }

        return devisList;
    }


    @Override
    public Devis updateDevis(Long id, Devis devisDetails) {
        log.info("Mise à jour du devis avec l'id: {}", id);
        Devis devis = getDevisById(id);
        
        // Vérifier si le devis peut être modifié
        if (devis.getStatut() != StatutDevis.EN_ATTENTE) {
            throw new IllegalStateException("Le devis ne peut pas être modifié car il n'est pas en attente");
        }
        
        // Mettre à jour les champs
        devis.setClientId(devisDetails.getClientId());
        devis.setLignes(devisDetails.getLignes());
        devis.setDateValidite(devisDetails.getDateValidite());
        
        // Recalculer les montants
        calculerMontants(devis);
        
        return devisRepository.save(devis);
    }

    @Override
    public void deleteDevis(Long id) {
        log.info("Suppression du devis avec l'id: {}", id);
        Devis devis = getDevisById(id);
        if (devis.getStatut() != StatutDevis.EN_ATTENTE) {
            throw new IllegalStateException("Le devis ne peut pas être supprimé car il n'est pas en attente");
        }
        devisRepository.delete(devis);
    }

    @Override
    public Devis validateDevis(Long id) {
        log.info("Validation du devis avec l'id: {}", id);
        Devis devis = getDevisById(id);

        if (devis.getStatut() != StatutDevis.EN_ATTENTE) {
            throw new IllegalStateException("Le devis ne peut pas être validé car il n'est pas en attente");
        }

        devis.setStatut(StatutDevis.VALIDE);
        Devis devisValide = devisRepository.save(devis);

        // ✅ Création de la facture après validation
        try {
            factureServiceClient.creerFactureDepuisDevis(devisValide.getId());
            log.info("Facture créée avec succès pour le devis {}", devisValide.getId());
        } catch (Exception e) {
            log.error("Erreur lors de la création de la facture : {}", e.getMessage());
            // tu peux aussi gérer une alerte, un retry, etc.
        }

        return devisValide;
    }

    @Override
    public Devis annulerDevis(Long id) {
        log.info("Annulation du devis avec l'id: {}", id);
        Devis devis = getDevisById(id);
        if (devis.getStatut() == StatutDevis.CONVERTI) {
            throw new IllegalStateException("Le devis ne peut pas être annulé car il a déjà été converti en facture");
        }
        devis.setStatut(StatutDevis.ANNULE);
        return devisRepository.save(devis);
    }

    @Override
    public Devis convertirEnFacture(Long id) {
        log.info("Conversion du devis en facture avec l'id: {}", id);
        Devis devis = getDevisById(id);
        if (devis.getStatut() != StatutDevis.VALIDE) {
            throw new IllegalStateException("Le devis ne peut pas être converti en facture car il n'est pas validé");
        }
        devis.setStatut(StatutDevis.CONVERTI);
        return devisRepository.save(devis);
    }

    @Override
    public List<Devis> getDevisByClientId(Long clientId) {
        log.info("Récupération des devis pour le client avec l'id: {}", clientId);
        return devisRepository.findByClientId(clientId);
    }

    @Override
    public List<Devis> getDevisByStatut(StatutDevis statut) {
        log.info("Récupération des devis avec le statut: {}", statut);
        return devisRepository.findByStatut(statut);
    }

    // Méthodes privées utilitaires
    private String genererNumeroDevis() {
        // Format: DEV-YYYYMMDD-XXX
        return "DEV-" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) + 
               "-" + String.format("%03d", new Random().nextInt(1000));
    }

  private void calculerMontants(Devis devis) {
    BigDecimal montantHT = BigDecimal.ZERO;

    // Calculate total HT from lines
    for (DevisLigne ligne : devis.getLignes()) {
        BigDecimal prixUnitaire = ligne.getPrixUnitaire();
        int quantite = ligne.getQuantite();
        BigDecimal remise = ligne.getRemise() != null ? ligne.getRemise() : BigDecimal.ZERO; // % remise

        // Montant brut HT
        BigDecimal montantBrut = prixUnitaire.multiply(BigDecimal.valueOf(quantite));

        // Montant de la remise
        BigDecimal montantRemise = montantBrut.multiply(remise).divide(BigDecimal.valueOf(100));

        // Total HT après remise
        BigDecimal totalLigne = montantBrut.subtract(montantRemise);
        ligne.setTotalLigne(totalLigne);

        montantHT = montantHT.add(totalLigne);
    }

    // Apply global discount
    BigDecimal remiseGlobale = devis.getRemiseGlobale() != null ? devis.getRemiseGlobale() : BigDecimal.ZERO;
    BigDecimal montantApresRemiseGlobale = montantHT.subtract(remiseGlobale);

    // Calculate TVA
    BigDecimal tauxTVA = devis.getMontantTVA() != null ? devis.getMontantTVA() : BigDecimal.ZERO;
    BigDecimal montantTVA = montantApresRemiseGlobale.multiply(tauxTVA).divide(BigDecimal.valueOf(100));

    // Add fiscal stamp
    BigDecimal timbreFiscal = devis.getTimbreFiscal() != null ? devis.getTimbreFiscal() : BigDecimal.ZERO;

    // Calculate final TTC
    BigDecimal montantTTC = montantApresRemiseGlobale.add(montantTVA).add(timbreFiscal);

    // Set all amounts
    devis.setMontantHT(montantHT);
    devis.setMontantTVA(montantTVA);
    devis.setMontantTTC(montantTTC);
}

}