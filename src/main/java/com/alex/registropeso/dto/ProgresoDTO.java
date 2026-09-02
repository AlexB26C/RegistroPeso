package com.alex.registropeso.dto;

import java.math.BigDecimal;

public class ProgresoDTO {
    private BigDecimal pesoInicial;
    private BigDecimal pesoActual;
    private BigDecimal pesoObjetivo;
    private BigDecimal progreso;

    public ProgresoDTO(BigDecimal pesoInicial, BigDecimal pesoActual, BigDecimal pesoObjetivo, BigDecimal progreso) {
        this.pesoInicial = pesoInicial;
        this.pesoActual = pesoActual;
        this.pesoObjetivo = pesoObjetivo;
        this.progreso = progreso;
    }

    public BigDecimal getPesoInicial() {
        return pesoInicial;
    }

    public void setPesoInicial(BigDecimal pesoInicial) {
        this.pesoInicial = pesoInicial;
    }

    public BigDecimal getPesoActual() {
        return pesoActual;
    }

    public void setPesoActual(BigDecimal pesoActual) {
        this.pesoActual = pesoActual;
    }

    public BigDecimal getPesoObjetivo() {
        return pesoObjetivo;
    }

    public void setPesoObjetivo(BigDecimal pesoObjetivo) {
        this.pesoObjetivo = pesoObjetivo;
    }

    public BigDecimal getProgreso() {
        return progreso;
    }

    public void setProgreso(BigDecimal progreso) {
        this.progreso = progreso;
    }
}
