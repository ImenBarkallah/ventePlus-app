package org.ms.facture_service.web;

import java.util.List;

import org.ms.facture_service.entities.Facture;

import org.ms.facture_service.services.FactureService;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/factures")
public class FactureRestController {

    private final FactureService factureService;

    public FactureRestController(FactureService factureService) {
        this.factureService = factureService;
    }

    @PostMapping("/from-devis/{devisId}")
    public Facture creerFactureDepuisDevis(@PathVariable Long devisId) {
        return factureService.creerFactureDepuisDevis(devisId);
    }

    @GetMapping
    public List<Facture> getAllFactures() {
        return factureService.getAllFactures();
    }

    @GetMapping("/{id}")
    public Facture getFacture(@PathVariable Long id) {
        return factureService.getFacture(id);
    }

    @DeleteMapping("/{id}")
    public void deleteFacture(@PathVariable Long id) {
        factureService.supprimerFacture(id);
    }
}

