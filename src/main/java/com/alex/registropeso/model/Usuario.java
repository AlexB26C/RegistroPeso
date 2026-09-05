package com.alex.registropeso.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "usuarios")
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(nullable = false)
    private String password;

    @Column(name = "altura_cm", precision = 5, scale = 2)
    private BigDecimal alturaCm;

    private BigDecimal pesoObjetivo;



    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<RegistroPeso> registros = new ArrayList<>();

    public Usuario() {
    }

    public Usuario(String username, String password) {
        this.username = username;
        this.password = password;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public List<RegistroPeso> getRegistros() {
        return registros;
    }

    public void setRegistros(List<RegistroPeso> registros) {
        this.registros = registros;
    }

    public BigDecimal getPesoObjetivo() {
        return pesoObjetivo;
    }

    public void setPesoObjetivo(BigDecimal pesoObjetivo) {
        this.pesoObjetivo = pesoObjetivo;
    }

    public BigDecimal getAlturaCm() {
        return alturaCm;
    }

    public void setAlturaCm(BigDecimal alturaCm) {
        this.alturaCm = alturaCm;
    }
}
