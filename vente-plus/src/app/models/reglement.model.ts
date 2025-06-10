export interface Reglement {
    id?: number;
    numeroReglement?: string;
    factureId: number;
    clientId?: number;
    montantPaye: number;
    dateReglement?: Date;
    modeReglement: 'CARTE' | 'VIREMENT' | 'ESPECES' | 'CHEQUE';
    reference: string;
    commentaire?: string;
    createdAt?: Date;
}

export interface ReglementDTO {
    factureId: number;
    montantPaye: number;
    modeReglement: 'CARTE' | 'VIREMENT' | 'ESPECES' | 'CHEQUE';
    reference: string;
    commentaire?: string;
}

export interface FactureStatus {
    facture: any;
    client: any;
    montantPaye: number;
    montantRestant: number;
    estCompletelyPayee: boolean;
}