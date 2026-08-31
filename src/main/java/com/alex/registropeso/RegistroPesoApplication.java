package com.alex.registropeso;

import com.alex.registropeso.model.Usuario;
import com.alex.registropeso.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class RegistroPesoApplication {
    public static void main(String[] args) {
        SpringApplication.run(RegistroPesoApplication.class, args);
    }

    @Bean
    public CommandLineRunner initData(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (!usuarioRepository.existsByUsername("alex")) {
                // Encriptamos la contraseña "1234" antes de guardar
                String passwordEncriptada = passwordEncoder.encode("1234");
                Usuario usuarioInicial = new Usuario("alex", passwordEncriptada);
                usuarioRepository.save(usuarioInicial);
                System.out.println("✅ Usuario de prueba creado: alex / 1234");
            }
        };
    }
}
