package org.ms.client_service.repository;
import java.util.List;

import org.ms.client_service.entities.Client;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Repository
public interface ClientRepository extends JpaRepository<Client, Long> {
  //  @RestResource (path="/byName")
  //  Page<Client> findByNameContains(@Param("mc") String name , Pageable pageable);
	List<Client> findAllByOrderByCreatedAtDesc();

}