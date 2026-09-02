package com.alex.registropeso.controller;

import com.alex.registropeso.dto.ProgresoDTO;
import com.alex.registropeso.model.Usuario;
import com.alex.registropeso.service.ProgresoService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/progreso")
public class ProgresoController {

    private final ProgresoService progresoService;

    public ProgresoController(ProgresoService progresoService) {
        this.progresoService = progresoService;
    }

    @GetMapping
    public ProgresoDTO obtenerProgreso(Authentication authentication) {
        String username = authentication.getName();

        return progresoService.obtenerProgreso(username);
    }
}
