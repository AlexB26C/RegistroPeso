package com.alex.registropeso.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class ObjetivoRequest {

    @NotNull(message = "El peso objetivo es obligatorio")
    @DecimalMin(value = "20.0", message = "El peso objetivo debe ser mayor o igual a 20")
    @DecimalMax(value = "400.0", message = "El peso objetivo debe ser menor o igual a 400")
    private BigDecimal pesoObjetivo;

    public BigDecimal getPesoObjetivo() {
        return pesoObjetivo;
    }

    public void setPesoObjetivo(BigDecimal pesoObjetivo) {
        this.pesoObjetivo = pesoObjetivo;
    }
}