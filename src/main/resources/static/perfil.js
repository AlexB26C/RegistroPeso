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

            const objetivoGuardado = usuario.pesoObjetivo ?? usuario.peso_objetivo ?? localObj;

            const nombreEl = document.getElementById('nombreUsuarioPerfil');
            if (nombreEl) nombreEl.textContent = usuario.username;

            if (objetivoGuardado !== null && objetivoGuardado !== undefined && objetivoGuardado !== '') {
                pesoObjetivoActual = Number(objetivoGuardado);
                localStorage.setItem('pesoObjetivo', pesoObjetivoActual);

                const inputObj = document.getElementById('inputObjetivo');
                if (inputObj) inputObj.value = pesoObjetivoActual;

                const perfilPesoObjetivo = document.getElementById('perfilPesoObjetivo');
                if (perfilPesoObjetivo) perfilPesoObjetivo.textContent = `${pesoObjetivoActual.toFixed(1)} kg`;
            } else {
                const perfilPesoObjetivo = document.getElementById('perfilPesoObjetivo');
                if (perfilPesoObjetivo) perfilPesoObjetivo.textContent = '-';
            }
        }
    } catch (error) {
        console.error('Error al cargar perfil:', error);
    }
}

// --- CALCULAR ESTADÍSTICAS Y VARIACIÓN CORRECTAMENTE ---
async function cargarEstadisticasPerfil() {
    try {
        const respuesta = await fetch('/api/registros');
        if (!respuesta.ok) return;

        const registros = await respuesta.json();

        const pesoActualEl = document.getElementById('perfilPesoActual');
        const variacionEl = document.getElementById('perfilVariacion');
        const mediaEl = document.getElementById('perfilMedia');

        if (!registros || registros.length === 0) {
            if (pesoActualEl) pesoActualEl.textContent = '-';
            if (variacionEl) variacionEl.textContent = '-';
            if (mediaEl) mediaEl.textContent = '-';
            return;
        }

        // 🟢 1. Ordenamos los registros por fecha: del más antiguo al más reciente
        const registrosOrdenados = [...registros].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

        // 🟢 2. El peso más reciente es el último elemento del array
        const ultimoRegistro = registrosOrdenados[registrosOrdenados.length - 1];
        const actual = Number(ultimoRegistro.pesoKg);
        if (pesoActualEl) pesoActualEl.textContent = `${actual.toFixed(1)} kg`;

        // 🟢 3. Variación respecto al registro anterior
        if (registrosOrdenados.length > 1) {
            const penultimoRegistro = registrosOrdenados[registrosOrdenados.length - 2];
            const anterior = Number(penultimoRegistro.pesoKg);
            const dif = actual - anterior;
            const signo = dif > 0 ? '+' : '';
            if (variacionEl) variacionEl.textContent = `${signo}${dif.toFixed(1)} kg`;
        } else {
            if (variacionEl) variacionEl.textContent = '-';
        }

        // 🟢 4. Media de los últimos 7 registros registrados
        const ultimos7 = registrosOrdenados.slice(-7).map(r => Number(r.pesoKg));
        const media = ultimos7.reduce((total, peso) => total + peso, 0) / ultimos7.length;
        if (mediaEl) mediaEl.textContent = `${media.toFixed(1)} kg`;

    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
    }
}

// --- GUARDAR PESO OBJETIVO ---
const btnGuardarObj = document.getElementById('btnGuardarObjetivo');
if (btnGuardarObj) {
    btnGuardarObj.addEventListener('click', async () => {
        const inputObjetivo = document.getElementById('inputObjetivo');
        const nuevoObjetivo = inputObjetivo ? inputObjetivo.value : null;

        if (!nuevoObjetivo || nuevoObjetivo <= 0) {
            alert('Por favor, introduce un peso objetivo válido.');
            return;
        }

        localStorage.setItem('pesoObjetivo', nuevoObjetivo);
        pesoObjetivoActual = Number(nuevoObjetivo);

        const perfilPesoObjetivo = document.getElementById('perfilPesoObjetivo');
        if (perfilPesoObjetivo) {
            perfilPesoObjetivo.textContent = `${pesoObjetivoActual.toFixed(1)} kg`;
        }

        try {
            await fetch('/api/auth/objetivo', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pesoObjetivo: Number(nuevoObjetivo) })
            });
            alert('Peso objetivo guardado correctamente');
        } catch (error) {
            console.error('Error al guardar el objetivo:', error);
            alert('Peso objetivo guardado localmente en tu navegador');
        }
    });
}

// --- INICIALIZACIÓN ---
async function iniciarPerfil() {
    await cargarUsuarioPerfil();
    await cargarEstadisticasPerfil();
}

iniciarPerfil();