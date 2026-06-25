package com.mindline.backend.controller;

import com.mindline.backend.model.Usuario;
import com.mindline.backend.repository.UsuarioRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*") 
public class UsuarioController {

    @Autowired
    private UsuarioRepository repository;

    @PostMapping("/cadastrar")
    public Usuario cadastrar(@RequestBody Usuario usuario) {
        return repository.save(usuario);
    }

    @PostMapping("/login")
    public ResponseEntity<Usuario> login(@RequestBody Usuario usuario) {
        Optional<Usuario> userNoBanco = repository.findByEmailAndSenha(usuario.getEmail(), usuario.getSenha());
        
        if (userNoBanco.isPresent()) {
            return ResponseEntity.ok(userNoBanco.get());
        } else {
            return ResponseEntity.status(401).build(); 
        }
    }
}
