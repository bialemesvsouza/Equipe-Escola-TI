package com.mindline.backend.controller;

import com.mindline.backend.model.Materia;
import com.mindline.backend.model.Usuario;
import com.mindline.backend.repository.MateriaRepository;
import com.mindline.backend.repository.UsuarioRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/materias")
@CrossOrigin(origins = "*")
public class MateriaController {

    @Autowired
    private MateriaRepository materiaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<Materia>> listarPorUsuario(@PathVariable Long usuarioId) {
        Optional<Usuario> usuario = usuarioRepository.findById(usuarioId);

        if (usuario.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        List<Materia> materias = materiaRepository.findByUsuarioIdOrderByIdAsc(usuarioId);

        return ResponseEntity.ok(materias);
    }

    @PostMapping("/usuario/{usuarioId}")
    public ResponseEntity<Materia> cadastrar(@PathVariable Long usuarioId, @RequestBody Materia materia) {
        Optional<Usuario> usuario = usuarioRepository.findById(usuarioId);

        if (usuario.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        materia.setUsuario(usuario.get());
        normalizarMateria(materia);

        return ResponseEntity.ok(materiaRepository.save(materia));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Materia> atualizar(@PathVariable Long id, @RequestBody Materia dados) {
        Optional<Materia> materiaBanco = materiaRepository.findById(id);

        if (materiaBanco.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Materia materia = materiaBanco.get();
        materia.setNome(dados.getNome());
        materia.setCapitulo(dados.getCapitulo());
        materia.setCor(dados.getCor());
        materia.setMinutosEstudadosHoje(dados.getMinutosEstudadosHoje());
        materia.setMetaDiariaMinutos(dados.getMetaDiariaMinutos());
        materia.setStatus(dados.getStatus());
        normalizarMateria(materia);

        return ResponseEntity.ok(materiaRepository.save(materia));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        if (!materiaRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        materiaRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private void normalizarMateria(Materia materia) {
        if (materia.getMinutosEstudadosHoje() == null) {
            materia.setMinutosEstudadosHoje(0);
        }

        if (materia.getMetaDiariaMinutos() == null || materia.getMetaDiariaMinutos() <= 0) {
            materia.setMetaDiariaMinutos(60);
        }

        if (materia.getCor() == null || materia.getCor().isBlank()) {
            materia.setCor("#7C6FE0");
        }

        if (materia.getStatus() == null || materia.getStatus().isBlank()) {
            materia.setStatus("Pendente");
        }
    }
}
