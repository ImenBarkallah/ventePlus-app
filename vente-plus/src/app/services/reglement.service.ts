import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reglement, ReglementDTO, FactureStatus } from '../models/reglement.model';

@Injectable({
  providedIn: 'root'
})
export class ReglementService {
  private baseUrl = 'http://localhost:8888/reglement-service/reglements'; // Via Gateway

  constructor(private http: HttpClient) { }

  // ==================== BASIC CRUD OPERATIONS ====================

  /**
   * Create a new payment
   */
  createReglement(reglement: ReglementDTO): Observable<Reglement> {
    return this.http.post<Reglement>(this.baseUrl, reglement);
  }

  /**
   * Get payment by ID
   */
  getReglementById(id: number): Observable<Reglement> {
    return this.http.get<Reglement>(`${this.baseUrl}/${id}`);
  }

  /**
   * Get all payments
   */
  getAllReglements(): Observable<Reglement[]> {
    return this.http.get<Reglement[]>(this.baseUrl);
  }

  /**
   * Update payment
   */
  updateReglement(id: number, reglement: ReglementDTO): Observable<Reglement> {
    return this.http.put<Reglement>(`${this.baseUrl}/${id}`, reglement);
  }

  /**
   * Delete payment
   */
  deleteReglement(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // ==================== ANALYTICS OPERATIONS ====================

  /**
   * Get payments by client
   */
  getReglementsByClient(clientId: number): Observable<Reglement[]> {
    return this.http.get<Reglement[]>(`${this.baseUrl}/client/${clientId}`);
  }

  /**
   * Get payments by invoice
   */
  getReglementsByFacture(factureId: number): Observable<Reglement[]> {
    return this.http.get<Reglement[]>(`${this.baseUrl}/facture/${factureId}`);
  }

  /**
   * Get total payments by client
   */
  getTotalReglementsByClient(clientId: number): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/total/client/${clientId}`);
  }

  /**
   * Get total payments by client and year
   */
  getTotalReglementsByClientAndYear(clientId: number, year: number): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/total/client/${clientId}/annee/${year}`);
  }

  /**
   * Get remaining amount for invoice
   */
  getMontantRestantFacture(factureId: number): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/restant/facture/${factureId}`);
  }

  /**
   * Check if invoice is completely paid
   */
  isFactureCompletelyPayee(factureId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/facture/${factureId}/complete`);
  }

  /**
   * Get payments by payment mode
   */
  getReglementsByMode(mode: string): Observable<Reglement[]> {
    return this.http.get<Reglement[]>(`${this.baseUrl}/mode/${mode}`);
  }

  /**
   * Get payments by year
   */
  getReglementsByYear(year: number): Observable<Reglement[]> {
    return this.http.get<Reglement[]>(`${this.baseUrl}/annee/${year}`);
  }

  // ==================== INVOICE STATUS OPERATIONS ====================

  /**
   * Get unpaid invoices
   */
  getFacturesNonReglees(): Observable<FactureStatus[]> {
    return this.http.get<FactureStatus[]>(`${this.baseUrl}/factures/non-reglees/details`);
  }

  /**
   * Get paid invoices
   */
  getFacturesReglees(): Observable<FactureStatus[]> {
    return this.http.get<FactureStatus[]>(`${this.baseUrl}/factures/reglees/details`);
  }

  /**
   * Get partially paid invoices
   */
  getFacturesPartiellemementReglees(): Observable<FactureStatus[]> {
    return this.http.get<FactureStatus[]>(`${this.baseUrl}/factures/partiellement-reglees/details`);
  }

  // ==================== HELPER METHODS ====================

  /**
   * Get payment mode options
   */
  getPaymentModes(): string[] {
    return ['CARTE', 'VIREMENT', 'ESPECES', 'CHEQUE'];
  }

  /**
   * Format payment mode for display
   */
  formatPaymentMode(mode: string): string {
    const modes: {[key: string]: string} = {
      'CARTE': 'Carte bancaire',
      'VIREMENT': 'Virement',
      'ESPECES': 'Espèces',
      'CHEQUE': 'Chèque'
    };
    return modes[mode] || mode;
  }

  /**
   * Calculate payment percentage for invoice
   */
  calculatePaymentPercentage(montantPaye: number, montantTotal: number): number {
    if (montantTotal === 0) return 0;
    return Math.round((montantPaye / montantTotal) * 100);
  }
}