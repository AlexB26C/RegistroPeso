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

        Optional<RegistroPeso> primerRegistroOpt = registroPesoRepository
                .findFirstByUsuarioIdOrderByFechaAsc(usuarioId);

        Optional<RegistroPeso> ultimoRegistroOpt = registroPesoRepository
                .findFirstByUsuarioIdOrderByFechaDescIdDesc(usuarioId);

        BigDecimal pesoObjetivo = usuario.getPesoObjetivo();

        if (primerRegistroOpt.isEmpty() || ultimoRegistroOpt.isEmpty()) {
            return new ProgresoDTO(
                    null,
                    null,
                    pesoObjetivo,
                    BigDecimal.ZERO);
        }

        BigDecimal pesoInicial = primerRegistroOpt.get().getPesoKg();
        BigDecimal pesoActual = ultimoRegistroOpt.get().getPesoKg();

        if (pesoObjetivo == null) {
            return new ProgresoDTO(
                    pesoInicial,
                    pesoActual,
                    null,
                    BigDecimal.ZERO);
        }

        BigDecimal progreso;

        // Ya estamos en el objetivo
        if (pesoInicial.compareTo(pesoObjetivo) == 0) {

            progreso = BigDecimal.valueOf(100);

        } else {

            BigDecimal progresoCalculado;

            // Objetivo mayor: queremos GANAR peso
            if (pesoObjetivo.compareTo(pesoInicial) > 0) {

                BigDecimal pesoGanado = pesoActual.subtract(pesoInicial);
                BigDecimal pesoTotal = pesoObjetivo.subtract(pesoInicial);

                progresoCalculado = pesoGanado
                        .divide(pesoTotal, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100));

                // Objetivo menor: queremos PERDER peso
            } else {

                BigDecimal pesoPerdido = pesoInicial.subtract(pesoActual);
                BigDecimal pesoTotal = pesoInicial.subtract(pesoObjetivo);

                progresoCalculado = pesoPerdido
                        .divide(pesoTotal, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100));
            }

            progreso = progresoCalculado.setScale(2, RoundingMode.HALF_UP);
        }

        // Nunca menos de 0%
        if (progreso.compareTo(BigDecimal.ZERO) < 0) {
            progreso = BigDecimal.ZERO;
        }

        // Nunca más de 100%
        BigDecimal cien = BigDecimal.valueOf(100);

        if (progreso.compareTo(cien) > 0) {
            progreso = cien;
        }

        return new ProgresoDTO(
                pesoInicial,
                pesoActual,
                pesoObjetivo,
                progreso);
    }
}
