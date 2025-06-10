package org.ms.reglementservice.entities;

public enum ModeReglement {
    ESPECES("Espèces"),
    CHEQUE("Chèque"),
    VIREMENT("Virement bancaire"),
    CARTE_BANCAIRE("Carte bancaire"),
    PRELEVEMENT("Prélèvement automatique"),
    AUTRE("Autre");
    
    private final String libelle;
    
    ModeReglement(String libelle) {
        this.libelle = libelle;
    }
    
    public String getLibelle() {
        return libelle;
    }
}
