import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  ClientAnalytics, 
  ProduitPopularite, 
  FactureStatus, 
  DashboardStats,
  Client,
  Produit
} from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private baseUrl = 'http://localhost:8888/dashboard'; // Via Gateway

  constructor(private http: HttpClient) { }

  // ==================== CLIENT ANALYTICS ====================
  
  /**
   * Get analytics for all clients
   */
  getAllClientsAnalytics(): Observable<ClientAnalytics[]> {
    return this.http.get<ClientAnalytics[]>(`${this.baseUrl}/clients/analytics`);
  }

  /**
   * Get analytics for a specific client
   */
  getClientAnalytics(clientId: number): Observable<ClientAnalytics> {
    return this.http.get<ClientAnalytics>(`${this.baseUrl}/client/${clientId}/analytics`);
  }

  /**
   * Get client revenue
   */
  getClientRevenue(clientId: number): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/client/${clientId}/chiffres-affaires`);
  }

  /**
   * Get client revenue by year
   */
  getClientRevenueByYear(clientId: number, year: number): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/client/${clientId}/chiffres-affaires/annee/${year}`);
  }

  /**
   * Get most loyal clients
   */
  getMostLoyalClients(limit: number = 5): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.baseUrl}/clients/fideles?limit=${limit}`);
  }

  // ==================== PRODUCT ANALYTICS ====================

  /**
   * Get best selling products
   */
  getBestSellingProducts(limit: number = 10): Observable<ProduitPopularite[]> {
    return this.http.get<ProduitPopularite[]>(`${this.baseUrl}/produits/plus-vendus?limit=${limit}`);
  }

  /**
   * Get best selling products by year
   */
  getBestSellingProductsByYear(year: number, limit: number = 10): Observable<ProduitPopularite[]> {
    return this.http.get<ProduitPopularite[]>(`${this.baseUrl}/produits/plus-vendus/annee/${year}?limit=${limit}`);
  }

  /**
   * Get out of stock products
   */
  getOutOfStockProducts(): Observable<Produit[]> {
    return this.http.get<Produit[]>(`${this.baseUrl}/produits/rupture-stock`);
  }

  // ==================== INVOICE ANALYTICS ====================

  /**
   * Get paid invoices
   */
  getPaidInvoices(): Observable<FactureStatus[]> {
    return this.http.get<FactureStatus[]>(`${this.baseUrl}/factures/reglees`);
  }

  /**
   * Get unpaid invoices
   */
  getUnpaidInvoices(): Observable<FactureStatus[]> {
    return this.http.get<FactureStatus[]>(`${this.baseUrl}/factures/non-reglees`);
  }

  /**
   * Get partially paid invoices
   */
  getPartiallyPaidInvoices(): Observable<FactureStatus[]> {
    return this.http.get<FactureStatus[]>(`${this.baseUrl}/factures/partiellement-reglees`);
  }

  // ==================== DEBT MANAGEMENT ====================

  /**
   * Get all client debts
   */
  getAllClientDebts(): Observable<{[key: string]: number}> {
    return this.http.get<{[key: string]: number}>(`${this.baseUrl}/dettes`);
  }

  /**
   * Get specific client debt
   */
  getClientDebt(clientId: number): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/client/${clientId}/dettes`);
  }

  // ==================== DASHBOARD STATS ====================

  /**
   * Get dashboard overview stats
   */
  getDashboardStats(): Observable<DashboardStats> {
    // This combines multiple API calls to create dashboard stats
    return new Observable(observer => {
      Promise.all([
        this.getAllClientsAnalytics().toPromise(),
        this.getOutOfStockProducts().toPromise(),
        this.getUnpaidInvoices().toPromise(),
        this.getPartiallyPaidInvoices().toPromise(),
        this.getAllClientDebts().toPromise()
      ]).then(([clients, outOfStock, unpaid, partial, debts]) => {
        const stats: DashboardStats = {
          totalClients: clients?.length || 0,
          totalRevenue: clients?.reduce((sum, c) => sum + c.chiffresAffairesTotal, 0) || 0,
          totalInvoices: clients?.reduce((sum, c) => sum + c.nombreFacturesReglees + c.nombreFacturesNonReglees, 0) || 0,
          totalProducts: 0, // Will be calculated from product service
          outOfStockProducts: outOfStock?.length || 0,
          unpaidInvoices: unpaid?.length || 0,
          partiallyPaidInvoices: partial?.length || 0,
          totalDebts: Object.values(debts || {}).reduce((sum, debt) => sum + debt, 0)
        };
        observer.next(stats);
        observer.complete();
      }).catch(error => {
        observer.error(error);
      });
    });
  }

  // ==================== CHART DATA HELPERS ====================

  /**
   * Get revenue by month for charts
   */
  getRevenueByMonth(): Observable<any> {
    return this.getAllClientsAnalytics();
  }

  /**
   * Get revenue trends by year for specific client
   */
  getClientRevenueTrend(clientId: number): Observable<{[year: string]: number}> {
    return new Observable(observer => {
      this.getClientAnalytics(clientId).subscribe({
        next: (analytics) => {
          observer.next(analytics.chiffresAffairesParAnnee);
          observer.complete();
        },
        error: (error) => observer.error(error)
      });
    });
  }

  /**
   * Get payment mode distribution
   */
  getPaymentModeDistribution(): Observable<any> {
    // This would need to be implemented in backend
    return this.http.get<any>(`${this.baseUrl}/payment-modes-distribution`);
  }

  /**
   * Get sales trend data
   */
  getSalesTrend(): Observable<any> {
    // This would need to be implemented in backend
    return this.http.get<any>(`${this.baseUrl}/sales-trend`);
  }

  // ==================== ADDITIONAL ANALYTICS ====================

  /**
   * Get top clients by revenue
   */
  getTopClientsByRevenue(limit: number = 5): Observable<ClientAnalytics[]> {
    return new Observable(observer => {
      this.getAllClientsAnalytics().subscribe({
        next: (analytics) => {
          const sorted = analytics
            .sort((a, b) => b.chiffresAffairesTotal - a.chiffresAffairesTotal)
            .slice(0, limit);
          observer.next(sorted);
          observer.complete();
        },
        error: (error) => observer.error(error)
      });
    });
  }

  /**
   * Get clients with most orders
   */
  getTopClientsByOrders(limit: number = 5): Observable<ClientAnalytics[]> {
    return new Observable(observer => {
      this.getAllClientsAnalytics().subscribe({
        next: (analytics) => {
          const sorted = analytics
            .sort((a, b) => b.nombreCommandes - a.nombreCommandes)
            .slice(0, limit);
          observer.next(sorted);
          observer.complete();
        },
        error: (error) => observer.error(error)
      });
    });
  }

  /**
   * Get overall business statistics
   */
  getBusinessOverview(): Observable<any> {
    return new Observable(observer => {
      Promise.all([
        this.getAllClientsAnalytics().toPromise(),
        this.getBestSellingProducts(100).toPromise(),
        this.getOutOfStockProducts().toPromise(),
        this.getAllClientDebts().toPromise()
      ]).then(([clients, products, outOfStock, debts]) => {
        const overview = {
          totalRevenue: clients?.reduce((sum, c) => sum + c.chiffresAffairesTotal, 0) || 0,
          totalClients: clients?.length || 0,
          totalOrders: clients?.reduce((sum, c) => sum + c.nombreCommandes, 0) || 0,
          averageOrderValue: clients?.length ?
            (clients.reduce((sum, c) => sum + c.montantMoyenCommande, 0) / clients.length) : 0,
          totalProductsSold: products?.reduce((sum, p) => sum + p.quantiteVendue, 0) || 0,
          outOfStockCount: outOfStock?.length || 0,
          totalDebts: Object.values(debts || {}).reduce((sum, debt) => sum + debt, 0),
          clientsWithDebts: Object.keys(debts || {}).length
        };
        observer.next(overview);
        observer.complete();
      }).catch(error => {
        observer.error(error);
      });
    });
  }
}
