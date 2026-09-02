const formulario = document.getElementById('formulario');
const fecha = document.getElementById('fecha');
const pesoKg = document.getElementById('pesoKg');
const nota = document.getElementById('nota');
const listaRegistros = document.getElementById('listaRegistros');
const mensaje = document.getElementById('mensaje');
const progressBar = document.getElementById('file-progress');
const progressText = document.getElementById('.progress-text')

let graficaPeso;
let pesoObjetivoActual = null;
let idEdicion = null;

// 🟢 ASIGNAR FECHA DE HOY POR DEFECTO
function ponerFechaHoy() {
    if (fecha) {
        fecha.value = new Date().toISOString().slice(0, 10);
    }
}

// Ejecutamos inmediatamente al cargar el script
ponerFechaHoy();

// --- DIBUJAR GRÁFICA CON LÍNEA ROJA OBJETIVO ---
function mostrarGrafica(registros) {
    const canvas = document.getElementById('graficaPeso');

    if (!canvas) return;

    if (graficaPeso) {
        graficaPeso.destroy();
    }

    if (!registros || registros.length === 0) {
        return;
    }

    // 🟢 ORDEN CRONOLÓGICO: Del día más antiguo/pronto al más nuevo (de izquierda a derecha)
    const datosCronologicos = [...registros].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

    const labels = datosCronologicos.map(registro => registro.fecha);
    const pesos = datosCronologicos.map(registro => Number(registro.pesoKg));

    const datasets = [{
        label: 'Peso (kg)',
        data: pesos,
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.25)',
        borderWidth: 3,
        pointRadius: 4,
        pointBackgroundColor: '#2563eb',
        fill: true,
        tension: 0.25
    }];

    const objetivo = Number(pesoObjetivoActual);
    const tieneObjetivoValido = !isNaN(objetivo) && objetivo > 0;

    if (tieneObjetivoValido) {
        datasets.push({
            label: 'Objetivo (kg)',
            data: Array(labels.length).fill(objetivo),
            borderColor: '#ef4444',
            borderDash: [6, 6],
            borderWidth: 2,
            pointRadius: labels.length === 1 ? 5 : 0,
            pointBackgroundColor: '#ef4444',
            fill: false
        });
    }

    let minPesos = Math.min(...pesos);
    let maxPesos = Math.max(...pesos);

    let configScalesY = {
        title: { display: true, text: 'Peso (kg)', color: '#ffffff' },
        ticks: { color: '#ffffff' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
    };

    if (isFinite(minPesos) && isFinite(maxPesos)) {
        let minY = tieneObjetivoValido ? Math.min(minPesos, objetivo) - 2 : minPesos - 2;
        let maxY = tieneObjetivoValido ? Math.max(maxPesos, objetivo) + 2 : maxPesos + 2;

        configScalesY.min = Math.floor(minY);
        configScalesY.max = Math.ceil(maxY);
    }

    graficaPeso = new Chart(canvas, {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: '#ffffff' }
                }
            },
            scales: {
                x: {
                    title: { display: true, text: 'Fecha', color: '#ffffff' },
                    ticks: { color: '#ffffff' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                y: configScalesY
            }
        }
    });
}

// --- CARGAR USUARIO Y RECUPERAR SU OBJETIVO ---
async function cargarUsuarioActual() {
    try {
        const localObj = localStorage.getItem('pesoObjetivo');
        if (localObj) {
            pesoObjetivoActual = Number(localObj);
        }

        const respuesta = await fetch('/api/auth/me');
        if (respuesta.ok) {
            const usuario = await respuesta.json();

            const nombreEl = document.getElementById('nombreUsuario');
            if (nombreEl) nombreEl.textContent = usuario.username;

            const valorObjetivo = usuario.pesoObjetivo ?? usuario.peso_objetivo;
            if (valorObjetivo !== null && valorObjetivo !== undefined && valorObjetivo !== '') {
                pesoObjetivoActual = Number(valorObjetivo);
                localStorage.setItem('pesoObjetivo', pesoObjetivoActual);
            }
        }
    } catch (error) {
        console.error('Error al cargar datos del usuario actual:', error);
    }
}

async function obtenerTokenCSRF() {
    const respuesta = await fetch('/api/auth/csrf');

    if (!respuesta.ok) {
        throw new Error('No se puedo obtener el token CSRF');
    }

    const  datos = await respuesta.json();

    return datos.token;
}



