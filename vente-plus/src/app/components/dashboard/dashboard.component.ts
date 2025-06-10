import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import { DashboardService } from '../../services/dashboard.service';
import { ReglementService } from '../../services/reglement.service';
import { PdfExportService } from '../../services/pdf-export.service';
import {
  ClientAnalytics,
  ProduitPopularite,
  FactureStatus,
  DashboardStats,
  Client,
  Produit
} from '../../models/dashboard.model';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
  // Dashboard Stats
  stats: DashboardStats = {
    totalClients: 0,
    totalRevenue: 0,
    totalInvoices: 0,
    totalProducts: 0,
    outOfStockProducts: 0,
    unpaidInvoices: 0,
    partiallyPaidInvoices: 0,
    totalDebts: 0
  };

  // Data Arrays
  clientAnalytics: ClientAnalytics[] = [];
  bestSellingProducts: ProduitPopularite[] = [];
  loyalClients: Client[] = [];
  outOfStockProducts: Produit[] = [];
  unpaidInvoices: FactureStatus[] = [];
  partiallyPaidInvoices: FactureStatus[] = [];
  clientDebts: {[key: string]: number} = {};
  topClientsByRevenue: ClientAnalytics[] = [];
  topClientsByOrders: ClientAnalytics[] = [];
  businessOverview: any = {};

  // Charts
  revenueChart: Chart | null = null;
  productChart: Chart | null = null;
  paymentChart: Chart | null = null;
  clientChart: Chart | null = null;

  // Loading states
  loading = true;
  error: string | null = null;

  // Enhanced Dashboard Properties
  lastUpdate: Date = new Date();
  selectedPeriod: string = 'month';
  filteredData: any = {};

  constructor(
    private dashboardService: DashboardService,
    private reglementService: ReglementService,
    private pdfExportService: PdfExportService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    // Destroy charts to prevent memory leaks
    if (this.revenueChart) this.revenueChart.destroy();
    if (this.productChart) this.productChart.destroy();
    if (this.paymentChart) this.paymentChart.destroy();
    if (this.clientChart) this.clientChart.destroy();
  }

  async loadDashboardData(): Promise<void> {
    try {
      this.loading = true;
      this.error = null;

      // Load all dashboard data in parallel
      const [
        clientAnalytics,
        bestProducts,
        loyalClients,
        outOfStock,
        unpaidInvoices,
        partialInvoices,
        debts,
        topRevenue,
        topOrders,
        overview
      ] = await Promise.all([
        this.dashboardService.getAllClientsAnalytics().toPromise(),
        this.dashboardService.getBestSellingProducts(10).toPromise(),
        this.dashboardService.getMostLoyalClients(5).toPromise(),
        this.dashboardService.getOutOfStockProducts().toPromise(),
        this.dashboardService.getUnpaidInvoices().toPromise(),
        this.dashboardService.getPartiallyPaidInvoices().toPromise(),
        this.dashboardService.getAllClientDebts().toPromise(),
        this.dashboardService.getTopClientsByRevenue(5).toPromise(),
        this.dashboardService.getTopClientsByOrders(5).toPromise(),
        this.dashboardService.getBusinessOverview().toPromise()
      ]);

      // Assign data
      this.clientAnalytics = clientAnalytics || [];
      this.bestSellingProducts = bestProducts || [];
      this.loyalClients = loyalClients || [];
      this.outOfStockProducts = outOfStock || [];
      this.unpaidInvoices = unpaidInvoices || [];
      this.partiallyPaidInvoices = partialInvoices || [];
      this.clientDebts = debts || {};
      this.topClientsByRevenue = topRevenue || [];
      this.topClientsByOrders = topOrders || [];
      this.businessOverview = overview || {};

      // Calculate stats
      this.calculateStats();

      // Create charts
      setTimeout(() => {
        this.createCharts();
      }, 100);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      this.error = 'Erreur lors du chargement des données du tableau de bord. Vérifiez que les services backend sont démarrés.';

      // Provide fallback empty data to prevent UI crashes
      this.clientAnalytics = [];
      this.bestSellingProducts = [];
      this.loyalClients = [];
      this.outOfStockProducts = [];
      this.unpaidInvoices = [];
      this.partiallyPaidInvoices = [];
      this.clientDebts = {};
      this.topClientsByRevenue = [];
      this.topClientsByOrders = [];
      this.businessOverview = {};

      // Calculate stats with empty data
      this.calculateStats();
    } finally {
      this.loading = false;
    }
  }

  private calculateStats(): void {
    this.stats = {
      totalClients: this.clientAnalytics.length,
      totalRevenue: this.clientAnalytics.reduce((sum, c) => sum + c.chiffresAffairesTotal, 0),
      totalInvoices: this.clientAnalytics.reduce((sum, c) => sum + c.nombreFacturesReglees + c.nombreFacturesNonReglees, 0),
      totalProducts: this.bestSellingProducts.length,
      outOfStockProducts: this.outOfStockProducts.length,
      unpaidInvoices: this.unpaidInvoices.length,
      partiallyPaidInvoices: this.partiallyPaidInvoices.length,
      totalDebts: Object.values(this.clientDebts).reduce((sum, debt) => sum + debt, 0)
    };
  }

  private createCharts(): void {
    this.createRevenueChart();
    this.createProductChart();
    this.createPaymentChart();
    this.createClientChart();
  }

  private createRevenueChart(): void {
    const canvas = document.getElementById('revenueChart') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Destroy existing chart
    if (this.revenueChart) {
      this.revenueChart.destroy();
    }

    const labels = this.clientAnalytics.map(c => `${c.client.prenom} ${c.client.nom}`);
    const data = this.clientAnalytics.map(c => c.chiffresAffairesTotal);

    this.revenueChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Chiffre d\'affaires (dt)',
          data: data,
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Chiffre d\'affaires par client'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return value + ' dt';
              }
            }
          }
        }
      }
    });
  }

  private createProductChart(): void {
    const canvas = document.getElementById('productChart') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (this.productChart) {
      this.productChart.destroy();
    }

    const labels = this.bestSellingProducts.map(p => p.produit.nom);
    const data = this.bestSellingProducts.map(p => p.quantiteVendue);

    this.productChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          label: 'Quantité vendue',
          data: data,
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 205, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Produits les plus vendus'
          }
        }
      }
    });
  }

  private createPaymentChart(): void {
    const canvas = document.getElementById('paymentChart') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (this.paymentChart) {
      this.paymentChart.destroy();
    }

    const paidCount = this.clientAnalytics.reduce((sum, c) => sum + c.nombreFacturesReglees, 0);
    const unpaidCount = this.unpaidInvoices.length;
    const partialCount = this.partiallyPaidInvoices.length;

    this.paymentChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Factures payées', 'Factures impayées', 'Factures partielles'],
        datasets: [{
          data: [paidCount, unpaidCount, partialCount],
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)',
            'rgba(255, 99, 132, 0.6)',
            'rgba(255, 205, 86, 0.6)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Statut des factures'
          }
        }
      }
    });
  }

  private createClientChart(): void {
    const canvas = document.getElementById('clientChart') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (this.clientChart) {
      this.clientChart.destroy();
    }

    const labels = this.loyalClients.map(c => `${c.prenom} ${c.nom}`);
    const data = this.clientAnalytics
      .filter(ca => this.loyalClients.some(lc => lc.id === ca.client.id))
      .map(ca => ca.nombreCommandes);

    this.clientChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Nombre de commandes',
          data: data,
          borderColor: 'rgba(153, 102, 255, 1)',
          backgroundColor: 'rgba(153, 102, 255, 0.2)',
          borderWidth: 2,
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Clients les plus fidèles'
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  // Helper methods for template
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount) + ' DT';
  }

  getClientName(clientKey: string): string {
    // Extract client name from the key format
    const match = clientKey.match(/nom=([^,]+), prenom=([^,]+)/);
    if (match) {
      return `${match[2]} ${match[1]}`;
    }
    return clientKey;
  }

  refreshData(): void {
    this.lastUpdate = new Date();
    this.loadDashboardData();
  }

  clearError(): void {
    this.error = null;
  }

  // Helper method to access Object.keys in template
  getObjectKeys(obj: any): string[] {
    return Object.keys(obj || {});
  }

  // Enhanced Dashboard Methods
  onPeriodChange(): void {
    this.loadDashboardData();
  }

  // PDF Export Methods
  exportToPdf(): void {
    const dashboardStats = {
      totalClients: this.stats.totalClients,
      totalRevenue: this.stats.totalRevenue,
      totalInvoices: this.stats.totalInvoices,
      totalDebts: this.stats.totalDebts,
      outOfStockProducts: this.stats.outOfStockProducts,
      unpaidInvoices: this.stats.unpaidInvoices,
      partiallyPaidInvoices: this.stats.partiallyPaidInvoices,
      period: this.selectedPeriod,
      lastUpdate: this.lastUpdate
    };

    const sections = [
      {
        title: 'Clients les Plus Fidèles',
        data: this.loyalClients.map(client => ({
          nom: `${client.prenom} ${client.nom}`,
          email: client.email,
          telephone: client.telephone
        })),
        columns: [
          { header: 'Nom', dataKey: 'nom' },
          { header: 'Email', dataKey: 'email' },
          { header: 'Téléphone', dataKey: 'telephone' }
        ]
      },
      {
        title: 'Produits en Rupture de Stock',
        data: this.outOfStockProducts.map(product => ({
          nom: product.nom,
          reference: product.reference,
          prix: this.formatCurrency(product.prix)
        })),
        columns: [
          { header: 'Produit', dataKey: 'nom' },
          { header: 'Référence', dataKey: 'reference' },
          { header: 'Prix', dataKey: 'prix' }
        ]
      },
      {
        title: 'Top Clients par Chiffre d\'Affaires',
        data: this.topClientsByRevenue.map(analytics => ({
          client: `${analytics.client.prenom} ${analytics.client.nom}`,
          chiffresAffaires: this.formatCurrency(analytics.chiffresAffairesTotal),
          nombreCommandes: analytics.nombreCommandes,
          montantMoyen: this.formatCurrency(analytics.montantMoyenCommande)
        })),
        columns: [
          { header: 'Client', dataKey: 'client' },
          { header: 'CA Total', dataKey: 'chiffresAffaires' },
          { header: 'Nb Commandes', dataKey: 'nombreCommandes' },
          { header: 'Montant Moyen', dataKey: 'montantMoyen' }
        ]
      }
    ];

    this.pdfExportService.exportDetailedReport(
      sections,
      'Rapport Tableau de Bord',
      {
        period: this.getPeriodLabel(),
        totalRecords: this.stats.totalClients,
        generatedAt: new Date().toLocaleDateString('fr-FR')
      }
    );
  }

  // Excel Export (CSV format)
  exportToExcel(): void {
    const data = this.topClientsByRevenue.map(analytics => ({
      'Client': `${analytics.client.prenom} ${analytics.client.nom}`,
      'Email': analytics.client.email,
      'Téléphone': analytics.client.telephone,
      'Chiffre d\'Affaires': analytics.chiffresAffairesTotal,
      'Nombre de Commandes': analytics.nombreCommandes,
      'Montant Moyen': analytics.montantMoyenCommande,
      'Factures Réglées': analytics.nombreFacturesReglees,
      'Factures Non Réglées': analytics.nombreFacturesNonReglees
    }));

    // Convert to CSV
    const headers = Object.keys(data[0] || {});
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header as keyof typeof row]}"`).join(','))
    ].join('\n');

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `dashboard_analytics_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  private getPeriodLabel(): string {
    const labels: {[key: string]: string} = {
      today: 'Aujourd\'hui',
      week: 'Cette semaine',
      month: 'Ce mois',
      quarter: 'Ce trimestre',
      year: 'Cette année',
      all: 'Toutes les données'
    };
    return labels[this.selectedPeriod] || 'Période personnalisée';
  }


}
