package com.alex.registropeso.controller;

import com.alex.registropeso.dto.ProgresoDTO;
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

        System.out.println("############################");
        System.out.println("ENTRÉ EN PROGRESOCONTROLLER");
        System.out.println("USUARIO: " + authentication.getName());
        System.out.println("############################");

        String username = authentication.getName();

        System.out.println("ANTES DEL SERVICE");

        ProgresoDTO resultado = progresoService.obtenerProgreso(username);

        System.out.println("DESPUÉS DEL SERVICE");
        System.out.println("PESO INICIAL: " + resultado.getPesoInicial());
        System.out.println("PESO ACTUAL: " + resultado.getPesoActual());
        System.out.println("PESO OBJETIVO: " + resultado.getPesoObjetivo());
        System.out.println("PROGRESO: " + resultado.getProgreso());

        return resultado;
    }
}
