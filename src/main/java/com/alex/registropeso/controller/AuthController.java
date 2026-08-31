package com.alex.registropeso.controller;

import com.alex.registropeso.dto.RegistroRequest;
import com.alex.registropeso.model.Usuario;
import com.alex.registropeso.repository.UsuarioRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import javax.swing.text.html.parser.Entity;
import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("api/auth")
public class AuthController {
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder){
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/registro")
    public ResponseEntity<String> registrar(@Valid @RequestBody RegistroRequest request){
        if (usuarioRepository.existsByUsername(request.getUsername())){
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("El nombre de usuario ya existe.");
        }

        String passwordEncriptada = passwordEncoder.encode(request.getPassword());
        Usuario nuevoUsuario = new Usuario(request.getUsername(), passwordEncriptada);
        usuarioRepository.save(nuevoUsuario);
        return ResponseEntity.status(HttpStatus.CREATED).body("Usuario registrado con éxito");
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, String>> obtenerUsuarioActual(Authentication authentication){
        if (authentication == null || !authentication.isAuthenticated()){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(Map.of("username", authentication.getName()));
    }

    @PutMapping("/objetivo")
    public ResponseEntity<?> actualizarObjetivo(@RequestBody Map<String, BigDecimal> payload,
                                                Authentication authentication){
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Usuario usuario = usuarioRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        BigDecimal nuevoObjetivo = payload.get("pesoObjetivo");
        usuario.setPesoObjetivo(nuevoObjetivo);
        usuarioRepository.save(usuario);

        return ResponseEntity.ok(usuario);
    }
}
