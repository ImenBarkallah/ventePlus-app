import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReglementService } from '../../services/reglement.service';
import { ClientService } from '../../services/client.service';
import { PdfExportService } from '../../services/pdf-export.service';
import { Reglement, ReglementDTO, FactureStatus } from '../../models/reglement.model';
import { Client } from '../../models/client';

declare var bootstrap: any;

@Component({
  selector: 'app-reglement',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './reglement.component.html',
  styleUrl: './reglement.component.css'
})
export class ReglementComponent implements OnInit {
  // Data Arrays
  reglements: Reglement[] = [];
  filteredReglements: Reglement[] = [];
  clients: Client[] = [];
  paidInvoices: FactureStatus[] = [];
  unpaidInvoices: FactureStatus[] = [];
  partialInvoices: FactureStatus[] = [];
  availableInvoices: FactureStatus[] = [];

  // Form
  reglementForm: FormGroup;
  currentReglement: Reglement | null = null;

  // Filters
  selectedClientId: string = '';
  selectedPaymentMode: string = '';
  selectedYear: string = '';
  paymentModes: string[] = [];
  years: number[] = [];

  // Enhanced Filters
  searchTerm: string = '';
  minAmount: number | null = null;
  maxAmount: number | null = null;
  startDate: string = '';
  endDate: string = '';

  // Sorting and Pagination
  sortBy: string = 'dateReglement';
  sortDirection: 'asc' | 'desc' = 'desc';
  pageSize: number = 25;
  currentPage: number = 1;
  paginatedReglements: Reglement[] = [];

  // UI State
  filtersExpanded: boolean = true;

  // Stats
  totalPayments = 0;
  currentFilter = 'all';

  // Loading states
  loading = true;
  saving = false;
  error: string | null = null;

  // Modal
  showModalFlag = false;
  showDeleteModal = false;
  reglementToDelete: Reglement | null = null;

  constructor(
    private reglementService: ReglementService,
    private clientService: ClientService,
    private pdfExportService: PdfExportService,
    private fb: FormBuilder
  ) {
    this.reglementForm = this.createForm();
    this.paymentModes = this.reglementService.getPaymentModes();
  }

