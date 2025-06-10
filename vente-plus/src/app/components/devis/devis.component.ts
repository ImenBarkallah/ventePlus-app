import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DevisService } from '../../services/devis.service';
import { ClientService } from '../../services/client.service';
import { ProduitService } from '../../services/produit.service';
import { PdfExportService } from '../../services/pdf-export.service';
import { Devis } from '../../models/devis';
import { DevisLigne } from '../../models/devisLigne';
import { StatutDevis } from '../../models/statutDevis';
import { Client } from '../../models/client';
import { Produit } from '../../models/produit';

@Component({
  selector: 'app-devis',
  templateUrl: './devis.component.html',
  styleUrls: ['./devis.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class DevisComponent implements OnInit {
  devis: Devis[] = [];
  filteredDevis: Devis[] = [];
  clients: Client[] = [];
  produits: Produit[] = [];
  selectedDevis: Devis | null = null;
  isLoading = false;
  showModal = false;
  showDeleteModal = false;
  showViewModal = false;
  isEditing = false;
  searchTerm = '';

    // Pour la pagination
    pageSize: number = 10;
    currentPage: number = 1;
    paginatedDevis: Devis[] = [];
    totalPages: number = 1;

  // Enhanced Features
  sortBy: string = 'dateDevis';
  sortDirection: 'asc' | 'desc' = 'desc';
  selectedFilter: string = 'all';

  // Analytics
  devisStats = {
    total: 0,
    enAttente: 0,
    valides: 0,
    annules: 0,
    totalValue: 0
  };

  // Alert properties
  showAlert = false;
  alertMessage = '';
  alertType: 'success' | 'error' | 'delete' = 'success';

  showFilters = false;

  constructor(
    private devisService: DevisService,
    private clientService: ClientService,
    private produitService: ProduitService,
    private pdfExportService: PdfExportService
  ) {}

  ngOnInit(): void {
    this.loadClientsAndDevis();
    this.loadProduits();
    this.updatePagination();
  }

  clientFilter = '';
  statutFilter = '';
  dateFilter: string | null = null;

  onClientFilterChange(value: string) {
    this.clientFilter = value;
    this.filterDevis();
  }
  onStatutFilterChange(value: string) {
    this.statutFilter = value;
    this.filterDevis();
  }
  onDateFilterChange(value: string) {
    this.dateFilter = value;
    this.filterDevis();
  }
  resetFilters() {
    this.clientFilter = '';
    this.statutFilter = '';
    this.dateFilter = null;
    this.searchTerm = '';
    this.filterDevis();
  }

  loadClientsAndDevis(): void {
    this.isLoading = true;
    this.clientService.getAllClients().subscribe({
      next: (clientsData) => {
        this.clients = clientsData;
        this.devisService.getAllDevis().subscribe({
          next: (devisData) => {
            // Associer chaque devis à son client complet
            this.devis = devisData.map(d => ({
              ...d,
              client: this.clients.find(c => c.id === d.clientId)
            }));
            this.calculateStats();
            this.filterDevis();
            this.isLoading = false;
          },
          error: (error) => {
            this.showError('Erreur lors du chargement des devis');
            this.isLoading = false;
            console.error('Erreur:', error);
          }
        });
      },
      error: (error) => {
        this.showError('Erreur lors du chargement des clients');
        this.isLoading = false;
        console.error('Erreur:', error);
      }
    });
  }

  loadProduits(): void {
    this.produitService.getAllProduits().subscribe({
      next: (data) => {
        this.produits = data;
      },
      error: (error) => {
        this.showError('Erreur lors du chargement des produits');
        console.error('Erreur:', error);
      }
    });
  }

  filterDevis(): void {
    let result = this.devis;

    // Filtre recherche générale (numéro, nom, prénom)
    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      result = result.filter(d =>
        (d.numeroDevis && d.numeroDevis.toLowerCase().includes(search)) ||
        (d.client && d.client.nom && d.client.nom.toLowerCase().includes(search)) ||
        (d.client && d.client.prenom && d.client.prenom.toLowerCase().includes(search))
      );
    }
    // Filtre nom client
    if (this.clientFilter) {
      const clientSearch = this.clientFilter.toLowerCase();
      result = result.filter(d =>
        d.client?.nom.toLowerCase().includes(clientSearch) ||
        d.client?.prenom.toLowerCase().includes(clientSearch)
      );
    }
    // Filtre statut
    if (this.statutFilter) {
      result = result.filter(d => d.statut === this.statutFilter);
    }
    // Filtre date
    if (this.dateFilter) {
      result = result.filter(d => {
        if (!d.dateDevis) return false;
        const dateStr = (typeof d.dateDevis === 'string') ? (d.dateDevis as string).slice(0, 10) : new Date(d.dateDevis).toISOString().slice(0, 10);
        return dateStr === this.dateFilter;
      });
    }
    this.filteredDevis = result;
    this.currentPage = 1;
    this.applySorting();
  }

  onSearchChange(value: string): void {
    this.searchTerm = value;
    this.filterDevis();
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredDevis.length / this.pageSize) || 1;
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedDevis = this.filteredDevis.slice(start, end);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagination();
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  prevPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  openModal(devis?: Devis): void {
    this.isEditing = !!devis;
    this.selectedDevis = devis ? { ...devis } : {
      numeroDevis: '',
      clientId: 0,
      dateDevis: new Date(),
      dateValidite: new Date(new Date().setDate(new Date().getDate() + 30)),
      montantHT: 0,
      montantTVA: 0,
      montantTTC: 0,
      remiseGlobale: 0,
      timbreFiscal: 0,
      statut: StatutDevis.EN_ATTENTE,
      lignes: []
    };
    this.showModal = true;

    // Calculate totals for existing devis
    if (devis) {
      setTimeout(() => this.calculateTotals(), 100);
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedDevis = null;
  }

  openDeleteModal(devis: Devis): void {
    this.selectedDevis = devis;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedDevis = null;
  }

  addLigne(): void {
    if (this.selectedDevis) {
      const ligne: DevisLigne = {
        produitId: 0,
        quantite: 1,
        prixUnitaire: 0,
        remise: 0,
        tva: 0,
        totalLigne: 0
      };
      this.selectedDevis.lignes.push(ligne);
      this.calculateTotals();
    }
  }

  removeLigne(index: number): void {
    if (this.selectedDevis) {
      this.selectedDevis.lignes.splice(index, 1);
      this.calculateTotals();
    }
  }

  onSubmit(): void {
    if (!this.selectedDevis) return;

    // Validation
    if (!this.selectedDevis.clientId || this.selectedDevis.clientId === 0) {
      this.showError('Veuillez sélectionner un client');
      return;
    }

    if (!this.selectedDevis.lignes || this.selectedDevis.lignes.length === 0) {
      this.showError('Veuillez ajouter au moins une ligne au devis');
      return;
    }

    // Validate each line
    for (let i = 0; i < this.selectedDevis.lignes.length; i++) {
      const ligne = this.selectedDevis.lignes[i];
      if (!ligne.produitId || ligne.produitId === 0) {
        this.showError(`Veuillez sélectionner un produit pour la ligne ${i + 1}`);
        return;
      }
      if (!ligne.quantite || ligne.quantite <= 0) {
        this.showError(`Veuillez saisir une quantité valide pour la ligne ${i + 1}`);
        return;
      }
      if (!ligne.prixUnitaire || ligne.prixUnitaire <= 0) {
        this.showError(`Prix unitaire invalide pour la ligne ${i + 1}`);
        return;
      }
    }

    this.isLoading = true;
    const action = this.isEditing && this.selectedDevis.id
      ? this.devisService.updateDevis(this.selectedDevis.id, this.selectedDevis)
      : this.devisService.createDevis(this.selectedDevis);

    action.subscribe({
      next: () => {
        this.showSuccess(this.isEditing ? 'Devis mis à jour avec succès' : 'Devis créé avec succès');
        this.loadClientsAndDevis();
        this.closeModal();
      },
      error: (error) => {
        this.showError(this.isEditing ? 'Erreur lors de la mise à jour du devis' : 'Erreur lors de la création du devis');
        console.error('Erreur:', error);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  onDelete(): void {
    if (!this.selectedDevis?.id) return;

    this.isLoading = true;
    this.devisService.deleteDevis(this.selectedDevis.id).subscribe({
      next: () => {
        this.showSuccess('Devis supprimé avec succès');
        this.loadClientsAndDevis();
        this.closeDeleteModal();
      },
      error: (error) => {
        this.showError('Erreur lors de la suppression du devis');
        console.error('Erreur:', error);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  onValidate(devis: Devis): void {
    if (!devis.id) return;

    this.isLoading = true;
    this.devisService.validateDevis(devis.id).subscribe({
      next: () => {
        this.showSuccess('Devis validé avec succès');
        this.loadClientsAndDevis();
      },
      error: (error) => {
        this.showError('Erreur lors de la validation du devis');
        console.error('Erreur:', error);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  onCancel(devis: Devis): void {
    if (!devis.id) return;

    this.isLoading = true;
    this.devisService.annulerDevis(devis.id).subscribe({
      next: () => {
        this.showSuccess('Devis annulé avec succès');
        this.loadClientsAndDevis();
      },
      error: (error) => {
        this.showError('Erreur lors de l\'annulation du devis');
        console.error('Erreur:', error);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  onConvert(devis: Devis): void {
    if (!devis.id) return;

    this.isLoading = true;
    // Use the proper conversion method that creates the facture
    this.devisService.convertirDevisEnFacture(devis.id).subscribe({
      next: () => {
        this.showSuccess('Devis converti en facture avec succès');
        this.loadClientsAndDevis();
      },
      error: (error: any) => {
        this.showError('Erreur lors de la conversion du devis');
        console.error('Erreur:', error);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  showSuccess(message: string): void {
    this.alertMessage = message;
    this.alertType = 'success';
    this.showAlert = true;
    setTimeout(() => this.closeAlert(), 3000);
  }

  showError(message: string): void {
    this.alertMessage = message;
    this.alertType = 'error';
    this.showAlert = true;
    setTimeout(() => this.closeAlert(), 3000);
  }

  closeAlert(): void {
    this.showAlert = false;
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  onProduitChange(index: number, produitId: number): void {
    const produit = this.produits.find(p => p.id === produitId);
    if (this.selectedDevis && this.selectedDevis.lignes[index] && produit) {
        this.selectedDevis.lignes[index].prixUnitaire = produit.prix;
        this.selectedDevis.lignes[index].produit = produit;
        this.selectedDevis.lignes[index].produitId = produitId;
        this.calculateTotals();
    }
  }

  // Real-time calculation methods
  onQuantiteChange(index: number): void {
    this.calculateTotals();
  }

  onRemiseChange(index: number): void {
    this.calculateTotals();
  }

  onTvaChange(index: number): void {
    this.calculateTotals();
  }

  onRemiseGlobaleChange(): void {
    this.calculateTotals();
  }

  onTimbreFiscalChange(): void {
    this.calculateTotals();
  }

  calculateTotals(): void {
    if (!this.selectedDevis || !this.selectedDevis.lignes) {
      return;
    }

    let montantHT = 0;
    let montantTVA = 0;

    // Calculate line totals and TVA
    this.selectedDevis.lignes.forEach(ligne => {
      if (ligne.prixUnitaire && ligne.quantite) {
        // Calculate line total HT after discount
        const montantBrut = ligne.prixUnitaire * ligne.quantite;
        const remiseAmount = montantBrut * (ligne.remise || 0) / 100;
        ligne.totalLigne = montantBrut - remiseAmount;

        // Add to total HT
        montantHT += ligne.totalLigne;

        // Calculate TVA for this line
        const tvaLigne = ligne.totalLigne * (ligne.tva || 0) / 100;
        montantTVA += tvaLigne;
      } else {
        ligne.totalLigne = 0;
      }
    });

    // Apply global discount
    const remiseGlobale = this.selectedDevis.remiseGlobale || 0;
    const montantApresRemiseGlobale = montantHT - remiseGlobale;

    // Recalculate TVA on discounted amount (proportional reduction)
    if (montantHT > 0) {
      const facteurReduction = montantApresRemiseGlobale / montantHT;
      montantTVA = montantTVA * facteurReduction;
    }

    // Add fiscal stamp
    const timbreFiscal = this.selectedDevis.timbreFiscal || 0;
    const montantTTC = montantApresRemiseGlobale + montantTVA + timbreFiscal;

    // Update devis totals
    this.selectedDevis.montantHT = Math.round(montantHT * 1000) / 1000;
    this.selectedDevis.montantTVA = Math.round(montantTVA * 1000) / 1000;
    this.selectedDevis.montantTTC = Math.round(montantTTC * 1000) / 1000;
  }

  // Helper method to get line total for display
  getLineTotalHT(ligne: any): number {
    if (!ligne.prixUnitaire || !ligne.quantite) {
      return 0;
    }
    const montantBrut = ligne.prixUnitaire * ligne.quantite;
    const remiseAmount = montantBrut * (ligne.remise || 0) / 100;
    return montantBrut - remiseAmount;
  }

  // Helper method to get total after global discount
  getTotalApresRemiseGlobale(): number {
    if (!this.selectedDevis) {
      return 0;
    }
    return (this.selectedDevis.montantHT || 0) - (this.selectedDevis.remiseGlobale || 0);
  }

  viewDevis(devis: Devis): void {
    this.selectedDevis = devis;
    this.showViewModal = true;
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.selectedDevis = null;
  }

  createNewDevis() {
    this.selectedDevis = {
      numeroDevis: '',
      clientId: 0,
      dateDevis: new Date(),
      dateValidite: new Date(new Date().setDate(new Date().getDate() + 30)),
      montantHT: 0,
      montantTVA: 0,
      montantTTC: 0,
      remiseGlobale: 0,
      timbreFiscal: 0,
      statut: StatutDevis.EN_ATTENTE,
      lignes: []
    };
    this.showModal = true;
  }

  // Enhanced Features
  applySorting(): void {
    this.filteredDevis.sort((a, b) => {
      let valueA: any;
      let valueB: any;

      switch (this.sortBy) {
        case 'numeroDevis':
          valueA = a.numeroDevis?.toLowerCase() || '';
          valueB = b.numeroDevis?.toLowerCase() || '';
          break;
        case 'client':
          valueA = a.client ? `${a.client.nom} ${a.client.prenom}`.toLowerCase() : '';
          valueB = b.client ? `${b.client.nom} ${b.client.prenom}`.toLowerCase() : '';
          break;
        case 'dateDevis':
          valueA = new Date(a.dateDevis || '').getTime();
          valueB = new Date(b.dateDevis || '').getTime();
          break;
        case 'dateValidite':
          valueA = new Date(a.dateValidite || '').getTime();
          valueB = new Date(b.dateValidite || '').getTime();
          break;
        case 'montantTTC':
          valueA = a.montantTTC || 0;
          valueB = b.montantTTC || 0;
          break;
        case 'statut':
          valueA = a.statut || '';
          valueB = b.statut || '';
          break;
        default:
          valueA = new Date(a.dateDevis || '').getTime();
          valueB = new Date(b.dateDevis || '').getTime();
      }

      if (valueA < valueB) {
        return this.sortDirection === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });

    this.updatePagination();
  }

  toggleSort(column: string): void {
    if (this.sortBy === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortDirection = 'asc';
    }
    this.applySorting();
  }

  // Analytics Methods
  calculateStats(): void {
    this.devisStats.total = this.devis.length;
    this.devisStats.enAttente = this.devis.filter(d => d.statut === StatutDevis.EN_ATTENTE).length;
    this.devisStats.valides = this.devis.filter(d => d.statut === StatutDevis.VALIDE).length;
    this.devisStats.annules = this.devis.filter(d => d.statut === StatutDevis.ANNULE).length;
    this.devisStats.totalValue = this.devis.reduce((sum, d) => sum + (d.montantTTC || 0), 0);
  }

  // Export Methods
  exportToPdf(): void {
    const columns = [
      { header: 'Numéro', dataKey: 'numeroDevis' },
      { header: 'Client', dataKey: 'client' },
      { header: 'Date Devis', dataKey: 'dateDevis' },
      { header: 'Date Validité', dataKey: 'dateValidite' },
      { header: 'Montant HT', dataKey: 'montantHT' },
      { header: 'Montant TTC', dataKey: 'montantTTC' },
      { header: 'Statut', dataKey: 'statut' }
    ];

    const data = this.filteredDevis.map(devis => ({
      numeroDevis: devis.numeroDevis || 'N/A',
      client: devis.client ? `${devis.client.nom} ${devis.client.prenom}` : 'N/A',
      dateDevis: devis.dateDevis ? new Date(devis.dateDevis).toLocaleDateString('fr-FR') : 'N/A',
      dateValidite: devis.dateValidite ? new Date(devis.dateValidite).toLocaleDateString('fr-FR') : 'N/A',
      montantHT: devis.montantHT ? `${devis.montantHT.toFixed(2)} Dt` : '0,00 Dt',
      montantTTC: devis.montantTTC ? `${devis.montantTTC.toFixed(2)} Dt` : '0,00 Dt',
      statut: this.getStatutLabel(devis.statut)
    }));

    this.pdfExportService.exportTableToPdf(
      data,
      columns,
      'Liste des Devis',
      `devis_${new Date().toISOString().split('T')[0]}.pdf`
    );
  }

  exportToExcel(): void {
    const data = this.filteredDevis.map(devis => ({
      'Numéro': devis.numeroDevis || 'N/A',
      'Client': devis.client ? `${devis.client.nom} ${devis.client.prenom}` : 'N/A',
      'Date Devis': devis.dateDevis ? new Date(devis.dateDevis).toLocaleDateString('fr-FR') : 'N/A',
      'Date Validité': devis.dateValidite ? new Date(devis.dateValidite).toLocaleDateString('fr-FR') : 'N/A',
      'Montant HT': devis.montantHT ? `${devis.montantHT.toFixed(2)} Dt` : '0,00 Dt',
      'Montant TTC': devis.montantTTC ? `${devis.montantTTC.toFixed(2)} Dt` : '0,00 Dt',
      'Statut': this.getStatutLabel(devis.statut)
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
    link.setAttribute('download', `devis_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Filter Methods
  applyStatusFilter(status: string): void {
    this.selectedFilter = status;
    this.statutFilter = status === 'all' ? '' : status;
    this.filterDevis();
  }

  clearAllFilters(): void {
    this.selectedFilter = 'all';
    this.clientFilter = '';
    this.statutFilter = '';
    this.dateFilter = null;
    this.searchTerm = '';
    this.filterDevis();
  }

  // Helper method for status labels
  getStatutLabel(statut: string): string {
    switch (statut) {
      case StatutDevis.EN_ATTENTE:
        return 'En Attente';
      case StatutDevis.VALIDE:
        return 'Validé';
      case StatutDevis.ANNULE:
        return 'Annulé';
      default:
        return statut;
    }
  }

  // Helper method for status classes
  getStatutClass(statut: string): string {
    switch (statut) {
      case StatutDevis.EN_ATTENTE:
        return 'status-pending';
      case StatutDevis.VALIDE:
        return 'status-validated';
      case StatutDevis.ANNULE:
        return 'status-cancelled';
      default:
        return 'status-default';
    }
  }

  // Helper method to check if devis is expired
  isExpired(devis: Devis): boolean {
    if (!devis.dateValidite) return false;
    const today = new Date();
    const validityDate = new Date(devis.dateValidite);
    return validityDate < today && devis.statut === StatutDevis.EN_ATTENTE;
  }
}

 