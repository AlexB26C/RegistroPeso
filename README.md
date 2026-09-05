# MetriApp - Registro de Peso y Progreso Fitness 🏋️‍♂️📊

Aplicación web / PWA para el seguimiento de peso corporal, cálculo de IMC en tiempo real, registro de notas diarias y visualización gráfica del progreso hacia un peso objetivo.

## 🚀 Tecnologías

- **Backend:** Java 17, Spring Boot 3, Spring Data JPA, Spring Security (BCrypt, CSRF con cookies).
- **Base de Datos:** PostgreSQL.
- **Frontend:** HTML5, CSS3 moderno (diseño responsivo con navegación por tabs / gestos swipe), JavaScript (ES6+), Chart.js.
- **Contenedores:** Docker (multi-stage build).

---

## ⚙️ Variables de Entorno

Para ejecutar la aplicación es necesario configurar las siguientes variables de entorno:

| Variable | Descripción | Ejemplo |
| :--- | :--- | :--- |
| `DB_URL` | URL JDBC de conexión a PostgreSQL | `jdbc:postgresql://localhost:5432/registropeso` |
| `DB_USERNAME` | Usuario de PostgreSQL | `postgres` |
| `DB_PASSWORD` | Contraseña de PostgreSQL | `tu_contraseña` |
| `PORT` *(Opcional)* | Puerto del servidor (por defecto 8080) | `8080` |

---

## 💻 Ejecución en Local

### Con Maven instalado:
```bash
# Empaquetar la aplicación
mvn clean package -DskipTests

# Ejecutar el jar generado
java -jar target/registro-peso-0.0.1-SNAPSHOT.jar
```

---

## 🐳 Despliegue con Docker

El proyecto incluye un `Dockerfile` optimizado en dos fases (multi-stage build):

```bash
# 1. Construir la imagen
docker build -t metriapp .

# 2. Ejecutar el contenedor pasando variables de entorno
docker run -d -p 8080:8080 \
  -e DB_URL="jdbc:postgresql://host.docker.internal:5432/registropeso" \
  -e DB_USERNAME="postgres" \
  -e DB_PASSWORD="secretpassword" \
  --name metriapp-container metriapp
```

---

## 🛡️ Seguridad

- Autenticación mediante sesiones y Spring Security.
- Contraseñas cifradas con algoritmo **BCrypt**.
- Protección contra ataques **CSRF** activada en todas las peticiones que mutan estado (`POST`, `PUT`, `DELETE`).
- Aislamiento de datos: cada usuario solo tiene acceso a sus propios registros y metas.
