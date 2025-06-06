package org.ms.devis_service.entities;

import java.math.BigDecimal;

import org.ms.devis_service.model.Produit;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Transient;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DevisLigne {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long produitId;
    private int quantite;
    private BigDecimal prixUnitaire;
    private BigDecimal totalLigne;
    @Column(name = "remise", precision = 5, scale = 2)
    private BigDecimal remise;
    @Column(precision = 5, scale = 2)
    private BigDecimal tva;

    @ManyToOne
    @JoinColumn(name = "devis_id")
    @JsonBackReference
    private Devis devis;
    
    @Transient
    private Produit produit;
}
