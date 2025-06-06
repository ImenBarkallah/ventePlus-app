package org.ms.devis_service.model;



import java.math.BigDecimal;
import java.util.Date;

public class Facture {
	private Long id;
	private Date dateFacture;
    private BigDecimal montantHT;
    private BigDecimal montantTVA;
    private BigDecimal montantTTC;
	private Client client;
	private Long clientID; 
	private Long devisId;

}
