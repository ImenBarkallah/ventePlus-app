import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { Client } from '../models/client';

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  private baseUrl = 'http://localhost:8888/client-service/clients';

  constructor(private http: HttpClient) {}

  // GET all clients
  getAllClients(): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.baseUrl}`).pipe(
      retry(2),
      catchError(this.handleError)
    );
  }

  // GET client by id
  getClient(id: number): Observable<Client> {
    return this.http.get<Client>(`${this.baseUrl}/${id}`).pipe(
      retry(2),
      catchError(this.handleError)
    );
  }

  // Alias for backward compatibility
  getClientById(id: number): Observable<Client> {
    return this.getClient(id);
  }

  // POST create client
  saveClient(client: Client): Observable<Client> {
    return this.http.post<Client>(`${this.baseUrl}`, client).pipe(
      catchError(this.handleError)
    );
  }

  // PUT update client
  updateClient(id: number, client: Client): Observable<Client> {
    return this.http.put<Client>(`${this.baseUrl}/${id}`, client).pipe(
      catchError(this.handleError)
    );
  }

  // DELETE client
  deleteClient(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur inconnue s\'est produite';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 400:
          errorMessage = 'Données invalides';
          break;
        case 401:
          errorMessage = 'Non autorisé';
          break;
        case 403:
          errorMessage = 'Accès interdit';
          break;
        case 404:
          errorMessage = 'Client non trouvé';
          break;
        case 409:
          errorMessage = 'Conflit - Le client existe déjà';
          break;
        case 500:
          errorMessage = 'Erreur serveur interne';
          break;
        case 0:
          errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion.';
          break;
        default:
          errorMessage = `Erreur ${error.status}: ${error.message}`;
      }
    }

    console.error('Client Service Error:', error);
    return throwError(() => new Error(errorMessage));
  }

}
