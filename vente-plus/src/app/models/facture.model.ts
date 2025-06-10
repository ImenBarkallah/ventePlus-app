import { Client } from './client';
import { FactureLigne } from './factureLigne';

export interface Facture {
  id: number;
  dateFacture: Date;
  montantHT: number;
  montantTVA: number;
  montantTTC: number;
  clientID: number;
  devisId: number;
  facturelignes: FactureLigne[];
  client?: Client;
  devis?: any;
  // Additional fields for payment tracking
  montantPaye?: number;
  montantRestant?: number;
  statut?: 'EN_ATTENTE' | 'PAYEE' | 'PARTIELLE' | 'ANNULEE';
}