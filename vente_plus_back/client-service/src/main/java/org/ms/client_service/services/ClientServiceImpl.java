package org.ms.client_service.services;

import org.ms.client_service.entities.Client;
import org.ms.client_service.repository.ClientRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClientServiceImpl implements ClientService {

    private final ClientRepository clientRepository;

    public ClientServiceImpl(ClientRepository clientRepository){
        this.clientRepository = clientRepository;
    }

    @Override
    public Client saveClient(Client client) {
        return clientRepository.save(client);
    }

    @Override
    public Client getClient(Long id) {
        return clientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Client introuvable"));
    }

    @Override
    public List<Client> getAllClients() {
        return clientRepository.findAllByOrderByCreatedAtDesc();
    }

    @Override
    public void deleteClient(Long id) {
        clientRepository.deleteById(id);
    }

    @Override
    public Client updateClient(Long id, Client updatedClient) {
        Client existingClient = clientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Client introuvable avec id " + id));

        existingClient.setNom(updatedClient.getNom());
        existingClient.setEmail(updatedClient.getEmail());
        existingClient.setTelephone(updatedClient.getTelephone());

        return clientRepository.save(existingClient);
    }
}
