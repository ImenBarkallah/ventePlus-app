import { Observable } from "rxjs/internal/Observable";
import { Devis } from "../models/devis";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

 @Injectable({
  providedIn: 'root'
})
export class DevisService {
  private baseUrl = 'http://localhost:8888/devis-service/devis'; // port du devis-service

  constructor(private http: HttpClient) {}

  getAllDevis(): Observable<Devis[]> {
    return this.http.get<Devis[]>(`${this.baseUrl}`);
  }

  getDevisById(id: number): Observable<Devis> {
    return this.http.get<Devis>(`${this.baseUrl}/${id}`);
  }

  createDevis(devis: Devis): Observable<Devis> {
    return this.http.post<Devis>(`${this.baseUrl}`, devis);
  }

  updateDevis(id: number, devis: Devis): Observable<Devis> {
    return this.http.put<Devis>(`${this.baseUrl}/${id}`, devis);
  }

  deleteDevis(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  validateDevis(id: number): Observable<Devis> {
    return this.http.post<Devis>(`${this.baseUrl}/${id}/validate`, {});
  }

  annulerDevis(id: number): Observable<Devis> {
    return this.http.post<Devis>(`${this.baseUrl}/${id}/annuler`, {});
  }

  convertirDevis(id: number): Observable<Devis> {
    return this.http.post<Devis>(`${this.baseUrl}/${id}/convertir`, {});
  }

  // New method to properly convert devis to facture
  convertirDevisEnFacture(id: number): Observable<any> {
    // First validate the devis (this creates the facture)
    return this.http.post<Devis>(`${this.baseUrl}/${id}/validate`, {});
  }

  getDevisByClientId(clientId: number): Observable<Devis[]> {
    return this.http.get<Devis[]>(`${this.baseUrl}/client/${clientId}`);
  }

  getDevisByStatut(statut: string): Observable<Devis[]> {
    return this.http.get<Devis[]>(`${this.baseUrl}/statut/${statut}`);
  }
}