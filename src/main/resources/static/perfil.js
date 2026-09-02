// ============================================================
// PERFIL.JS
// ============================================================


// ============================================================
// CARGAR DATOS DEL USUARIO Y PESO OBJETIVO
// ============================================================

async function cargarUsuarioPerfil() {

    try {

        // Primero intentamos recuperar el objetivo del navegador
        const localObj = localStorage.getItem('pesoObjetivo');

        if (localObj) {
            pesoObjetivoActual = Number(localObj);
        }

        // Obtener usuario actual desde el servidor
        const respuesta = await fetch('/api/auth/me');

        if (!respuesta.ok) {

            console.error(
                'No se pudo cargar el usuario:',
                respuesta.status
            );

            return;
        }

        const usuario = await respuesta.json();

        const inputAltura = document.getElementById('inputAltura');

        if (usuario.alturaCm !== null && usuario.alturaCm !== undefined && usuario.alturaCm !== '') {
            if (inputAltura) {
                inputAltura.value = usuario.alturaCm;
            }
        }



        // --------------------------------------------------------
        // Nombre de usuario
        // --------------------------------------------------------

        const nombreEl =
            document.getElementById('nombreUsuarioPerfil');

        if (nombreEl) {
            nombreEl.textContent = usuario.username;
        }


        // --------------------------------------------------------
        // Peso objetivo
        // --------------------------------------------------------

        const objetivoGuardado =
            usuario.pesoObjetivo ??
            usuario.peso_objetivo ??
            localObj;


        if (
            objetivoGuardado !== null &&
            objetivoGuardado !== undefined &&
            objetivoGuardado !== ''
        ) {

            pesoObjetivoActual =
                Number(objetivoGuardado);


            // Guardar también en localStorage
            localStorage.setItem(
                'pesoObjetivo',
                pesoObjetivoActual
            );


            // ----------------------------------------------------
            // Input del objetivo
            // ----------------------------------------------------

            const inputObj =
                document.getElementById('inputObjetivo');

            if (inputObj) {
                inputObj.value = pesoObjetivoActual;
            }


            // ----------------------------------------------------
            // Texto del objetivo en el perfil
            // ----------------------------------------------------

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


    } catch (error) {

        console.error(
            'Error al cargar perfil:',
            error
        );
    }
}


// ============================================================
// BOTÓN GUARDAR OBJETIVO
// ============================================================

const btnGuardarObj =
    document.getElementById('btnGuardarObjetivo');


if (btnGuardarObj) {

    btnGuardarObj.addEventListener(
        'click',
        async () => {

            // ----------------------------------------------------
            // Obtener input
            // ----------------------------------------------------

            const inputObjetivo =
                document.getElementById('inputObjetivo');


            const nuevoObjetivo =
                inputObjetivo
                    ? Number(inputObjetivo.value)
                    : null;

            // ----------------------------------------------------
            // Validación
            // ----------------------------------------------------

            if (
                nuevoObjetivo === null ||
                !Number.isFinite(nuevoObjetivo) ||
                nuevoObjetivo <= 0
            ) {

                alert(
                    'Por favor, introduce un peso objetivo válido.'
                );

                return;
            }


            if (nuevoObjetivo > 400) {

                alert(
                    'El peso objetivo debe ser menor o igual a 400 kg.'
                );

                return;
            }


            try {

                // ------------------------------------------------
                // Obtener token CSRF
                // ------------------------------------------------



                const token =
                    await obtenerTokenCSRF();


                // ------------------------------------------------
                // Enviar nuevo objetivo al servidor
                // ------------------------------------------------



                const respuesta =
                    await fetch(
                        '/api/auth/objetivo',
                        {
                            method: 'PUT',

                            headers: {
                                'Content-Type':
                                    'application/json',

                                'X-XSRF-TOKEN':
                                token
                            },

                            body: JSON.stringify({
                                pesoObjetivo:
                                nuevoObjetivo
                            })
                        }
                    );




                if (!respuesta.ok) {

                    const errorTexto =
                        await respuesta.text();

                    console.error(
                        'Respuesta del servidor:',
                        errorTexto
                    );


                    throw new Error(
                        `Error HTTP: ${respuesta.status}`
                    );
                }


                // ------------------------------------------------
                // El servidor ha aceptado el cambio
                // ------------------------------------------------

                pesoObjetivoActual =
                    nuevoObjetivo;


                localStorage.setItem(
                    'pesoObjetivo',
                    pesoObjetivoActual
                );


                // ------------------------------------------------
                // Actualizar input
                // ------------------------------------------------

                if (inputObjetivo) {

                    inputObjetivo.value =
                        pesoObjetivoActual;
                }


                // ------------------------------------------------
                // Actualizar texto del perfil
                // ------------------------------------------------

                const perfilPesoObjetivo =
                    document.getElementById(
                        'perfilPesoObjetivo'
                    );


                if (perfilPesoObjetivo) {

                    perfilPesoObjetivo.textContent =
                        `${pesoObjetivoActual.toFixed(1)} kg`;
                }


                // ------------------------------------------------
                // Actualizar barra de progreso
                // ------------------------------------------------

                if (
                    typeof cargarProgreso ===
                    'function'
                ) {

                    await cargarProgreso();
                }

                alert(
                    'Peso objetivo guardado correctamente.'
                );


            } catch (error) {

                console.error(
                    '💥 Error al guardar el objetivo:',
                    error
                );


                alert(
                    'Error al guardar el peso objetivo.'
                );
            }
        }
    );

} else {

    console.error(
        '❌ No se encontró el botón #btnGuardarObjetivo'
    );
}

const btnGuardarAltura = document.getElementById('btnGuardarAltura');

if (btnGuardarAltura) {
    btnGuardarAltura.addEventListener(
        'click',
        async () => {
            const inputAltura = document.getElementById('inputAltura');

            const nuevaAltura = inputAltura ? Number(inputAltura.value) : null;

            if (nuevaAltura === null || !Number.isFinite(nuevaAltura) || nuevaAltura < 50 || nuevaAltura > 250) {
                alert('Introduce una altura válida entre 50 y 250 cm');
                return;
            }

            try {
                const token = await obtenerTokenCSRF();

                const respuesta = await fetch('/api/auth/altura',
                    {
                        method: 'PUT',
                        headers: {
                            'Content-Type' : 'application/json',
                            'X-XSRF-TOKEN': token
                        },
                        body: JSON.stringify({
                            alturaCm: nuevaAltura
                        })
                    }
                );

                if (!respuesta.ok) {
                    const errorTexto = await respuesta.text();

                    console.error('Respuesta del servidor:', errorTexto);
                    throw new Error(`Error HTTP: ${respuesta.status}`);
                }

                alturaActual = nuevaAltura;

                if(typeof actualizarGraficaIMC === 'function') {
                    await actualizarGraficaIMC();
                }

                alert('Altura guardada correctamente')
            } catch (error) {
                console.error('Error al guardar la altura:', error);
                alert('Error al guardar la altura');
            }
        }
    )
}


// ============================================================
// INICIALIZACIÓN DEL PERFIL
// ============================================================

async function iniciarPerfil() {

    console.log(
        "🚀 Iniciando perfil..."
    );

    await cargarUsuarioPerfil();

}


// Ejecutar perfil
iniciarPerfil();