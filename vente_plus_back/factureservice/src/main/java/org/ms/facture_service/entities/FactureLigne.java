package org.ms.facture_service.entities; 
 
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor; 
import lombok.Data; 
import lombok.NoArgsConstructor; 
import lombok.ToString;

import java.math.BigDecimal;

import org.ms.facture_service.model.Produit; 
 
import jakarta.persistence.*; 
 
@Entity 
@Data @NoArgsConstructor @AllArgsConstructor @ToString 
public class FactureLigne { 
    @Id 
    @GeneratedValue(strategy= GenerationType.IDENTITY) 
    private Long id; 
    private Long produitID; 
    private long quantite; 
    private BigDecimal  prix; 
    private BigDecimal remise; 
    private BigDecimal tva;
 
    @Transient 
    private Produit produit; 
 
    @JsonIgnore
    @ManyToOne 
    private Facture facture; 
     
}