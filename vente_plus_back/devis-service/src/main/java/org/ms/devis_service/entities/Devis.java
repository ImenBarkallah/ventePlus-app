package org.ms.devis_service.entities;


import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.ms.devis_service.model.Client;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Devis {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true)
    private String numeroDevis;
    private Long clientId;
    private LocalDate dateDevis;
    private LocalDate dateValidite;
    // Montants
    private BigDecimal montantHT;
    private BigDecimal montantTVA;
    private BigDecimal montantTTC;

    @Column(name = "remise_globale", precision = 10, scale = 2)
    private BigDecimal remiseGlobale;

    @Column(name = "timbre_fiscal", precision = 10, scale = 2)
    private BigDecimal timbreFiscal;


    @Enumerated(EnumType.STRING)
    private StatutDevis statut;
    @OneToMany(mappedBy = "devis", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<DevisLigne> lignes;
    @Transient
    private Client client;
}

