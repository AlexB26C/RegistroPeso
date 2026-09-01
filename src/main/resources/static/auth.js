document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const respuestaCsrf = await fetch('/api/auth/csrf');

            const csrf = await respuestaCsrf.json();

            const datosLogin = new URLSearchParams();

            datosLogin.append('username', loginForm.elements.username.value);
            datosLogin.append('password', loginForm.elements.password.value);
            datosLogin.append(csrf.parameterName, csrf.token);

            const respuestaLogin = await fetch('/login', {
                method: 'POST',
                body: datosLogin
            });

            window.location.href = '/index.html';

        });
    }

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
                const respuestaCsrf = await fetch('/api/auth/csrf');
                const csrf = await respuestaCsrf.json();

                const respuesta = await fetch('/api/auth/registro', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        [csrf.headerName]: csrf.token
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
                    const errorData = await respuesta.text();

                    mensaje.style.color = '#dc2626';
                    mensaje.textContent = errorData || 'Error en el registro.';
                }
            } catch (error) {
                mensaje.style.color = '#dc2626';
                mensaje.textContent = 'Error en el registro.';
                console.error('Error en el registro:', error);
            }
        });
    }

    const btnCerrarSesion = document.getElementById('btn-cerrar-sesion');

    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener('click', async (e) => {
            e.preventDefault();

            try {
                const respuestaCsrf = await fetch('api/auth/csrf');
                const csrf = await respuestaCsrf.json();

                const respuestaLogout = await fetch('/logout', {
                    method: 'POST',
                    headers: {
                        [csrf.headerName]: csrf.token
                    }
                });

                if (respuestaLogout.ok || respuestaLogout.redirected) {
                    window.location.href = '/login.html?logout';
                }

                if (!respuestaLogout.ok){
                    console.error('Error al cerrar sesión:', respuestaLogout.status);
                }

            } catch (error) {
                console.error('Error al cerrar sesión:', error);
            }
        })
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