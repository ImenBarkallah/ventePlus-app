package org.ms.devis_service.services;

import org.ms.devis_service.entities.Devis;
import org.ms.devis_service.entities.StatutDevis;

import java.util.List;

public interface DevisService {
	 // Créer un nouveau devis
    Devis createDevis(Devis devis);
    
    // Obtenir un devis par son ID
    Devis getDevisById(Long id);
    
    // Obtenir tous les devis
    List<Devis> getAllDevis();
    
    // Mettre à jour un devis
    Devis updateDevis(Long id, Devis devis);
    
    // Supprimer un devis
    void deleteDevis(Long id);
    
    // Valider un devis
    Devis validateDevis(Long id);
    
    // Annuler un devis
    Devis annulerDevis(Long id);
    
    // Convertir un devis en facture
    Devis convertirEnFacture(Long id);
    
    // Obtenir les devis par client
    List<Devis> getDevisByClientId(Long clientId);
    
    // Obtenir les devis par statut
    List<Devis> getDevisByStatut(StatutDevis statut);
}
