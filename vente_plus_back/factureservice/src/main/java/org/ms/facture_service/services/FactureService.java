package org.ms.facture_service.services;

import java.util.List;

import org.ms.facture_service.entities.Facture;

public interface FactureService {
    Facture creerFactureDepuisDevis(Long devisId);
    List<Facture> getAllFactures();
    Facture getFacture(Long id);
    void supprimerFacture(Long id);
    

}
