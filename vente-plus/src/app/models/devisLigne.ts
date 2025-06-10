import { Produit } from './produit';

export interface DevisLigne {
    id?: number;
    produitId: number;
    quantite: number;
    prixUnitaire: number;
    totalLigne: number;
    remise: number;
    tva: number;
    produit?: Produit;
}