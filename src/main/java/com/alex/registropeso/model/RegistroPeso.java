package com.alex.registropeso.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name= "registros_peso")
public class RegistroPeso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull

    @PastOrPresent(message = "La fecha no puede ser futura")
    @Column(nullable = false)
    private LocalDate fecha;

    @NotNull
    @DecimalMin(value = "20.0", message = "El peso debe ser como mínimo 20 kg")
    @DecimalMax(value = "400.0", message = "El peso debe ser como máximo 400 kg")
    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal pesoKg;

    @Size(max = 500, message = "La nota no puede superar los 500 caracteres")
    @Column(length = 500)
    private String nota;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    @JsonIgnoreProperties({"registros", "password"})
    private Usuario usuario;

    public RegistroPeso(){

    }

    public RegistroPeso(LocalDate fecha, BigDecimal pesoKg, String nota, Usuario usuario) {
        this.fecha = fecha;
        this.pesoKg = pesoKg;
        this.nota = nota;
        this.usuario = usuario;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getFecha() {
        return fecha;
    }

    public void setFecha(LocalDate fecha) {
        this.fecha = fecha;
    }

    public BigDecimal getPesoKg() {
        return pesoKg;
    }

    public void setPesoKg(BigDecimal pesoKg) {
        this.pesoKg = pesoKg;
    }

    public String getNota() {
        return nota;
    }

    public void setNota(String nota) {
        this.nota = nota;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }
}
