import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FactureService } from '../../services/facture.service';
import { ReglementService } from '../../services/reglement.service';
import { PdfExportService } from '../../services/pdf-export.service';
import { Facture } from '../../models/facture.model';
import { Reglement, ReglementDTO } from '../../models/reglement.model';

@Component({
  selector: 'app-facture',
  templateUrl: './facture.component.html',
  styleUrls: ['./facture.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ]
})
export class FactureComponent implements OnInit {
  factures: Facture[] = [];
  selectedFacture: Facture | null = null;
  isLoading = false;
  showAlert = false;
  alertMessage = '';
  alertType = '';
  showViewModal = false;
  showDeleteModal = false;
  searchTerm = '';
  currentPage = 1;
  itemsPerPage = 10;
  showFilters = false;
  clientFilter = '';
  dateFilter = '';

  // Enhanced Features
  sortBy: string = 'dateFacture';
  sortDirection: 'asc' | 'desc' = 'desc';
  selectedFilter: string = 'all';
  filteredFactures: Facture[] = [];

  // Analytics
  factureStats = {
    total: 0,
    paid: 0,
    unpaid: 0,
    partial: 0,
    totalValue: 0,
    paidValue: 0,
    unpaidValue: 0
  };

  // Payment-related properties
  showPaymentModal = false;
  showPaymentHistoryModal = false;
  paymentData: ReglementDTO = {
    factureId: 0,
    montantPaye: 0,
    modeReglement: 'CARTE',
    reference: '',
    commentaire: ''
  };
  paymentHistory: Reglement[] = [];
  facturePayments: Map<number, Reglement[]> = new Map();
  isProcessingPayment = false;

  constructor(
    private factureService: FactureService,
    private reglementService: ReglementService,
    private pdfExportService: PdfExportService
  ) {}

  ngOnInit(): void {
    this.loadFactures();
    this.loadAllPayments();
  }

  loadFactures(): void {
    this.isLoading = true;
    this.factureService.getFactures().subscribe({
      next: (data) => {
        this.factures = data;
        this.calculateStats();
        this.filterFactures();
        this.isLoading = false;
      },
      error: (error) => {
        this.showError('Erreur lors du chargement des factures');
        this.isLoading = false;
      }
    });
  }

  filterFactures(): void {
    let result = [...this.factures];

    // Apply search filter
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      result = result.filter(f =>
        f.id.toString().includes(searchLower) ||
        f.client?.nom.toLowerCase().includes(searchLower) ||
        f.client?.prenom.toLowerCase().includes(searchLower) ||
        f.montantTTC.toString().includes(searchLower)
      );
    }

    // Apply client filter
    if (this.clientFilter) {
      const clientLower = this.clientFilter.toLowerCase();
      result = result.filter(f =>
        f.client?.nom.toLowerCase().includes(clientLower) ||
        f.client?.prenom.toLowerCase().includes(clientLower)
      );
    }

    // Apply date filter
    if (this.dateFilter) {
      const filterDate = new Date(this.dateFilter).toISOString().split('T')[0];
      result = result.filter(f =>
        new Date(f.dateFacture).toISOString().split('T')[0] === filterDate
      );
    }

    // Apply payment status filter
    if (this.selectedFilter !== 'all') {
      result = result.filter(f => {
        const status = this.getPaymentStatusText(f);
        switch (this.selectedFilter) {
          case 'paid':
            return status === 'Payée';
          case 'unpaid':
            return status === 'Non payée';
          case 'partial':
            return status === 'Partiellement payée';
          default:
            return true;
        }
      });
    }

    this.filteredFactures = result;
    this.currentPage = 1;
    this.applySorting();
  }

  get paginatedFactures(): Facture[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredFactures.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredFactures.length / this.itemsPerPage);
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  onClientFilterChange(value: string): void {
    this.clientFilter = value;
    this.filterFactures();
  }

  onDateFilterChange(value: string): void {
    this.dateFilter = value;
    this.filterFactures();
  }

  resetFilters(): void {
    this.clientFilter = '';
    this.dateFilter = '';
    this.selectedFilter = 'all';
    this.filterFactures();
  }

  onSearchChange(term: string): void {
    this.searchTerm = term;
    this.filterFactures();
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
  }

  viewFacture(facture: Facture): void {
    this.selectedFacture = facture;
    this.showViewModal = true;
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.selectedFacture = null;
  }

  openDeleteModal(facture: Facture): void {
    this.selectedFacture = facture;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedFacture = null;
  }

  onDelete(): void {
    if (this.selectedFacture) {
      this.factureService.deleteFacture(this.selectedFacture.id).subscribe({
        next: () => {
          this.factures = this.factures.filter(f => f.id !== this.selectedFacture?.id);
          this.showSuccess('Facture supprimée avec succès');
          this.closeDeleteModal();
        },
        error: (error) => {
          this.showError('Erreur lors de la suppression de la facture');
        }
      });
    }
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

  // ==================== PAYMENT METHODS ====================

  loadAllPayments(): void {
    this.reglementService.getAllReglements().subscribe({
      next: (payments) => {
        // Group payments by invoice ID
        this.facturePayments.clear();
        payments.forEach(payment => {
          if (!this.facturePayments.has(payment.factureId)) {
            this.facturePayments.set(payment.factureId, []);
          }
          this.facturePayments.get(payment.factureId)!.push(payment);
        });
      },
      error: (error) => {
        console.error('Error loading payments:', error);
      }
    });
  }

  openPaymentModal(facture: Facture): void {
    this.selectedFacture = facture;
    this.paymentData = {
      factureId: facture.id,
      montantPaye: this.getRemainingAmount(facture),
      modeReglement: 'CARTE',
      reference: '',
      commentaire: ''
    };
    this.showPaymentModal = true;
  }

  closePaymentModal(): void {
    this.showPaymentModal = false;
    this.selectedFacture = null;
    this.isProcessingPayment = false;
  }

  onPaymentSubmit(): void {
    if (!this.selectedFacture || this.isProcessingPayment) return;

    // Validation
    if (!this.paymentData.montantPaye || this.paymentData.montantPaye <= 0) {
      this.showError('Veuillez saisir un montant valide');
      return;
    }

    const remainingAmount = this.getRemainingAmount(this.selectedFacture);
    if (this.paymentData.montantPaye > remainingAmount) {
      this.showError(`Le montant ne peut pas dépasser le montant restant (${remainingAmount.toFixed(2)} Dt)`);
      return;
    }

    if (!this.paymentData.modeReglement) {
      this.showError('Veuillez sélectionner un mode de règlement');
      return;
    }

    this.isProcessingPayment = true;
    this.reglementService.createReglement(this.paymentData).subscribe({
      next: (payment) => {
        this.showSuccess('Paiement effectué avec succès');
        this.loadAllPayments(); // Reload payments
        this.closePaymentModal();
      },
      error: (error) => {
        this.showError('Erreur lors du traitement du paiement');
        this.isProcessingPayment = false;
      }
    });
  }

  viewPaymentHistory(facture: Facture): void {
    this.selectedFacture = facture;
    this.paymentHistory = this.facturePayments.get(facture.id) || [];
    this.showPaymentHistoryModal = true;
  }

  closePaymentHistoryModal(): void {
    this.showPaymentHistoryModal = false;
    this.selectedFacture = null;
    this.paymentHistory = [];
  }

  // ==================== PAYMENT STATUS METHODS ====================

  getPaymentStatusText(facture: Facture): string {
    const amountPaid = this.getAmountPaid(facture);
    const total = facture.montantTTC;

    if (amountPaid === 0) {
      return 'Non payée';
    } else if (amountPaid >= total) {
      return 'Payée';
    } else {
      return 'Partiellement payée';
    }
  }

  getPaymentStatusClass(facture: Facture): string {
    const amountPaid = this.getAmountPaid(facture);
    const total = facture.montantTTC;

    if (amountPaid === 0) {
      return 'status-unpaid';
    } else if (amountPaid >= total) {
      return 'status-paid';
    } else {
      return 'status-partial';
    }
  }

  isFactureFullyPaid(facture: Facture): boolean {
    const amountPaid = this.getAmountPaid(facture);
    return amountPaid >= facture.montantTTC;
  }

  getAmountPaid(facture: Facture): number {
    const payments = this.facturePayments.get(facture.id) || [];
    return payments.reduce((sum, payment) => sum + payment.montantPaye, 0);
  }

  getRemainingAmount(facture: Facture): number {
    const amountPaid = this.getAmountPaid(facture);
    return Math.max(0, facture.montantTTC - amountPaid);
  }

  formatPaymentMode(mode: string): string {
    const modes: {[key: string]: string} = {
      'CARTE': 'Carte bancaire',
      'VIREMENT': 'Virement',
      'ESPECES': 'Espèces',
      'CHEQUE': 'Chèque'
    };
    return modes[mode] || mode;
  }

  // Enhanced Features
  applySorting(): void {
    this.filteredFactures.sort((a, b) => {
      let valueA: any;
      let valueB: any;

      switch (this.sortBy) {
        case 'id':
          valueA = a.id;
          valueB = b.id;
          break;
        case 'client':
          valueA = a.client ? `${a.client.nom} ${a.client.prenom}`.toLowerCase() : '';
          valueB = b.client ? `${b.client.nom} ${b.client.prenom}`.toLowerCase() : '';
          break;
        case 'dateFacture':
          valueA = new Date(a.dateFacture).getTime();
          valueB = new Date(b.dateFacture).getTime();
          break;
        case 'montantTTC':
          valueA = a.montantTTC || 0;
          valueB = b.montantTTC || 0;
          break;
        case 'paymentStatus':
          valueA = this.getPaymentStatusText(a);
          valueB = this.getPaymentStatusText(b);
          break;
        default:
          valueA = new Date(a.dateFacture).getTime();
          valueB = new Date(b.dateFacture).getTime();
      }

      if (valueA < valueB) {
        return this.sortDirection === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
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
    this.factureStats.total = this.factures.length;
    this.factureStats.totalValue = this.factures.reduce((sum, f) => sum + (f.montantTTC || 0), 0);

    let paid = 0, unpaid = 0, partial = 0;
    let paidValue = 0, unpaidValue = 0;

    this.factures.forEach(facture => {
      const status = this.getPaymentStatusText(facture);
      const amountPaid = this.getAmountPaid(facture);

      switch (status) {
        case 'Payée':
          paid++;
          paidValue += facture.montantTTC;
          break;
        case 'Non payée':
          unpaid++;
          unpaidValue += facture.montantTTC;
          break;
        case 'Partiellement payée':
          partial++;
          paidValue += amountPaid;
          unpaidValue += (facture.montantTTC - amountPaid);
          break;
      }
    });

    this.factureStats.paid = paid;
    this.factureStats.unpaid = unpaid;
    this.factureStats.partial = partial;
    this.factureStats.paidValue = paidValue;
    this.factureStats.unpaidValue = unpaidValue;
  }

  // Export Methods
  exportToPdf(): void {
    const columns = [
      { header: 'ID', dataKey: 'id' },
      { header: 'Client', dataKey: 'client' },
      { header: 'Date Facture', dataKey: 'dateFacture' },
      { header: 'Montant TTC', dataKey: 'montantTTC' },
      { header: 'Montant Payé', dataKey: 'montantPaye' },
      { header: 'Montant Restant', dataKey: 'montantRestant' },
      { header: 'Statut Paiement', dataKey: 'statutPaiement' }
    ];

    const data = this.filteredFactures.map(facture => ({
      id: facture.id.toString(),
      client: facture.client ? `${facture.client.nom} ${facture.client.prenom}` : 'N/A',
      dateFacture: new Date(facture.dateFacture).toLocaleDateString('fr-FR'),
      montantTTC: `${facture.montantTTC.toFixed(2)} Dt`,
      montantPaye: `${this.getAmountPaid(facture).toFixed(2)} Dt`,
      montantRestant: `${this.getRemainingAmount(facture).toFixed(2)} Dt`,
      statutPaiement: this.getPaymentStatusText(facture)
    }));

    this.pdfExportService.exportTableToPdf(
      data,
      columns,
      'Liste des Factures',
      `factures_${new Date().toISOString().split('T')[0]}.pdf`
    );
  }

  exportToExcel(): void {
    const data = this.filteredFactures.map(facture => ({
      'ID': facture.id.toString(),
      'Client': facture.client ? `${facture.client.nom} ${facture.client.prenom}` : 'N/A',
      'Date Facture': new Date(facture.dateFacture).toLocaleDateString('fr-FR'),
      'Montant TTC': `${facture.montantTTC.toFixed(2)} Dt`,
      'Montant Payé': `${this.getAmountPaid(facture).toFixed(2)} Dt`,
      'Montant Restant': `${this.getRemainingAmount(facture).toFixed(2)} Dt`,
      'Statut Paiement': this.getPaymentStatusText(facture)
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
    link.setAttribute('download', `factures_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Filter Methods
  applyPaymentStatusFilter(status: string): void {
    this.selectedFilter = status;
    this.filterFactures();
  }

  clearAllFilters(): void {
    this.selectedFilter = 'all';
    this.clientFilter = '';
    this.dateFilter = '';
    this.searchTerm = '';
    this.filterFactures();
  }

  // Helper method to check if facture is overdue
  isOverdue(facture: Facture): boolean {
    // Assuming 30 days payment term
    const dueDate = new Date(facture.dateFacture);
    dueDate.setDate(dueDate.getDate() + 30);
    const today = new Date();
    return today > dueDate && !this.isFactureFullyPaid(facture);
  }
}
