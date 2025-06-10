import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

@Injectable({
  providedIn: 'root'
})
export class PdfExportService {

  constructor() { }

  // Export table data to PDF
  exportTableToPdf(
    data: any[], 
    columns: {header: string, dataKey: string}[], 
    title: string,
    filename?: string
  ): void {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text(title, 20, 20);
    
    // Add date
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, 20, 30);
    
    // Create table
    autoTable(doc, {
      head: [columns.map(col => col.header)],
      body: data.map(row => columns.map(col => row[col.dataKey] || '')),
      startY: 40,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [94, 114, 228],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250]
      },
      margin: { top: 40, left: 20, right: 20 }
    });
    
    // Save the PDF
    const finalFilename = filename || `${title.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(finalFilename);
  }

  // Export dashboard/analytics to PDF
  exportDashboardToPdf(
    stats: any,
    charts: any[],
    title: string = 'Tableau de Bord'
  ): void {
    const doc = new jsPDF();
    let yPosition = 20;
    
    // Title
    doc.setFontSize(24);
    doc.setTextColor(40, 40, 40);
    doc.text(title, 20, yPosition);
    yPosition += 15;
    
    // Date
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Rapport généré le: ${new Date().toLocaleDateString('fr-FR')}`, 20, yPosition);
    yPosition += 20;
    
    // Stats section
    if (stats) {
      doc.setFontSize(16);
      doc.setTextColor(40, 40, 40);
      doc.text('Statistiques Générales', 20, yPosition);
      yPosition += 10;
      
      // Create stats table
      const statsData = Object.keys(stats).map(key => [
        this.formatStatLabel(key),
        this.formatStatValue(stats[key])
      ]);
      
      autoTable(doc, {
        head: [['Métrique', 'Valeur']],
        body: statsData,
        startY: yPosition,
        theme: 'grid',
        styles: { fontSize: 10 },
        headStyles: {
          fillColor: [94, 114, 228],
          textColor: 255
        },
        margin: { left: 20, right: 20 }
      });
      
      yPosition = (doc as any).lastAutoTable.finalY + 20;
    }
    
    // Charts section (if provided)
    if (charts && charts.length > 0) {
      doc.setFontSize(16);
      doc.text('Graphiques', 20, yPosition);
      yPosition += 10;
      
      // Note about charts
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('Les graphiques sont disponibles dans la version web de l\'application.', 20, yPosition);
    }
    
    doc.save(`${title.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
  }

  // Export detailed report with multiple sections
  exportDetailedReport(
    sections: {title: string, data: any[], columns: {header: string, dataKey: string}[]}[],
    reportTitle: string,
    summary?: any
  ): void {
    const doc = new jsPDF();
    let yPosition = 20;
    
    // Main title
    doc.setFontSize(24);
    doc.setTextColor(40, 40, 40);
    doc.text(reportTitle, 20, yPosition);
    yPosition += 15;
    
    // Date and summary
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Rapport généré le: ${new Date().toLocaleDateString('fr-FR')}`, 20, yPosition);
    yPosition += 10;
    
    if (summary) {
      doc.text(`Période: ${summary.period || 'Toutes les données'}`, 20, yPosition);
      yPosition += 5;
      doc.text(`Total d'enregistrements: ${summary.totalRecords || 'N/A'}`, 20, yPosition);
      yPosition += 15;
    }
    
    // Process each section
    sections.forEach((section, index) => {
      // Check if we need a new page
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      // Section title
      doc.setFontSize(16);
      doc.setTextColor(40, 40, 40);
      doc.text(section.title, 20, yPosition);
      yPosition += 10;
      
      // Section table
      autoTable(doc, {
        head: [section.columns.map(col => col.header)],
        body: section.data.map(row => section.columns.map(col => row[col.dataKey] || '')),
        startY: yPosition,
        theme: 'grid',
        styles: {
          fontSize: 8,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [94, 114, 228],
          textColor: 255,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [245, 247, 250]
        },
        margin: { left: 20, right: 20 }
      });
      
      yPosition = (doc as any).lastAutoTable.finalY + 15;
    });
    
    doc.save(`${reportTitle.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
  }

  // Export element as PDF (for complex layouts)
  async exportElementToPdf(elementId: string, filename: string): Promise<void> {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error('Element not found:', elementId);
      return;
    }

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  }

  // Helper methods
  private formatStatLabel(key: string): string {
    const labels: {[key: string]: string} = {
      totalClients: 'Total Clients',
      totalProducts: 'Total Produits',
      totalInvoices: 'Total Factures',
      totalRevenue: 'Chiffre d\'Affaires',
      pendingPayments: 'Paiements en Attente',
      monthlyGrowth: 'Croissance Mensuelle',
      averageOrderValue: 'Panier Moyen'
    };
    return labels[key] || key;
  }

  private formatStatValue(value: any): string {
    if (typeof value === 'number') {
      if (value > 1000) {
        return new Intl.NumberFormat('fr-FR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(value) + ' DT';
      }
      return value.toString();
    }
    return value?.toString() || 'N/A';
  }

  // Format currency for PDF
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount) + ' DT';
  }

  // Format date for PDF
  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }
}
