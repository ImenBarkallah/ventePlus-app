import { Client } from './client';
import { Produit } from './produit';
import { Facture } from './facture.model';

// Re-export interfaces for convenience
export type { Client } from './client';
export type { Produit } from './produit';

export interface ClientAnalytics {
  client: Client;
  chiffresAffairesTotal: number;
  chiffresAffairesParAnnee: { [year: string]: number };
  montantNonPaye: number;
  nombreFacturesReglees: number;
  nombreFacturesNonReglees: number;
  nombreCommandes: number;
  montantMoyenCommande: number;
}

export interface ProduitPopularite {
  produit: Produit;
  quantiteVendue: number;
  chiffresAffaires: number;
  nombreCommandes: number;
}

export interface FactureStatus {
  facture: Facture;
  client: Client;
  montantPaye: number;
  montantRestant: number;
  estCompletelyPayee: boolean;
}

export interface DashboardStats {
  totalClients: number;
  totalRevenue: number;
  totalInvoices: number;
  totalProducts: number;
  outOfStockProducts: number;
  unpaidInvoices: number;
  partiallyPaidInvoices: number;
  totalDebts: number;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
}

export interface RevenueByMonth {
  month: string;
  revenue: number;
}

export interface TopClient {
  client: Client;
  totalRevenue: number;
  totalOrders: number;
}

export interface ProductSales {
  product: Produit;
  totalSold: number;
  revenue: number;
}

export interface DebtInfo {
  client: Client;
  totalDebt: number;
  oldestInvoiceDate: Date;
}