  ngOnInit(): void {
    this.loadData();
    this.generateYears();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      factureId: ['', [Validators.required]],
      montantPaye: ['', [Validators.required, Validators.min(0.01)]],
      modeReglement: ['', [Validators.required]],
      reference: ['', [Validators.required]],
      commentaire: ['']
    });
  }

  async loadData(): Promise<void> {
    try {
      this.loading = true;
      this.error = null;

      console.log('Starting to load reglement data...');

      // Load all data in parallel
      const [
        reglements,
        clients,
        paidInvoices,
        unpaidInvoices,
        partialInvoices
      ] = await Promise.all([
        this.reglementService.getAllReglements().toPromise(),
        this.clientService.getAllClients().toPromise(),
        this.reglementService.getFacturesReglees().toPromise(),
        this.reglementService.getFacturesNonReglees().toPromise(),
        this.reglementService.getFacturesPartiellemementReglees().toPromise()
      ]);

      console.log('Data loaded successfully:');
      console.log('- Reglements:', reglements?.length || 0, reglements);
      console.log('- Clients:', clients?.length || 0, clients);
      console.log('- Paid invoices:', paidInvoices?.length || 0, paidInvoices);
      console.log('- Unpaid invoices:', unpaidInvoices?.length || 0, unpaidInvoices);
      console.log('- Partial invoices:', partialInvoices?.length || 0, partialInvoices);

      // Assign data
      this.reglements = reglements || [];
      this.clients = clients || [];
      this.paidInvoices = paidInvoices || [];
      this.unpaidInvoices = unpaidInvoices || [];
      this.partialInvoices = partialInvoices || [];

      // Calculate stats
      this.calculateStats();

      // Apply filters
      this.applyFilters();

      // Prepare available invoices for form
      this.prepareAvailableInvoices();

    } catch (error) {
      console.error('Error loading reglement data:', error);
      this.error = 'Erreur lors du chargement des données. Vérifiez que les services backend sont démarrés.';

      // Provide fallback empty data so the form still works
      this.reglements = [];
      this.clients = [];
      this.paidInvoices = [];
      this.unpaidInvoices = [];
      this.partialInvoices = [];
      this.availableInvoices = [];

      console.log('Using fallback empty data');
    } finally {
      this.loading = false;
    }
  }

  private calculateStats(): void {
    this.totalPayments = this.reglements.reduce((sum, r) => sum + r.montantPaye, 0);
  }



  private prepareAvailableInvoices(): void {
    // For creating new reglements: only unpaid and partial invoices
    this.availableInvoices = [...this.unpaidInvoices, ...this.partialInvoices];
    console.log('Available invoices for form:', this.availableInvoices);
    console.log('Payment modes:', this.paymentModes);
  }



  private generateYears(): void {
    const currentYear = new Date().getFullYear();
    this.years = [];
    for (let i = currentYear; i >= currentYear - 5; i--) {
      this.years.push(i);
    }
  }

  // Enhanced Filter Methods
  applyFilters(): void {
    this.filteredReglements = this.reglements.filter(reglement => {
      let matches = true;

      // Search term filter
      if (this.searchTerm) {
        const searchLower = this.searchTerm.toLowerCase();
        const client = this.getClientById(reglement.clientId);
        const clientName = client ? `${client.prenom} ${client.nom}`.toLowerCase() : '';

        matches = matches && (
          reglement.numeroReglement?.toLowerCase().includes(searchLower) ||
          reglement.reference?.toLowerCase().includes(searchLower) ||
          clientName.includes(searchLower) ||
          reglement.factureId?.toString().includes(searchLower)
        );
      }

      // Amount range filter
      if (this.minAmount !== null && this.minAmount > 0) {
        matches = matches && reglement.montantPaye >= this.minAmount;
      }
      if (this.maxAmount !== null && this.maxAmount > 0) {
        matches = matches && reglement.montantPaye <= this.maxAmount;
      }

      // Date range filter
      if (this.startDate) {
        const reglementDate = new Date(reglement.dateReglement || '');
        const startDate = new Date(this.startDate);
        matches = matches && reglementDate >= startDate;
      }
      if (this.endDate) {
        const reglementDate = new Date(reglement.dateReglement || '');
        const endDate = new Date(this.endDate);
        matches = matches && reglementDate <= endDate;
      }

      // Filter by client
      if (this.selectedClientId) {
        matches = matches && reglement.clientId?.toString() === this.selectedClientId;
      }

      // Filter by payment mode
      if (this.selectedPaymentMode) {
        matches = matches && reglement.modeReglement === this.selectedPaymentMode;
      }

      // Filter by year
      if (this.selectedYear) {
        const reglementYear = new Date(reglement.dateReglement || '').getFullYear();
        matches = matches && reglementYear.toString() === this.selectedYear;
      }

      return matches;
    });

    this.applySorting();
    this.updatePagination();
  }

  // Sorting Methods
  applySorting(): void {
    this.filteredReglements.sort((a, b) => {
      let valueA: any;
      let valueB: any;

      switch (this.sortBy) {
        case 'dateReglement':
          valueA = new Date(a.dateReglement || '').getTime();
          valueB = new Date(b.dateReglement || '').getTime();
          break;
        case 'montantPaye':
          valueA = a.montantPaye;
          valueB = b.montantPaye;
          break;
        case 'numeroReglement':
          valueA = a.numeroReglement || '';
          valueB = b.numeroReglement || '';
          break;
        case 'client':
          const clientA = this.getClientById(a.clientId);
          const clientB = this.getClientById(b.clientId);
          valueA = clientA ? `${clientA.prenom} ${clientA.nom}` : '';
          valueB = clientB ? `${clientB.prenom} ${clientB.nom}` : '';
          break;
        default:
          valueA = a.dateReglement;
          valueB = b.dateReglement;
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

  toggleSortDirection(): void {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.applySorting();
  }

  // Pagination Methods
  updatePagination(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedReglements = this.filteredReglements.slice(startIndex, endIndex);
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredReglements.length / this.pageSize);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  onPageClick(page: number | string): void {
    if (typeof page === 'number') {
      this.goToPage(page);
    }
  }

  // UI Methods
  toggleFilters(): void {
    this.filtersExpanded = !this.filtersExpanded;
  }

  // Helper Methods for Enhanced Features
  getTotalFilteredAmount(): number {
    return this.filteredReglements.reduce((sum, r) => sum + r.montantPaye, 0);
  }

  // Math helper for template
  Math = Math;

  // Pagination helper methods
  getPaginationPages(): (number | string)[] {
    const totalPages = this.getTotalPages();
    const current = this.currentPage;
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (current > 4) {
        pages.push('...');
      }

      // Show pages around current page
      const start = Math.max(2, current - 1);
      const end = Math.min(totalPages - 1, current + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (current < totalPages - 3) {
        pages.push('...');
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  }

  clearFilters(): void {
    this.selectedClientId = '';
    this.selectedPaymentMode = '';
    this.selectedYear = '';
    this.searchTerm = '';
    this.minAmount = null;
    this.maxAmount = null;
    this.startDate = '';
    this.endDate = '';
    this.currentFilter = 'all';
    this.applyFilters();
  }

  // New Filter Methods
  onSearchChange(): void {
    this.applyFilters();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilters();
  }

  getFilterLabel(): string {
    switch (this.currentFilter) {
      case 'paid':
        return 'Factures Payées';
      case 'unpaid':
        return 'Factures Impayées';
      case 'partial':
        return 'Paiements Partiels';
      default:
        return '';
    }
  }

  clearActiveFilter(): void {
    this.currentFilter = 'all';
    this.applyFilters();
  }

  exportData(): void {
    const dataToExport = this.filteredReglements.map(reglement => {
      const client = this.getClientById(reglement.clientId);
      return {
        'Numéro': reglement.numeroReglement,
        'Facture': `Facture #${reglement.factureId}`,
        'Client': client ? `${client.prenom} ${client.nom}` : 'N/A',
        'Montant': reglement.montantPaye,
        'Mode': this.formatPaymentMode(reglement.modeReglement || ''),
        'Date': new Date(reglement.dateReglement || '').toLocaleDateString('fr-FR'),
        'Référence': reglement.reference || ''
      };
    });

    // Convert to CSV
    const headers = Object.keys(dataToExport[0] || {});
    const csvContent = [
      headers.join(','),
      ...dataToExport.map(row => headers.map(header => `"${row[header as keyof typeof row]}"`).join(','))
    ].join('\n');

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reglements_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  refreshData(): void {
    this.loadData();
  }

  clearError(): void {
    this.error = null;
  }

  // Modal Methods
  openCreateModal(): void {
    this.currentReglement = null;
    this.reglementForm.reset();
    this.showModal();
  }

  viewReglement(reglement: Reglement): void {
    this.currentReglement = reglement;
    // No need to patch form values since we're showing a separate view template
    this.showModal();
  }

  deleteReglement(reglement: Reglement): void {
    this.showDeleteConfirmation(reglement);
  }

  showDeleteConfirmation(reglement: Reglement): void {
    this.reglementToDelete = reglement;
    this.showDeleteModal = true;
  }

  async confirmDelete(): Promise<void> {
    if (this.reglementToDelete) {
      try {
        await this.reglementService.deleteReglement(this.reglementToDelete.id!).toPromise();
        this.loadData();
        this.hideDeleteModal();
      } catch (error) {
        console.error('Error deleting reglement:', error);
        this.error = 'Erreur lors de la suppression du règlement';
        this.hideDeleteModal();
      }
    }
  }

  hideDeleteModal(): void {
    this.showDeleteModal = false;
    this.reglementToDelete = null;
  }

  async saveReglement(): Promise<void> {
    if (this.reglementForm.invalid) return;

    try {
      this.saving = true;
      const formValue = this.reglementForm.value;

      // Only create new reglements - no editing allowed
      await this.reglementService.createReglement(formValue).toPromise();

      this.hideModal();
      this.loadData();
    } catch (error) {
      console.error('Error saving reglement:', error);
      alert('Erreur lors de la sauvegarde du règlement');
    } finally {
      this.saving = false;
    }
  }

  private showModal(): void {
    this.showModalFlag = true;
    document.body.classList.add('modal-open');
  }

  hideModal(): void {
    this.showModalFlag = false;
    this.currentReglement = null; // Clear current reglement
    document.body.classList.remove('modal-open');
  }

  // Helper Methods
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount) + ' DT';
  }

  // Get current month name
  getCurrentMonthName(): string {
    const months = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return months[new Date().getMonth()];
  }

  // Export to PDF
  exportToPdf(): void {
    if (this.filteredReglements.length === 0) {
      alert('Aucune donnée à exporter');
      return;
    }

    const data = this.filteredReglements.map(reglement => {
      const client = this.getClientById(reglement.clientId);
      return {
        numero: reglement.numeroReglement,
        facture: `Facture #${reglement.factureId}`,
        client: client ? `${client.prenom} ${client.nom}` : 'Client inconnu',
        montant: `${reglement.montantPaye.toFixed(2)} DT`,
        mode: this.formatPaymentMode(reglement.modeReglement),
        date: reglement.dateReglement ? new Date(reglement.dateReglement).toLocaleDateString('fr-FR') : 'N/A',
        reference: reglement.reference || 'N/A'
      };
    });

    const columns = [
      { header: 'Numéro', dataKey: 'numero' },
      { header: 'Facture', dataKey: 'facture' },
      { header: 'Client', dataKey: 'client' },
      { header: 'Montant', dataKey: 'montant' },
      { header: 'Mode', dataKey: 'mode' },
      { header: 'Date', dataKey: 'date' },
      { header: 'Référence', dataKey: 'reference' }
    ];

    this.pdfExportService.exportTableToPdf(data, columns, 'Liste des Règlements');
  }

  // Export to Excel
  exportToExcel(): void {
    const data = this.filteredReglements.map(reglement => {
      const client = this.getClientById(reglement.clientId);
      return {
        'Numéro': reglement.numeroReglement,
        'Facture': `Facture #${reglement.factureId}`,
        'Client': client ? `${client.prenom} ${client.nom}` : 'Client inconnu',
        'Montant': `${reglement.montantPaye.toFixed(2)} DT`,
        'Mode': this.formatPaymentMode(reglement.modeReglement),
        'Date': reglement.dateReglement ? new Date(reglement.dateReglement).toLocaleDateString('fr-FR') : 'N/A',
        'Référence': reglement.reference || 'N/A'
      };
    });

    // Convert to CSV format
    if (data.length === 0) {
      alert('Aucune donnée à exporter');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header as keyof typeof row]}"`).join(','))
    ].join('\n');

    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reglements_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  formatPaymentMode(mode: string): string {
    if (!mode) return 'Non spécifié';
    return this.reglementService.formatPaymentMode(mode);
  }

  getPaymentModeClass(mode: string): string {
    if (!mode) return 'mode-unknown';

    const classes: {[key: string]: string} = {
      'CARTE': 'mode-carte',
      'VIREMENT': 'mode-virement',
      'ESPECES': 'mode-especes',
      'CHEQUE': 'mode-cheque'
    };
    return classes[mode] || 'mode-other';
  }

  getClientById(clientId?: number): any {
    if (!clientId) return null;
    return this.clients.find(c => c.id === clientId);
  }

  // Enhanced Analytics Methods
  getMonthlyGrowth(): number {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const thisMonth = this.reglements.filter(r => {
      const date = new Date(r.dateReglement || '');
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    }).reduce((sum, r) => sum + r.montantPaye, 0);

    const lastMonth = this.reglements.filter(r => {
      const date = new Date(r.dateReglement || '');
      const lastMonthDate = new Date(currentYear, currentMonth - 1);
      return date.getMonth() === lastMonthDate.getMonth() && date.getFullYear() === lastMonthDate.getFullYear();
    }).reduce((sum, r) => sum + r.montantPaye, 0);

    if (lastMonth === 0) return 0;
    return Math.round(((thisMonth - lastMonth) / lastMonth) * 100);
  }

  getPaymentPercentage(type: string): number {
    const total = this.paidInvoices.length + this.unpaidInvoices.length + this.partialInvoices.length;
    if (total === 0) return 0;

    switch (type) {
      case 'paid':
        return Math.round((this.paidInvoices.length / total) * 100);
      case 'unpaid':
        return Math.round((this.unpaidInvoices.length / total) * 100);
      case 'partial':
        return Math.round((this.partialInvoices.length / total) * 100);
      default:
        return 0;
    }
  }

  getUnpaidAmount(): number {
    return this.unpaidInvoices.reduce((sum, invoice) => sum + (invoice.montantRestant || 0), 0);
  }

  getPartialAmount(): number {
    return this.partialInvoices.reduce((sum, invoice) => sum + (invoice.montantRestant || 0), 0);
  }

  getAveragePayment(): number {
    if (this.reglements.length === 0) return 0;
    return this.totalPayments / this.reglements.length;
  }

  getThisMonthPayments(): number {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    return this.reglements.filter(r => {
      const date = new Date(r.dateReglement || '');
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    }).reduce((sum, r) => sum + r.montantPaye, 0);
  }

  getThisMonthCount(): number {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    return this.reglements.filter(r => {
      const date = new Date(r.dateReglement || '');
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    }).length;
  }

  getPaymentMethodsStats(): any[] {
    const stats: {[key: string]: {amount: number, count: number}} = {};

    this.reglements.forEach(r => {
      const mode = r.modeReglement || 'UNKNOWN';
      if (!stats[mode]) {
        stats[mode] = {amount: 0, count: 0};
      }
      stats[mode].amount += r.montantPaye;
      stats[mode].count++;
    });

    const total = this.totalPayments;

    return Object.keys(stats).map(mode => ({
      mode,
      amount: stats[mode].amount,
      count: stats[mode].count,
      percentage: total > 0 ? Math.round((stats[mode].amount / total) * 100) : 0
    })).sort((a, b) => b.amount - a.amount);
  }

  getPaymentModeIcon(mode: string): string {
    const icons: {[key: string]: string} = {
      'CARTE': 'fa-solid fa-credit-card',
      'VIREMENT': 'fa-solid fa-university',
      'ESPECES': 'fa-solid fa-money-bills',
      'CHEQUE': 'fa-solid fa-money-check',
      'UNKNOWN': 'fa-solid fa-question'
    };
    return icons[mode] || 'fa-solid fa-payment';
  }

  // Enhanced Filter Methods
  filterByPaymentStatus(status: string): void {
    this.currentFilter = status;
    this.clearFilters();

    switch (status) {
      case 'paid':
        // Filter to show only paid invoices related reglements
        this.filteredReglements = this.reglements.filter(r =>
          this.paidInvoices.some(p => p.facture.id === r.factureId)
        );
        break;
      case 'unpaid':
        // Show unpaid invoices (no reglements)
        this.filteredReglements = [];
        break;
      case 'partial':
        // Filter to show only partial payment related reglements
        this.filteredReglements = this.reglements.filter(r =>
          this.partialInvoices.some(p => p.facture.id === r.factureId)
        );
        break;
      default:
        this.applyFilters();
    }
  }

  filterByPaymentMode(mode: string): void {
    this.selectedPaymentMode = mode;
    this.applyFilters();
  }
}
