import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class TopbarComponent {
  isDarkMode = false;
  user = {
    firstName: 'Imen',
    lastName: 'Barkallah',
    role: 'Administrateur',
    isOnline: true
  };

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark-mode');
  }
} 