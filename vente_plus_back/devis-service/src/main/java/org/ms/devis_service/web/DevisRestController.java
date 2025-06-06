package org.ms.devis_service.web;


import org.ms.devis_service.entities.Devis;
import org.ms.devis_service.entities.StatutDevis;
import org.ms.devis_service.services.DevisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import lombok.extern.slf4j.Slf4j;

import java.util.List;

@RestController
@RequestMapping("/devis")
@Slf4j
public class DevisRestController {

    @Autowired
    private DevisService devisService;

    @PostMapping
    public Devis createDevis(@RequestBody Devis devis) {
        log.info("Création d'un nouveau devis");
        return devisService.createDevis(devis);
    }

    @GetMapping("/{id}")
    public Devis getDevisById(@PathVariable Long id) {
        log.info("Récupération du devis avec l'id: {}", id);
        return devisService.getDevisById(id);
    }

    @GetMapping
    public List<Devis> getAllDevis() {
        log.info("Récupération de tous les devis");
        return devisService.getAllDevis();
    }

    @PutMapping("/{id}")
    public Devis updateDevis(@PathVariable Long id, @RequestBody Devis devis) {
        log.info("Mise à jour du devis avec l'id: {}", id);
        return devisService.updateDevis(id, devis);
    }

    @DeleteMapping("/{id}")
    public void deleteDevis(@PathVariable Long id) {
        log.info("Suppression du devis avec l'id: {}", id);
        devisService.deleteDevis(id);
    }

    @PostMapping("/{id}/validate")
    public Devis validateDevis(@PathVariable Long id) {
        log.info("Validation du devis avec l'id: {}", id);
        return devisService.validateDevis(id);
    }

    @PostMapping("/{id}/annuler")
    public Devis annulerDevis(@PathVariable Long id) {
        log.info("Annulation du devis avec l'id: {}", id);
        return devisService.annulerDevis(id);
    }

    @PostMapping("/{id}/convertir")
    public Devis convertirEnFacture(@PathVariable Long id) {
        log.info("Conversion du devis en facture avec l'id: {}", id);
        return devisService.convertirEnFacture(id);
    }

    @GetMapping("/client/{clientId}")
    public List<Devis> getDevisByClientId(@PathVariable Long clientId) {
        log.info("Récupération des devis pour le client avec l'id: {}", clientId);
        return devisService.getDevisByClientId(clientId);
    }

    @GetMapping("/statut/{statut}")
    public List<Devis> getDevisByStatut(@PathVariable StatutDevis statut) {
        log.info("Récupération des devis avec le statut: {}", statut);
        return devisService.getDevisByStatut(statut);
    }
}