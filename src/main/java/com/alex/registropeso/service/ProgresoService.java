package com.alex.registropeso.service;

import com.alex.registropeso.dto.ProgresoDTO;
import com.alex.registropeso.model.RegistroPeso;
import com.alex.registropeso.model.Usuario;
import com.alex.registropeso.repository.RegistroPesoRepository;
import com.alex.registropeso.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class ProgresoService {

    private final RegistroPesoRepository registroPesoRepository;
    private final UsuarioRepository usuarioRepository;

    public ProgresoService(RegistroPesoRepository registroPesoRepository, UsuarioRepository usuarioRepository) {
        this.registroPesoRepository = registroPesoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public ProgresoDTO obtenerProgreso(String username) {

        Usuario usuario = usuarioRepository
                .findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Long usuarioId = usuario.getId();

        RegistroPeso primerRegistro = registroPesoRepository
                .findFirstByUsuarioIdOrderByFechaAsc(usuarioId)
                .orElseThrow(() ->
                        new RuntimeException("No hay registros de peso"));

        RegistroPeso ultimoRegistro = registroPesoRepository
                .findFirstByUsuarioIdOrderByFechaDesc(usuarioId)
                .orElseThrow(() ->
                        new RuntimeException("No hay registros de peso"));

        BigDecimal pesoInicial = primerRegistro.getPesoKg();
        BigDecimal pesoActual = ultimoRegistro.getPesoKg();
        BigDecimal pesoObjetivo = usuario.getPesoObjetivo();

        if (pesoObjetivo == null) {
            throw new RuntimeException("El usuario no tiene un peso objetivo");
        }


        System.out.println("========== PROGRESO ==========");
System.out.println("Usuario: " + username);
System.out.println("Peso inicial: " + pesoInicial);
System.out.println("Peso actual: " + pesoActual);
System.out.println("Peso objetivo: " + pesoObjetivo);
System.out.println("==============================");

        BigDecimal progreso;

        if (pesoInicial.compareTo(pesoObjetivo) == 0) {
            progreso = BigDecimal.valueOf(100);
        } else {
            BigDecimal pesoPerdido = pesoInicial.subtract(pesoActual);

            BigDecimal pesoTotal = pesoInicial.subtract(pesoObjetivo);

            progreso = pesoPerdido.divide(pesoTotal,2, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));

            progreso = progreso.setScale(2, RoundingMode.HALF_UP);
        }

        if (progreso.compareTo(BigDecimal.ZERO) < 0) {
            progreso = BigDecimal.ZERO;
        }

        BigDecimal cien = BigDecimal.valueOf(100);

        if (progreso.compareTo(cien) > 0) {
            progreso = cien;
        }

        System.out.println("Progreso calculado: " + progreso);
        
        return new ProgresoDTO(pesoInicial, pesoActual, pesoObjetivo, progreso);

    }
}
