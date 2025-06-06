package org.ms.facture_service.entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.ms.facture_service.model.Client;
import org.ms.facture_service.model.Devis;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.util.Collection;
import java.util.Date;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Facture {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	private Date dateFacture;

    private BigDecimal montantHT;
    private BigDecimal montantTVA;
    private BigDecimal montantTTC;
    @OneToMany(mappedBy = "facture", cascade = CascadeType.ALL)
	private Collection<FactureLigne> facturelignes;
	@Transient
	private Client client;
	private Long clientID; 
	@Transient 
	private Devis devis;
	private Long devisId;
}
