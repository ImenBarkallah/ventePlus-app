package org.ms.client_service.services;

import java.util.List;

import org.ms.client_service.entities.Client;


public interface ClientService {
    Client saveClient(Client client);
    Client getClient(Long id);
    List<Client> getAllClients();
    void deleteClient(Long id);
    Client updateClient(Long id, Client updatedClient);
}
