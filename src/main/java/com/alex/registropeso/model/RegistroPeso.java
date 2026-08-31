package com.alex.registropeso.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import org.springframework.boot.autoconfigure.web.WebProperties;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name= "registros_peso")
public class RegistroPeso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull

    @Column(nullable = false)
    private LocalDate fecha;

    @NotNull
    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal pesoKg;

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
