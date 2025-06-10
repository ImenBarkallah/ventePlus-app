import { StatutDevis } from "./statutDevis";
import { DevisLigne } from "./devisLigne";

export interface Devis {
    id?: number;
    numeroDevis: string;
    clientId: number;
    dateDevis: Date;
    dateValidite: Date;
    montantHT: number;
    montantTVA: number;
    montantTTC: number;
    remiseGlobale: number;
    timbreFiscal: number;
    
    statut: StatutDevis;
    lignes: DevisLigne[];
    client?: any;
}