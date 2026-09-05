package com.alex.registropeso.service;

import com.alex.registropeso.dto.ProgresoDTO;
import com.alex.registropeso.model.RegistroPeso;
import com.alex.registropeso.model.Usuario;
import com.alex.registropeso.repository.RegistroPesoRepository;
import com.alex.registropeso.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProgresoServiceTest {

    @Mock
    private RegistroPesoRepository registroPesoRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private ProgresoService progresoService;

    private Usuario usuario;

    @BeforeEach
    void setUp() {
        usuario = new Usuario("alex", "encodedPassword");
        usuario.setId(1L);
        usuario.setPesoObjetivo(new BigDecimal("70.0"));
    }

    @Test
    void testProgresoCalculoPerdidaPeso() {
        when(usuarioRepository.findByUsername("alex")).thenReturn(Optional.of(usuario));

        RegistroPeso primerRegistro = new RegistroPeso(LocalDate.now().minusDays(10), new BigDecimal("80.0"), "Inicio", usuario);
        RegistroPeso ultimoRegistro = new RegistroPeso(LocalDate.now(), new BigDecimal("75.0"), "Actual", usuario);

        when(registroPesoRepository.findFirstByUsuarioIdOrderByFechaAsc(1L)).thenReturn(Optional.of(primerRegistro));
        when(registroPesoRepository.findFirstByUsuarioIdOrderByFechaDescIdDesc(1L)).thenReturn(Optional.of(ultimoRegistro));

        ProgresoDTO progreso = progresoService.obtenerProgreso("alex");

        assertNotNull(progreso);
        assertEquals(new BigDecimal("80.0"), progreso.getPesoInicial());
        assertEquals(new BigDecimal("75.0"), progreso.getPesoActual());
        assertEquals(new BigDecimal("50.00"), progreso.getProgreso());
    }

    @Test
    void testProgresoSinRegistros() {
        when(usuarioRepository.findByUsername("alex")).thenReturn(Optional.of(usuario));
        when(registroPesoRepository.findFirstByUsuarioIdOrderByFechaAsc(1L)).thenReturn(Optional.empty());
        when(registroPesoRepository.findFirstByUsuarioIdOrderByFechaDescIdDesc(1L)).thenReturn(Optional.empty());

        ProgresoDTO progreso = progresoService.obtenerProgreso("alex");

        assertNotNull(progreso);
        assertEquals(BigDecimal.ZERO, progreso.getProgreso());
        assertNull(progreso.getPesoInicial());
        assertNull(progreso.getPesoActual());
    }
}
