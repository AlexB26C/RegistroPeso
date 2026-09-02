package com.alex.registropeso.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class AlturaRequest {

    @NotNull
    @DecimalMin(value = "50.0")
    @DecimalMax(value = "250.0")
    private BigDecimal alturaCm;

    public BigDecimal getAlturaCm() {
        return alturaCm;
    }

    public void setAlturaCm(BigDecimal alturaCm) {
        this.alturaCm = alturaCm;
    }
}
