let pesoObjetivoActual = null;

// --- CARGAR DATOS DEL USUARIO Y PESO OBJETIVO EN PERFIL ---
async function cargarUsuarioPerfil() {
    try {
        const localObj = localStorage.getItem('pesoObjetivo');

        if (localObj) {
            pesoObjetivoActual = Number(localObj);
        }

        const respuesta = await fetch('/api/auth/me');

        if (respuesta.ok) {
            const usuario = await respuesta.json();

            const objetivoGuardado =
                usuario.pesoObjetivo ??
                usuario.peso_objetivo ??
                localObj;

            const nombreEl = document.getElementById('nombreUsuarioPerfil');

            if (nombreEl) {
                nombreEl.textContent = usuario.username;
            }

            if (
                objetivoGuardado !== null &&
                objetivoGuardado !== undefined &&
                objetivoGuardado !== ''
            ) {
                pesoObjetivoActual = Number(objetivoGuardado);

                localStorage.setItem(
                    'pesoObjetivo',
                    pesoObjetivoActual
                );

                const inputObj =
                    document.getElementById('inputObjetivo');

                if (inputObj) {
                    inputObj.value = pesoObjetivoActual;
                }

                const perfilPesoObjetivo =
                    document.getElementById('perfilPesoObjetivo');

                if (perfilPesoObjetivo) {
                    perfilPesoObjetivo.textContent =
                        `${pesoObjetivoActual.toFixed(1)} kg`;
                }

            } else {
                const perfilPesoObjetivo =
                    document.getElementById('perfilPesoObjetivo');

                if (perfilPesoObjetivo) {
                    perfilPesoObjetivo.textContent = '-';
                }
            }
        }

    } catch (error) {
        console.error('Error al cargar perfil:', error);
    }
}


// --- GUARDAR PESO OBJETIVO ---
const btnGuardarObj =
    document.getElementById('btnGuardarObjetivo');

if (btnGuardarObj) {

    btnGuardarObj.addEventListener('click', async () => {

        const inputObjetivo =
            document.getElementById('inputObjetivo');

        const nuevoObjetivo =
            inputObjetivo ? inputObjetivo.value : null;

        // Validación básica
        if (!nuevoObjetivo || Number(nuevoObjetivo) <= 0) {

            alert(
                'Por favor, introduce un peso objetivo válido.'
            );

            return;
        }

        // Límite máximo
        if (Number(nuevoObjetivo) > 400) {

            alert(
                'El peso objetivo debe ser menor o igual a 400 kg.'
            );

            return;
        }

        try {

            // Obtener CSRF
            const respuestaCsrf =
                await fetch('/api/auth/csrf');

            if (!respuestaCsrf.ok) {
                throw new Error(
                    'No se pudo obtener el token CSRF'
                );
            }

            const csrf =
                await respuestaCsrf.json();

            // Guardar en servidor
            const respuesta =
                await fetch('/api/auth/objetivo', {
                    method: 'PUT',

                    headers: {
                        'Content-Type': 'application/json',
                        [csrf.headerName]: csrf.token
                    },

                    body: JSON.stringify({
                        pesoObjetivo: Number(nuevoObjetivo)
                    })
                });

            if (!respuesta.ok) {

                throw new Error(
                    `Error HTTP: ${respuesta.status}`
                );
            }

            // Solo actualizamos localStorage
            // si el servidor ha aceptado el cambio
            pesoObjetivoActual =
                Number(nuevoObjetivo);

            localStorage.setItem(
                'pesoObjetivo',
                pesoObjetivoActual
            );

            const perfilPesoObjetivo =
                document.getElementById(
                    'perfilPesoObjetivo'
                );

            if (perfilPesoObjetivo) {

                perfilPesoObjetivo.textContent =
                    `${pesoObjetivoActual.toFixed(1)} kg`;
            }

            alert(
                'Peso objetivo guardado correctamente'
            );

        } catch (error) {

            console.error(
                'Error al guardar el objetivo:',
                error
            );

            alert(
                'Error al guardar el peso objetivo'
            );
        }
    });
}


// --- INICIALIZACIÓN ---
async function iniciarPerfil() {

    await cargarUsuarioPerfil();
}

iniciarPerfil();