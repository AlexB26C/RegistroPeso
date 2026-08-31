document.addEventListener('DOMContentLoaded', () => {
    const registroForm = document.getElementById('registroForm');
    if (registroForm) {
        registroForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const mensaje = document.getElementById('mensaje');

            const datos = {
                username: document.getElementById('username').value,
                password: document.getElementById('password').value
            };

            try {
                const respuesta = await fetch('/api/auth/registro', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(datos)
                });

                if (respuesta.ok) {
                    mensaje.style.color = '#16a34a';
                    mensaje.textContent = 'Registro exitoso. Redirigiendo al inicio de sesión...';
                    setTimeout(() => {
                        window.location.href = '/login.html';
                    }, 1500);
                } else {
                    const errorData = await respuesta.json();
                    mensaje.style.color = '#dc2626';
                    mensaje.textContent = errorData.message || 'Error en el registro.';
                }
            } catch (error) {
                mensaje.style.color = '#dc2626';
                mensaje.textContent = 'Error en la comunicación con el servidor.';
            }
        });
    }

    const params = new URLSearchParams(window.location.search);
    const mensajeError = document.getElementById('mensajeError');
    const mensajeLogout = document.getElementById('mensajeLogout');

    if (params.has('error') && mensajeError) {
        mensajeError.style.display = 'block';
    }

    if (params.has('logout') && mensajeLogout) {
        mensajeLogout.style.display = 'block';
    }
});