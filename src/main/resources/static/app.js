const formulario = document.getElementById('formulario');
const fecha = document.getElementById('fecha');
const pesoKg = document.getElementById('pesoKg');
const nota = document.getElementById('nota');
const listaRegistros = document.getElementById('listaRegistros');
const mensaje = document.getElementById('mensaje');
const progressBar = document.getElementById('file-progress');
const progressText = document.getElementById('progress-text')

let graficaPeso;
let graficaIMC = null;
let alturaActual = null;
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

// --- MEDIDOR SEMICIRCULAR DEL IMC ---
function mostrarGraficaIMC(registros) {

    const canvas = document.getElementById('graficaIMC');
    const valorEl = document.getElementById('imcValor');
    const estadoEl = document.getElementById('imcEstado');

    if (!canvas) return;

    if (
        !registros ||
        registros.length === 0 ||
        !alturaActual ||
        !isFinite(alturaActual) ||
        alturaActual <= 0
    ) {
        if (valorEl) valorEl.textContent = '-';
        if (estadoEl) estadoEl.textContent = 'Sin datos';
        return;
    }

    const ordenados = [...registros].sort(
        (a, b) => new Date(a.fecha) - new Date(b.fecha)
    );

    const ultimoRegistro = ordenados[ordenados.length - 1];

    const peso = Number(ultimoRegistro.pesoKg);
    const alturaMetros = Number(alturaActual) / 100;

    if (
        !isFinite(peso) ||
        !isFinite(alturaMetros) ||
        alturaMetros <= 0
    ) {
        return;
    }

    const imc = peso / (alturaMetros * alturaMetros);
    const imcRedondeado = Number(imc.toFixed(1));

    let estado;

    if (imc < 18.5) {
        estado = 'Bajo peso';
    } else if (imc < 25) {
        estado = 'Peso normal';
    } else if (imc < 30) {
        estado = 'Sobrepeso';
    } else {
        estado = 'Obesidad';
    }

    if (valorEl) {
        valorEl.textContent = imcRedondeado.toFixed(1);
    }

    if (estadoEl) {
        estadoEl.textContent = estado;
    }

    const ctx = canvas.getContext('2d');

    const rect = canvas.getBoundingClientRect();

    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    const centroX = width / 2;
    const centroY = height * 0.88;

    const radio = Math.min(
        width * 0.40,
        height * 0.75
    );

    const grosor = 28;

    const inicio = Math.PI;
    const fin = Math.PI * 2;

    // Rango visual del medidor
    const minimo = 15;
    const maximo = 35;

    function posicionIMC(valor) {

        const limitado = Math.max(
            minimo,
            Math.min(valor, maximo)
        );

        const porcentaje =
            (limitado - minimo) /
            (maximo - minimo);

        return inicio + porcentaje * Math.PI;
    }


    // ================================================
    // 🔴 ROJO: < 17
    // ================================================

    ctx.beginPath();

    ctx.arc(
        centroX,
        centroY,
        radio,
        posicionIMC(15),
        posicionIMC(17)
    );

    ctx.lineWidth = grosor;
    ctx.strokeStyle = '#ef4444';
    ctx.lineCap = 'butt';
    ctx.stroke();


    // ================================================
    // 🟡 AMARILLO: 17 - 18.5
    // ================================================

    ctx.beginPath();

    ctx.arc(
        centroX,
        centroY,
        radio,
        posicionIMC(17),
        posicionIMC(18.5)
    );

    ctx.lineWidth = grosor;
    ctx.strokeStyle = '#eab308';
    ctx.stroke();


    // ================================================
    // 🟢 VERDE: 18.5 - 25
    // ================================================

    ctx.beginPath();

    ctx.arc(
        centroX,
        centroY,
        radio,
        posicionIMC(18.5),
        posicionIMC(25)
    );

    ctx.lineWidth = grosor;
    ctx.strokeStyle = '#22c55e';
    ctx.stroke();


    // ================================================
    // 🟡 AMARILLO: 25 - 30
    // ================================================

    ctx.beginPath();

    ctx.arc(
        centroX,
        centroY,
        radio,
        posicionIMC(25),
        posicionIMC(30)
    );

    ctx.lineWidth = grosor;
    ctx.strokeStyle = '#eab308';
    ctx.stroke();


    // ================================================
    // 🔴 ROJO: 30 - 35
    // ================================================

    ctx.beginPath();

    ctx.arc(
        centroX,
        centroY,
        radio,
        posicionIMC(30),
        posicionIMC(35)
    );

    ctx.lineWidth = grosor;
    ctx.strokeStyle = '#ef4444';
    ctx.stroke();


    // ================================================
    // AGUJA
    // ================================================

    const angulo = posicionIMC(imc);

    const agujaLongitud = radio - 8;

    const agujaX =
        centroX +
        Math.cos(angulo) * agujaLongitud;

    const agujaY =
        centroY +
        Math.sin(angulo) * agujaLongitud;


    ctx.beginPath();

    ctx.moveTo(
        centroX,
        centroY
    );

    ctx.lineTo(
        agujaX,
        agujaY
    );

    ctx.lineWidth = 5;
    ctx.strokeStyle = '#ffffff';
    ctx.lineCap = 'round';
    ctx.stroke();


    // ================================================
    // CENTRO DE LA AGUJA
    // ================================================

    ctx.beginPath();

    ctx.arc(
        centroX,
        centroY,
        9,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = '#ffffff';
    ctx.fill();


    // ================================================
    // VALORES EXTREMOS
    // ================================================

    ctx.font = '12px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';

    ctx.fillText(
        '15',
        centroX - radio,
        centroY + 25
    );

    ctx.fillText(
        '35',
        centroX + radio,
        centroY + 25
    );
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

            const valorAltura = usuario.alturaCm ?? usuario.altura_cm;
            if (valorAltura !== null && valorAltura !== undefined && valorAltura !== '') {
                alturaActual = Number(valorAltura);
                const perfilAltura = document.getElementById('perfilAltura');
                if (perfilAltura) {
                    perfilAltura.textContent = `${alturaActual} cm`;
                }
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
            await cargarRegistros();
            await cargarProgreso();
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

    const btnGuardar = formulario.querySelector('button[type=\"submit\"]');
    btnGuardar.textContent = 'Actualizar peso';
    btnGuardar.style.backgroundColor = '#eab308';
}

// --- CARGAR Y RENDERIZAR TABLA DE PESOS ---
async function cargarRegistros() {
    try {
        const respuesta = await fetch('/api/registros');

        if (!respuesta.ok) {
            console.error('No se pudieron cargar los registros');
            return;
        }

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
                        <button class=\"btn-accion btn-editar\" onclick=\"prepararEdicion(${registro.id}, '${registro.fecha}', ${registro.pesoKg}, '${registro.nota || ''}')\">✏️</button>
                        <button class=\"btn-accion btn-eliminar\" onclick=\"eliminarRegistro(${registro.id})\">🗑️</button>
                    </td>
                `;

                listaRegistros.appendChild(fila);
            });
        }

        if (pesoObjetivoActual === null) {
            await cargarUsuarioActual();
        }

        mostrarGrafica(registros);
        mostrarGraficaIMC(registros);
        actualizarResumenDashboard(registros);

    } catch (error) {
        console.error('Error al cargar registros:', error);
    }
}

async function actualizarGraficaIMC() {
    try {
        const respuesta = await fetch('/api/registros');

        if (!respuesta.ok) {
            console.error('No se pudieron cargar los registros para actualizar el IMC');
            return;
        }

        const registros =
            await respuesta.json();

        mostrarGraficaIMC(registros);

    } catch (error) {
        console.error('Error al actualizar la gráfica de IMC');
    }
}

// --- RESUMEN DEL DASHBOARD (peso actual, variación, media 7 días, objetivo) ---
function actualizarResumenDashboard(registros) {
    const pesoActualEl = document.getElementById('perfilPesoActual');
    const variacionEl = document.getElementById('perfilVariacion');
    const mediaEl = document.getElementById('perfilMedia');
    const objetivoEl = document.getElementById('perfilPesoObjetivo');
    const alturaEl = document.getElementById('perfilAltura');

    if (alturaEl) {
        alturaEl.textContent = (alturaActual && isFinite(alturaActual) && alturaActual > 0) ? `${alturaActual} cm` : '-';
    }

    if (!registros || registros.length === 0) {
        if (pesoActualEl) pesoActualEl.textContent = '-';
        if (variacionEl) variacionEl.textContent = '-';
        if (mediaEl) mediaEl.textContent = '-';
    } else {
        const ordenados = [...registros].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
        const ultimo = ordenados[ordenados.length - 1];
        const actual = Number(ultimo.pesoKg);

        if (pesoActualEl) {
            pesoActualEl.textContent = `${actual.toFixed(1)} kg`;
        }

        if (ordenados.length > 1) {
            const penultimo = ordenados[ordenados.length - 2];
            const dif = actual - Number(penultimo.pesoKg);
            const signo = dif > 0 ? '+' : '';
            if (variacionEl) variacionEl.textContent = `${signo}${dif.toFixed(1)} kg`;
        } else if (variacionEl) {
            variacionEl.textContent = '-';
        }

        const ultimos7 = ordenados.slice(-7).map(r => Number(r.pesoKg));
        const media = ultimos7.reduce((total, peso) => total + peso, 0) / ultimos7.length;
        if (mediaEl) mediaEl.textContent = `${media.toFixed(1)} kg`;
    }

    if (objetivoEl) {
        const objetivo = Number(pesoObjetivoActual);
        objetivoEl.textContent = (!isNaN(objetivo) && objetivo > 0) ? `${objetivo.toFixed(1)} kg` : '-';
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
            headers: { \"Content-Type\": \"application/json\", \"X-XSRF-TOKEN\": token },
            body: JSON.stringify(datosRegistro)
        });

        if (!respuesta.ok) {
            mensaje.textContent = 'Error al procesar la solicitud';
            return;
        }

        idEdicion = null;
        const btnGuardar = formulario.querySelector('button[type=\"submit\"]');
        btnGuardar.textContent = 'Guardar peso';
        btnGuardar.style.backgroundColor = '';

        mensaje.textContent = 'Registro guardado correctamente';
        pesoKg.value = '';
        nota.value = '';

        ponerFechaHoy();

        await cargarRegistros();
        await cargarProgreso();
    });
}

async function cargarProgreso() {
    try {
        const respuesta = await fetch('/api/progreso');

        const datos = await respuesta.json();

        const progreso = Number(datos.progreso);

        progressBar.value = progreso;
        progressText.textContent = Math.round(progreso) + '%';

    } catch (error) {
        console.error(\"ERROR PROGRESO:\", error);
    }
}

// --- NAVEGACIÓN ENTRE VISTAS (tabbar arriba/abajo + swipe) ---
function iniciarNavegacionVistas() {

    const vistas = document.querySelectorAll('.vista');
    const tabs = document.querySelectorAll('.tab-link');
    const contenedorVistas = document.querySelector('main.vistas');
    const tabbar = document.getElementById('tabbar');
    const indicador = tabbar?.querySelector('.tab-indicator');

    if (!vistas.length || !tabs.length || !contenedorVistas || !indicador) {
        return;
    }


    // ---------------------------------------------------------
    // INDICADOR
    // ---------------------------------------------------------

 function actualizarIndicador(progreso) {
    const cantidad = tabs.length;

    if (cantidad === 0) return;

    // Índice de la pestaña actual
    const indice = Math.floor(progreso);

    // Evitamos salirnos del array
    const indiceActual = Math.max(
        0,
        Math.min(indice, cantidad - 1)
    );

    const indiceSiguiente = Math.min(
        indiceActual + 1,
        cantidad - 1
    );

    const tabActual = tabs[indiceActual];
    const tabSiguiente = tabs[indiceSiguiente];

    if (!tabActual || !tabSiguiente) return;

    // Punto de inicio de la barra:
    // aproximadamente en el centro de cada pestaña
    const xActual =
        tabActual.offsetLeft +
        (tabActual.offsetWidth / 2) - 10;

    const xSiguiente =
        tabSiguiente.offsetLeft +
        (tabSiguiente.offsetWidth / 2) - 10;

    // Progreso entre la pestaña actual y la siguiente
    const progresoLocal =
        progreso - indiceActual;

    const x =
        xActual +
        (xSiguiente - xActual) * progresoLocal;

    // La barra tiene un tamaño pequeño y fijo
    indicador.style.width = '20px';

    indicador.style.transform =
        `translateX(${x}px)`;
}


    // ---------------------------------------------------------
    // CALCULAR POSICIÓN INICIAL
    // ---------------------------------------------------------

    function actualizarIndicadorDesdeScroll() {

        const anchoVista = contenedorVistas.clientWidth;

        if (!anchoVista) return;

        const progreso =
            contenedorVistas.scrollLeft / anchoVista;

        actualizarIndicador(progreso);
    }


    // ---------------------------------------------------------
    // SWIPE / SCROLL
    // ---------------------------------------------------------

    let rafPendiente = false;

    contenedorVistas.addEventListener('scroll', () => {

        if (rafPendiente) return;

        rafPendiente = true;

        requestAnimationFrame(() => {

            actualizarIndicadorDesdeScroll();

            rafPendiente = false;

        });

    }, { passive: true });


    // ---------------------------------------------------------
    // INTERSECTION OBSERVER
    // ---------------------------------------------------------

    const observer = new IntersectionObserver((entries) => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                const id = entry.target.id;

                tabs.forEach(tab => {

                    tab.classList.toggle(
                        'active',
                        tab.getAttribute('href') === '#' + id
                    );

                });

            }

        });

    }, {
        root: contenedorVistas,
        threshold: 0.6
    });


    vistas.forEach(vista => {
        observer.observe(vista);
    });


    // ---------------------------------------------------------
    // CLICK EN LOS TABS
    // ---------------------------------------------------------

    tabs.forEach(tab => {

        tab.addEventListener('click', (e) => {

            e.preventDefault();

            const destino =
                document.querySelector(
                    tab.getAttribute('href')
                );

            if (!destino) {
                return;
            }

            destino.scrollIntoView({
                behavior: 'smooth',
                inline: 'start',
                block: 'nearest'
            })



        });

    });


    // ---------------------------------------------------------
    // POSICIÓN INICIAL
    // ---------------------------------------------------------

    requestAnimationFrame(() => {
        actualizarIndicadorDesdeScroll();
    });


    // ---------------------------------------------------------
    // RECALCULAR SI CAMBIA EL TAMAÑO DE PANTALLA
    // ---------------------------------------------------------

    window.addEventListener('resize', () => {

        requestAnimationFrame(() => {
            actualizarIndicadorDesdeScroll();
        });

    });

}

// --- INICIALIZACIÓN ---
async function iniciarApp() {
    ponerFechaHoy();
    iniciarNavegacionVistas();
    await cargarUsuarioActual();
    await cargarRegistros();
    await cargarProgreso()
}

iniciarApp();
