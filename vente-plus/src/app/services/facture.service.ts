import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Facture } from "../models/facture.model";
@Injectable({
    providedIn: 'root'
  })
  export class FactureService {
    private apiUrl = 'http://localhost:8888/facture-service/factures';

    constructor(private http: HttpClient) {}
  
    getAllFactures(): Observable<Facture[]> {
      return this.http.get<Facture[]>(this.apiUrl);
    }

    // Alias for backward compatibility
    getFactures(): Observable<Facture[]> {
      return this.getAllFactures();
    }

    getFacture(id: number): Observable<Facture> {
      return this.http.get<Facture>(`${this.apiUrl}/${id}`);
    }

    createFactureFromDevis(devisId: number): Observable<Facture> {
      return this.http.post<Facture>(`${this.apiUrl}/from-devis/${devisId}`, {});
    }

    deleteFacture(id: number): Observable<void> {
      return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    updateFacture(id: number, facture: Facture): Observable<Facture> {
      return this.http.put<Facture>(`${this.apiUrl}/${id}`, facture);
    }
  }