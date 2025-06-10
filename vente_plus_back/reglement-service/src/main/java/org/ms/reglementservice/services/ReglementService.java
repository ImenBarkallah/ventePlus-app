package org.ms.reglementservice.services;

import org.ms.reglementservice.entities.FactureStatus;
import org.ms.reglementservice.entities.ModeReglement;
import org.ms.reglementservice.entities.Reglement;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface ReglementService {
    
    // CRUD operations
    Reglement createReglement(Reglement reglement);
    Reglement getReglementById(Long id);
    List<Reglement> getAllReglements();
    Reglement updateReglement(Long id, Reglement reglement);
    void deleteReglement(Long id);
    
    // Business operations
    List<Reglement> getReglementsByFacture(Long factureId);
    List<Reglement> getReglementsByClient(Long clientId);
    List<Reglement> getReglementsByModeReglement(ModeReglement modeReglement);
    List<Reglement> getReglementsByPeriode(LocalDateTime dateDebut, LocalDateTime dateFin);
    
    // Analytics operations
    BigDecimal getTotalReglementsByFacture(Long factureId);
    BigDecimal getTotalReglementsByClient(Long clientId);
    BigDecimal getTotalReglementsByClientAndYear(Long clientId, int annee);
    BigDecimal getMontantRestantFacture(Long factureId);
    
    // Validation operations
    boolean isFactureCompletelyPayee(Long factureId);
    List<Long> getFacturesNonReglees();
    List<Long> getFacturesPartiellemementReglees();
    List<Long> getFacturesReglees();
    List<Reglement> getReglementsByYear(int annee);

    // New methods for FactureStatus
    List<FactureStatus> getFacturesNonRegleesWithDetails();
    List<FactureStatus> getFacturesPartiellemementRegleesWithDetails();
    List<FactureStatus> getFacturesRegleesWithDetails();
}
