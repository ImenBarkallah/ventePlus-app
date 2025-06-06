package org.ms.client_service.web;

import org.springframework.beans.factory.annotation.Value;

import org.springframework.web.bind.annotation.RestController;
import org.ms.client_service.entities.Client;
import org.ms.client_service.services.ClientService;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RefreshScope
@RequestMapping("/clients")

public class ClientRestController {

	private final ClientService clientService;

	public ClientRestController(ClientService clientService) {
		this.clientService = clientService;
	}

	@PostMapping
	public Client saveClient(@RequestBody Client client) {
		return clientService.saveClient(client);
	}

	@GetMapping("/{id}")
	public Client getClient(@PathVariable Long id) {
		return clientService.getClient(id);
	}

	@GetMapping
	public List<Client> getAllClients() {
		return clientService.getAllClients();
	}

	@DeleteMapping("/{id}")
	public void deleteClient(@PathVariable Long id) {
		clientService.deleteClient(id);
	}

	@PutMapping("/{id}") 
	public Client updateClient(@PathVariable Long id, @RequestBody Client client) {
		return clientService.updateClient(id, client);
	}

	@Value("${app.testMessage:default message}")
	private String testMessage;

	@GetMapping("/test-config")
	public String testConfig() {
		return testMessage;
	}

}
