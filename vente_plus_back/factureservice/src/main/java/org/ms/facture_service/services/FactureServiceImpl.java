package org.ms.facture_service.services;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.ms.facture_service.entities.Facture;
import org.ms.facture_service.entities.FactureLigne;
import org.ms.facture_service.feign.ClientServiceClient;
import org.ms.facture_service.feign.DevisServiceClient;
import org.ms.facture_service.feign.ProduitServiceClient;
import org.ms.facture_service.model.Devis;
import org.ms.facture_service.model.DevisLigne;
import org.ms.facture_service.repository.FactureLigneRepository;
import org.ms.facture_service.repository.FactureRepository;
import org.springframework.stereotype.Service;

@Service
public class FactureServiceImpl implements FactureService {

    private final FactureRepository factureRepository;
    private final FactureLigneRepository factureLigneRepository;
    private final DevisServiceClient devisServiceClient;
    private final ClientServiceClient clientServiceClient;
    private final ProduitServiceClient produitServiceClient;

    public FactureServiceImpl(FactureRepository factureRepository, FactureLigneRepository factureLigneRepository,
                              DevisServiceClient devisServiceClient, ClientServiceClient clientServiceClient,
                              ProduitServiceClient produitServiceClient) {
        this.factureRepository = factureRepository;
        this.factureLigneRepository = factureLigneRepository;
        this.devisServiceClient = devisServiceClient;
        this.clientServiceClient = clientServiceClient;
        this.produitServiceClient = produitServiceClient;
    }

    @Override
    public Facture creerFactureDepuisDevis(Long devisId) {
        Devis devis = devisServiceClient.getDevisById(devisId);
        Facture facture = new Facture();
        facture.setDateFacture(new Date());
        facture.setClientID(devis.getClientId());
        facture.setDevisId(devis.getId());

        BigDecimal montantHT = BigDecimal.ZERO;

        facture = factureRepository.save(facture);

        List<FactureLigne> lignes = new ArrayList<>();

        for (DevisLigne ligne : devis.getLignes()) {
            FactureLigne fl = new FactureLigne();
            fl.setFacture(facture);
            fl.setProduitID(ligne.getProduitId());
            fl.setPrix(ligne.getPrixUnitaire());
            fl.setQuantite(ligne.getQuantite());

            BigDecimal totalLigne = ligne.getPrixUnitaire().multiply(BigDecimal.valueOf(ligne.getQuantite()));
            montantHT = montantHT.add(totalLigne);

            factureLigneRepository.save(fl);
            lignes.add(fl);
        }

        BigDecimal tauxTVA = BigDecimal.valueOf(19); // TVA à 19%, modifiable si besoin
        BigDecimal montantTVA = montantHT.multiply(tauxTVA).divide(BigDecimal.valueOf(100));
        BigDecimal montantTTC = montantHT.add(montantTVA);

        facture.setMontantHT(montantHT);
        facture.setMontantTVA(montantTVA);
        facture.setMontantTTC(montantTTC);
        facture.setFacturelignes(lignes);
        

        return factureRepository.save(facture);
    }

    @Override
    public List<Facture> getAllFactures() {
        List<Facture> factures = factureRepository.findAll();
        for (Facture f : factures) enrichirFacture(f);
        return factures;
    }

    @Override
    public Facture getFacture(Long id) {
        Facture facture = factureRepository.findById(id).orElse(null);
        if (facture != null) enrichirFacture(facture);
        return facture;
    }

    @Override
    public void supprimerFacture(Long id) {
        factureRepository.deleteById(id);
    }

    private void enrichirFacture(Facture facture) {
        facture.setClient(clientServiceClient.findClientById(facture.getClientID()));
        facture.setDevis(devisServiceClient.getDevisById(facture.getDevisId()));

        for (FactureLigne ligne : facture.getFacturelignes()) {
            ligne.setProduit(produitServiceClient.findProductById(ligne.getProduitID()));
        }
    }
}
