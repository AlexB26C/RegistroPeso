package com.alex.registropeso.repository;

import com.alex.registropeso.model.RegistroPeso;
import  org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RegistroPesoRepository extends JpaRepository<RegistroPeso, Long>{
    List<RegistroPeso> findByUsuarioIdOrderByFechaDesc(Long usuarioId);
}
