package com.alex.registropeso.controller;

import com.alex.registropeso.model.RegistroPeso;
import com.alex.registropeso.model.Usuario;
import com.alex.registropeso.repository.RegistroPesoRepository;
import com.alex.registropeso.repository.UsuarioRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/registros")
public class RegistroPesoController {
    private final RegistroPesoRepository registroPesoRepository;
    private final UsuarioRepository usuarioRepository;

    public RegistroPesoController(RegistroPesoRepository registroPesoRepository, UsuarioRepository usuarioRepository) {
        this.registroPesoRepository = registroPesoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @GetMapping
    public List<RegistroPeso> listar(Authentication authentication) {
        Usuario usuario = obtenerUsuarioAutenticado(authentication);
        return registroPesoRepository.findByUsuarioIdOrderByFechaDesc(usuario.getId());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RegistroPeso crear(@Valid @RequestBody RegistroPeso registro, Authentication authentication) {
        Usuario usuario = obtenerUsuarioAutenticado(authentication);

        registro.setId(null);
        registro.setUsuario(usuario);

        return registroPesoRepository.save(registro);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarRegistro(@PathVariable Long id, Authentication authentication){
        Optional<RegistroPeso> registroOpt = registroPesoRepository.findById(id);

        if (registroOpt.isEmpty()){
            return ResponseEntity.notFound().build();
        }

        RegistroPeso registro = registroOpt.get();

        if (!registro.getUsuario().getUsername().equals(authentication.getName())){
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("No tienes permisos para eliminar este registro");
        }

        registroPesoRepository.delete(registro);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actulizarRegistro(@PathVariable Long id,
                                               @RequestBody RegistroPeso datosActualizados,
                                               Authentication authentication) {
        Optional<RegistroPeso> registroOpt = registroPesoRepository.findById(id);

        if (registroOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        RegistroPeso registro = registroOpt.get();

        if (!registro.getUsuario().getUsername().equals(authentication.getName())){
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("No tienes permiso para editar este registro");
        }

        registro.setFecha(datosActualizados.getFecha());
        registro.setPesoKg(datosActualizados.getPesoKg());
        registro.setNota(datosActualizados.getNota());

        registroPesoRepository.save(registro);
        return ResponseEntity.ok().build();
    }

    private Usuario obtenerUsuarioAutenticado(Authentication authentication){
        String username = authentication.getName();
        return usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado en la base de datos"));
    }


}
