package com.mindline.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "materias")
public class Materia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;
    private String capitulo;
    private String cor;
    private Integer minutosEstudadosHoje;
    private Integer metaDiariaMinutos;
    private String status;

    @ManyToOne(optional = false)
    @JoinColumn(name = "usuario_id")
    @JsonIgnore
    private Usuario usuario;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getCapitulo() { return capitulo; }
    public void setCapitulo(String capitulo) { this.capitulo = capitulo; }

    public String getCor() { return cor; }
    public void setCor(String cor) { this.cor = cor; }

    public Integer getMinutosEstudadosHoje() { return minutosEstudadosHoje; }
    public void setMinutosEstudadosHoje(Integer minutosEstudadosHoje) { this.minutosEstudadosHoje = minutosEstudadosHoje; }

    public Integer getMetaDiariaMinutos() { return metaDiariaMinutos; }
    public void setMetaDiariaMinutos(Integer metaDiariaMinutos) { this.metaDiariaMinutos = metaDiariaMinutos; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }
}