// --- ACCIONES DE TABLA (ELIMINAR Y EDITAR) ---
async function eliminarRegistro(id) {
    if (!confirm('¿Seguro que quieres eliminar este registro de peso?')) {
        return;
    }

    try {
        const token = await obtenerTokenCSRF();

        const respuesta = await fetch(`/api/registros/${id}`, {
            method: 'DELETE',
            headers: {
                'X-XSRF-TOKEN': token
            }
        });
        if (respuesta.ok) {
            cargarRegistros();
            cargarProgreso();
        } else {
            console.error('Error al eliminar:', respuesta.status);
            alert('Error al eliminar el registro');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar el registro');
    }
}

function prepararEdicion(id, fechaVal, pesoVal, notaVal) {
    idEdicion = id;
    fecha.value = fechaVal;
    pesoKg.value = pesoVal;
    nota.value = notaVal;

    const btnGuardar = formulario.querySelector('button[type="submit"]');
    btnGuardar.textContent = 'Actualizar peso';
    btnGuardar.style.backgroundColor = '#eab308';
}

// --- CARGAR Y RENDERIZAR TABLA DE PESOS ---
async function cargarRegistros() {
    try {
        const respuesta = await fetch('/api/registros');
        const registros = await respuesta.json();

        if (listaRegistros) {
            listaRegistros.innerHTML = '';

            registros.forEach(registro => {
                const fila = document.createElement('tr');

                fila.innerHTML = `
                    <td>${registro.fecha}</td>
                    <td>${Number(registro.pesoKg).toFixed(1)}</td>
                    <td>${registro.nota || '-'}</td>
                    <td>
                        <button class="btn-accion btn-editar" onclick="prepararEdicion(${registro.id}, '${registro.fecha}', ${registro.pesoKg}, '${registro.nota || ''}')">✏️</button>
                        <button class="btn-accion btn-eliminar" onclick="eliminarRegistro(${registro.id})">🗑️</button>
                    </td>
                `;

                listaRegistros.appendChild(fila);
            });
        }

        if (pesoObjetivoActual === null) {
            await cargarUsuarioActual();
        }

        mostrarGrafica(registros);

    } catch (error) {
        console.error('Error al cargar registros:', error);
    }
}

// --- GUARDAR / EDITAR PESO DIARIO ---
if (formulario) {
    formulario.addEventListener('submit', async (e) => {
        e.preventDefault();

        const datosRegistro = {
            fecha: fecha.value,
            pesoKg: Number(pesoKg.value),
            nota: nota.value
        };

        const url = idEdicion ? `/api/registros/${idEdicion}` : '/api/registros';
        const metodo = idEdicion ? 'PUT' : 'POST';

        const  token = await obtenerTokenCSRF();

        const respuesta = await fetch(url, {
            method: metodo,
            headers: { "Content-Type": "application/json", "X-XSRF-TOKEN": token },
            body: JSON.stringify(datosRegistro)
        });

        if (!respuesta.ok) {
            mensaje.textContent = 'Error al procesar la solicitud';
            return;
        }

        idEdicion = null;
        const btnGuardar = formulario.querySelector('button[type="submit"]');
        btnGuardar.textContent = 'Guardar peso';
        btnGuardar.style.backgroundColor = '';

        mensaje.textContent = 'Registro guardado correctamente';
        pesoKg.value = '';
        nota.value = '';

        ponerFechaHoy();

        cargarRegistros();
        cargarProgreso();
    });
}

async function cargarProgreso() {
    try {
        const respuesta = await fetch('/api/progreso');

        if (!respuesta.ok) {
            console.error('No se pudo obtener el progreso');
            return;
        }

        const datos = await respuesta.json();

        const progreso = Number(datos.progreso) || 0;

        if(progressBar) {
            progressBar.value = progreso;
        }

        if (progressText) {
            progressText.textContent = `${Math.round(progreso)}%`
        }
    } catch (error) {
        console.error('Error al cargar el progreso:', error);
    }
}

// --- INICIALIZACIÓN ---
async function iniciarApp() {
    ponerFechaHoy();
    await cargarUsuarioActual();
    await cargarRegistros();
    await cargarProgreso()
}

iniciarApp();