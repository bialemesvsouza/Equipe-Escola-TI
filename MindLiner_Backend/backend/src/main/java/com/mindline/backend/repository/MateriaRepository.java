package com.mindline.backend.repository;

import com.mindline.backend.model.Materia;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MateriaRepository extends JpaRepository<Materia, Long> {

    List<Materia> findByUsuarioIdOrderByIdAsc(Long usuarioId);
}
