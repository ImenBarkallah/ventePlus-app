// produit.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Produit } from '../models/produit';


@Injectable({
  providedIn: 'root'
})
export class ProduitService {
  private apiUrl = 'http://localhost:8888/produit-service/produits';

  constructor(private http: HttpClient) { }

  getAllProduits(): Observable<Produit[]> {
    return this.http.get<Produit[]>(this.apiUrl);
  }

  getProduitById(id: number): Observable<Produit> {
    return this.http.get<Produit>(`${this.apiUrl}/${id}`);
  }

  saveProduit(produit: Produit): Observable<Produit> {
    return this.http.post<Produit>(this.apiUrl, produit);
  }

  updateProduit(id: number, produit: Produit): Observable<Produit> {
    return this.http.put<Produit>(`${this.apiUrl}/${id}`, produit);
  }

  deleteProduit(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getConfig(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/config`);
  }

  // ==================== STOCK MANAGEMENT ====================

  /**
   * Reduce product stock
   */
  reduireStock(produitId: number, quantite: number): Observable<boolean> {
    return this.http.post<boolean>(`${this.apiUrl}/${produitId}/reduire-stock`, { quantite });
  }

  /**
   * Increase product stock
   */
  augmenterStock(produitId: number, quantite: number): Observable<boolean> {
    return this.http.post<boolean>(`${this.apiUrl}/${produitId}/augmenter-stock`, { quantite });
  }

  /**
   * Get available stock for a product
   */
  getStockDisponible(produitId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/${produitId}/stock`);
  }

  saveProduitWithImage(formData: FormData): Observable<Produit> {
    return this.http.post<Produit>(this.apiUrl, formData);
  }

  updateProduitWithImage(id: number, formData: FormData): Observable<Produit> {
    return this.http.put<Produit>(`${this.apiUrl}/${id}`, formData);
  }
}
