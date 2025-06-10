import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Facture } from '../models/facture.model';
import { Reglement } from '../models/reglement.model';

@Injectable({
  providedIn: 'root'
})
export class FactureReglementService {
  private apiUrl = 'http://localhost:8888';

  constructor(private http: HttpClient) {}

  // Récupérer une facture avec ses règlements
  getFactureWithReglements(factureId: number): Observable<Facture> {
    return this.http.get<Facture>(`${this.apiUrl}/factures/${factureId}/with-reglements`);
  }

  // Ajouter un règlement à une facture
  addReglementToFacture(factureId: number, reglement: Reglement): Observable<Facture> {
    return this.http.post<Facture>(`${this.apiUrl}/factures/${factureId}/reglements`, reglement);
  }

  // Vérifier si un règlement peut être ajouté
  canAddReglement(factureId: number, montant: number): Observable<boolean> {
    return this.getFactureWithReglements(factureId).pipe(
      map(facture => {
        const montantRestant = facture.montantTTC - facture.montantPaye;
        return montant <= montantRestant;
      })
    );
  }

  // Mettre à jour le statut de la facture
  /*updateFactureStatus(factureId: number): Observable<Facture> {
    return this.getFactureWithReglements(factureId).pipe(
      map(facture => {
        if (facture.montantPaye >= facture.montantTTC) {
          facture.statut = 'PAYEE';
        } else if (facture.montantPaye > 0) {
          facture.statut = 'PARTIELLE';
        }
        return this.http.put<Facture>(`${this.apiUrl}/factures/${factureId}`, facture).toPromise();
      })
    );
  }
    */

  // Calculer le montant restant à payer
  calculateMontantRestant(facture: Facture): number {
    return facture.montantTTC - facture.montantPaye;
  }
} 