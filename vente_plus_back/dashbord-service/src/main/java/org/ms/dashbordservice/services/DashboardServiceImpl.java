package org.ms.dashbordservice.services;

import lombok.extern.slf4j.Slf4j;
import org.ms.dashbordservice.entities.*;
import org.ms.dashbordservice.feign.ClientServiceClient;
import org.ms.dashbordservice.feign.FactureServiceClient;
import org.ms.dashbordservice.feign.ProduitServiceClient;
import org.ms.dashbordservice.feign.ReglementServiceClient;
import org.ms.dashbordservice.model.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class DashboardServiceImpl implements DashboardService {

    @Autowired
    private ClientServiceClient clientServiceClient;
    
    @Autowired
    private FactureServiceClient factureServiceClient;
    
    @Autowired
    private ProduitServiceClient produitServiceClient;
    
    @Autowired
    private ReglementServiceClient reglementServiceClient;

    @Override
    public ClientAnalytics getClientAnalytics(Long clientId) {
        log.info("Génération des analytics pour le client: {}", clientId);
        
        Client client = clientServiceClient.getClientById(clientId);
        if (client == null) {
            throw new RuntimeException("Client introuvable avec l'ID: " + clientId);
        }
        
        // Récupérer toutes les factures du client
        List<Facture> facturesClient = factureServiceClient.getAllFactures()
                .stream()
                .filter(f -> f.getClientID().equals(clientId))
                .collect(Collectors.toList());
        
        // Calculer le chiffre d'affaires total
        BigDecimal chiffresAffairesTotal = facturesClient.stream()
                .map(Facture::getMontantTTC)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Calculer le chiffre d'affaires par année
        Map<Integer, BigDecimal> chiffresAffairesParAnnee = facturesClient.stream()
                .collect(Collectors.groupingBy(
                    f -> f.getDateFacture().toInstant().atZone(ZoneId.systemDefault()).getYear(),
                    Collectors.reducing(BigDecimal.ZERO, Facture::getMontantTTC, BigDecimal::add)
                ));
        
        // Calculer le montant non payé
        BigDecimal montantNonPaye = facturesClient.stream()
                .map(f -> reglementServiceClient.getMontantRestantFacture(f.getId()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Compter factures réglées et non réglées
        int facturesReglees = 0;
        int facturesNonReglees = 0;
        
        for (Facture facture : facturesClient) {
            Boolean estPayee = reglementServiceClient.isFactureCompletelyPayee(facture.getId());
            if (estPayee != null && estPayee) {
                facturesReglees++;
            } else {
                facturesNonReglees++;
            }
        }
        
        // Calculer montant moyen
        BigDecimal montantMoyenCommande = BigDecimal.ZERO;
        if (!facturesClient.isEmpty()) {
            montantMoyenCommande = chiffresAffairesTotal.divide(
                BigDecimal.valueOf(facturesClient.size()), 2, RoundingMode.HALF_UP);
        }
        
        return new ClientAnalytics(
            client,
            chiffresAffairesTotal,
            chiffresAffairesParAnnee,
            montantNonPaye,
            facturesReglees,
            facturesNonReglees,
            facturesClient.size(),
            montantMoyenCommande
        );
    }

    @Override
    public List<ClientAnalytics> getAllClientsAnalytics() {
        log.info("Génération des analytics pour tous les clients");
        List<Client> clients = clientServiceClient.getAllClients();
        return clients.stream()
                .map(client -> getClientAnalytics(client.getId()))
                .collect(Collectors.toList());
    }

    @Override
    public List<Client> getClientsPlusFideles(int limit) {
        log.info("Récupération des {} clients les plus fidèles", limit);
        
        List<Client> clients = clientServiceClient.getAllClients();
        Map<Client, Double> clientsScores = new HashMap<>();
        
        for (Client client : clients) {
            List<Facture> facturesClient = factureServiceClient.getAllFactures()
                    .stream()
                    .filter(f -> f.getClientID().equals(client.getId()))
                    .collect(Collectors.toList());
            
            if (!facturesClient.isEmpty()) {
                BigDecimal chiffresAffaires = facturesClient.stream()
                        .map(Facture::getMontantTTC)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                
                // Score de fidélité (basé sur nombre de commandes et montant total)
                double scoreFidelite = (facturesClient.size() * 0.4) + 
                                     (chiffresAffaires.doubleValue() / 1000 * 0.6);
                
                clientsScores.put(client, scoreFidelite);
            }
        }
        
        return clientsScores.entrySet().stream()
                .sorted((e1, e2) -> Double.compare(e2.getValue(), e1.getValue()))
                .limit(limit)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProduitPopularite> getProduitsPlusVendus(int limit) {
        log.info("Récupération des {} produits les plus vendus", limit);
        return getProduitsPlusVendusInternal(null, limit);
    }

    @Override
    public List<ProduitPopularite> getProduitsPlusVendusParAnnee(int annee, int limit) {
        log.info("Récupération des {} produits les plus vendus pour l'année {}", limit, annee);
        return getProduitsPlusVendusInternal(annee, limit);
    }

    private List<ProduitPopularite> getProduitsPlusVendusInternal(Integer annee, int limit) {
        List<Facture> factures = factureServiceClient.getAllFactures();
        
        if (annee != null) {
            factures = factures.stream()
                    .filter(f -> f.getDateFacture().toInstant().atZone(ZoneId.systemDefault()).getYear() == annee)
                    .collect(Collectors.toList());
        }
        
        Map<Long, ProduitPopularite> produitsStats = new HashMap<>();
        
        for (Facture facture : factures) {
            if (facture.getFacturelignes() != null) {
                for (FactureLigne ligne : facture.getFacturelignes()) {
                    Long produitId = ligne.getProduitID();
                    
                    ProduitPopularite stats = produitsStats.computeIfAbsent(produitId, id -> {
                        Produit produit = produitServiceClient.findProductById(id);
                        return new ProduitPopularite(produit, 0, BigDecimal.ZERO, 0);
                    });
                    
                    stats.setQuantiteVendue(stats.getQuantiteVendue() + ligne.getQuantite());
                    BigDecimal montantLigne = ligne.getPrix().multiply(BigDecimal.valueOf(ligne.getQuantite()));
                    stats.setChiffresAffaires(stats.getChiffresAffaires().add(montantLigne));
                    stats.setNombreCommandes(stats.getNombreCommandes() + 1);
                }
            }
        }
        
        return produitsStats.values().stream()
                .sorted((p1, p2) -> Long.compare(p2.getQuantiteVendue(), p1.getQuantiteVendue()))
                .limit(limit)
                .collect(Collectors.toList());
    }

    @Override
    public List<Produit> getProduitsEnRuptureStock() {
        log.info("Récupération des produits en rupture de stock");
        
        List<Produit> produits = produitServiceClient.getAllProduits();
        return produits.stream()
                .filter(p -> p.getQuantite() <= 0)
                .collect(Collectors.toList());
    }

    @Override
    public List<FactureStatus> getFacturesReglees() {
        log.info("Récupération des factures réglées");
        
        List<Facture> factures = factureServiceClient.getAllFactures();
        List<FactureStatus> facturesReglees = new ArrayList<>();
        
        for (Facture facture : factures) {
            Boolean estPayee = reglementServiceClient.isFactureCompletelyPayee(facture.getId());
            if (estPayee != null && estPayee) {
                Client client = clientServiceClient.getClientById(facture.getClientID());
                facturesReglees.add(createFactureStatus(facture, client));
            }
        }
        
        return facturesReglees;
    }

    @Override
    public List<FactureStatus> getFacturesNonReglees() {
        log.info("Récupération des factures non réglées");
        
        List<Long> facturesNonRegleesIds = reglementServiceClient.getFacturesNonReglees();
        List<FactureStatus> facturesNonReglees = new ArrayList<>();
        
        for (Long factureId : facturesNonRegleesIds) {
            Facture facture = factureServiceClient.getFactureById(factureId);
            if (facture != null) {
                Client client = clientServiceClient.getClientById(facture.getClientID());
                facturesNonReglees.add(createFactureStatus(facture, client));
            }
        }
        
        return facturesNonReglees;
    }

    @Override
    public List<FactureStatus> getFacturesPartiellemementReglees() {
        log.info("Récupération des factures partiellement réglées");
        
        List<Long> facturesPartiellesIds = reglementServiceClient.getFacturesPartiellemementReglees();
        List<FactureStatus> facturesPartielles = new ArrayList<>();
        
        for (Long factureId : facturesPartiellesIds) {
            Facture facture = factureServiceClient.getFactureById(factureId);
            if (facture != null) {
                Client client = clientServiceClient.getClientById(facture.getClientID());
                facturesPartielles.add(createFactureStatus(facture, client));
            }
        }
        
        return facturesPartielles;
    }

    @Override
    public Map<Client, BigDecimal> getDettesByClient() {
        log.info("Récupération des dettes par client");
        
        List<Client> clients = clientServiceClient.getAllClients();
        Map<Client, BigDecimal> dettes = new HashMap<>();
        
        for (Client client : clients) {
            BigDecimal dette = getDetteByClient(client.getId());
            if (dette.compareTo(BigDecimal.ZERO) > 0) {
                dettes.put(client, dette);
            }
        }
        
        return dettes;
    }

    @Override
    public BigDecimal getDetteByClient(Long clientId) {
        log.info("Récupération des dettes pour le client: {}", clientId);
        
        // Récupérer toutes les factures du client
        List<Facture> facturesClient = factureServiceClient.getAllFactures()
                .stream()
                .filter(f -> f.getClientID().equals(clientId))
                .collect(Collectors.toList());
        
        BigDecimal montantTotalDette = BigDecimal.ZERO;
        
        for (Facture facture : facturesClient) {
            BigDecimal montantRestant = reglementServiceClient.getMontantRestantFacture(facture.getId());
            if (montantRestant.compareTo(BigDecimal.ZERO) > 0) {
                montantTotalDette = montantTotalDette.add(montantRestant);
            }
        }
        
        return montantTotalDette;
    }

    @Override
    public BigDecimal getChiffresAffairesClient(Long clientId) {
        log.info("Calcul du chiffre d'affaires pour le client: {}", clientId);
        
        List<Facture> facturesClient = factureServiceClient.getAllFactures()
                .stream()
                .filter(f -> f.getClientID().equals(clientId))
                .collect(Collectors.toList());
        
        return facturesClient.stream()
                .map(Facture::getMontantTTC)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @Override
    public BigDecimal getChiffresAffairesClientParAnnee(Long clientId, int annee) {
        log.info("Calcul du chiffre d'affaires pour le client {} en {}", clientId, annee);
        
        List<Facture> facturesClient = factureServiceClient.getAllFactures()
                .stream()
                .filter(f -> f.getClientID().equals(clientId))
                .filter(f -> f.getDateFacture().toInstant().atZone(ZoneId.systemDefault()).getYear() == annee)
                .collect(Collectors.toList());
        
        return facturesClient.stream()
                .map(Facture::getMontantTTC)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    // Méthode utilitaire privée
    private FactureStatus createFactureStatus(Facture facture, Client client) {
        BigDecimal montantPaye = reglementServiceClient.getTotalReglementsByFacture(facture.getId());
        BigDecimal montantRestant = reglementServiceClient.getMontantRestantFacture(facture.getId());
        boolean estCompletelyPayee = montantRestant.compareTo(BigDecimal.ZERO) <= 0;
        
        return new FactureStatus(facture, client, montantPaye, montantRestant, estCompletelyPayee);
    }
}
