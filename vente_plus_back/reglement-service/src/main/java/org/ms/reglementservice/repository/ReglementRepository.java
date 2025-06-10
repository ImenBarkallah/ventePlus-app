package org.ms.reglementservice.repository;

import org.ms.reglementservice.entities.ModeReglement;
import org.ms.reglementservice.entities.Reglement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReglementRepository extends JpaRepository<Reglement, Long> {
    
    List<Reglement> findByFactureId(Long factureId);
    
    List<Reglement> findByClientId(Long clientId);
    
    List<Reglement> findByModeReglement(ModeReglement modeReglement);
    
    List<Reglement> findByDateReglementBetween(LocalDateTime dateDebut, LocalDateTime dateFin);
    
    @Query("SELECT SUM(r.montantPaye) FROM Reglement r WHERE r.factureId = :factureId")
    BigDecimal getTotalReglementsByFacture(@Param("factureId") Long factureId);
    
    @Query("SELECT SUM(r.montantPaye) FROM Reglement r WHERE r.clientId = :clientId")
    BigDecimal getTotalReglementsByClient(@Param("clientId") Long clientId);
    
    @Query("SELECT SUM(r.montantPaye) FROM Reglement r WHERE r.clientId = :clientId AND YEAR(r.dateReglement) = :annee")
    BigDecimal getTotalReglementsByClientAndYear(@Param("clientId") Long clientId, @Param("annee") int annee);
    
    @Query("SELECT r FROM Reglement r WHERE r.clientId = :clientId ORDER BY r.dateReglement DESC")
    List<Reglement> findByClientIdOrderByDateReglementDesc(@Param("clientId") Long clientId);
}
