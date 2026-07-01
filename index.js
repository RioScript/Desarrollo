document.addEventListener('DOMContentLoaded', () => {
    const selectUsuario = document.getElementById('selectUsuario');
    const indicadorRol = document.getElementById('indicadorRol');
    const selectAllCk = document.getElementById('selectAll');
    const empCks = document.querySelectorAll('.emp-check');
    const listaSeleccionados = document.getElementById('listaSeleccionados');
    const totalSeleccionados = document.getElementById('totalSeleccionados');
    const cuerpoAprobaciones = document.getElementById('cuerpoAprobaciones');

    // ==========================================
    // 1. SIMULADOR DE SESIÓN, ROLES Y PERMISOS
    // ==========================================
    window.evaluarUsuarioYPermisos = (valorSesion) => {
        // Formato del value: "usuario|Rol|Sitio Asignado"
        const [usuario, rol, sitioAsignado] = valorSesion.split('|');

        indicadorRol.innerText = rol;

        // Regla 1: Permisos de Carga
        const elementosFiscal = document.querySelectorAll('.btn-fiscal-allow');
        if (rol === 'Fiscal' || rol === 'Administrador') {
            elementosFiscal.forEach(el => {
                el.removeAttribute('disabled');
                el.style.opacity = '1';
            });
        } else {
            elementosFiscal.forEach(el => {
                el.setAttribute('disabled', 'true');
                el.style.opacity = '0.5';
            });
        }

        // Regla 2: Filtrado por Sitio en la Pestaña de Aprobaciones ---
        const filasAprobacion = cuerpoAprobaciones.querySelectorAll('tr');

        filasAprobacion.forEach(fila => {
            const sitioFila = fila.getAttribute('data-sitio');

            // Si el sitio de la fila no coincide con el sitio asignado del supervisor (y no es ADMIN o TODOS)
            if (sitioAsignado !== 'TODOS' && sitioFila && sitioFila !== sitioAsignado) {
                fila.style.display = 'none'; // Ocultar lo que no le corresponde
            } else {
                fila.style.display = ''; // Mostrar lo autorizado
            }
        });
    };

    // 2. CONTROL DE SELECCIÓN DE EMPLEADOS (PESTAÑA 1)
    function actualizarPanelLateral() {
        listaSeleccionados.innerHTML = '';
        // Contador que va desplegando y sumando los usuarios que se seleccionan
        let contador = 0;

        empCks.forEach(ck => {
            if (ck.checked) {
                contador++;

                // Crear el elemento de la lista
                const li = document.createElement('li');
                li.className = 'list-group-item d-flex justify-content-between align-items-center py-1 px-2 small animate__animated animate__fadeInFast';
                li.innerHTML = `
                    <span><strong class="text-primary me-2">${ck.dataset.id}</strong>${ck.dataset.nombre}</span>
                    <i class="fas fa-times text-danger ms-2" style="cursor: pointer;" onclick="desmarcarEmpleado('${ck.dataset.id}')" title="Quitar"></i>
                `;
                listaSeleccionados.appendChild(li);
            }
        });

        // Actualizar contador numérico
        totalSeleccionados.innerText = contador;
    }

    // Evento para "Seleccionar Todos"
    if (selectAllCk) {
        selectAllCk.addEventListener('change', () => {
            // Solo marcar los que estén visibles actualmente
            empCks.forEach(ck => {
                const fila = ck.closest('tr');
                if (fila.style.display !== 'none') {
                    ck.checked = selectAllCk.checked;
                }
            });
            actualizarPanelLateral();
        });
    }

    // Evento individual para cada checkbox de la tabla
    empCks.forEach(ck => ck.addEventListener('change', () => {
        // Si uno se desmarca, quitar el "seleccionar todos"
        if (!ck.checked && selectAllCk) selectAllCk.checked = false;
        actualizarPanelLateral();
    }));

    // Función global para quitar un empleado desde la cruz del panel lateral
    window.desmarcarEmpleado = (id) => {
        const checkbox = document.querySelector(`.emp-check[data-id="${id}"]`);
        if (checkbox) {
            checkbox.checked = false;
            if (selectAllCk) selectAllCk.checked = false;
            actualizarPanelLateral();
        }
    };

    // Botón Guardar de la pestaña 1
    window.guardarRegistros = () => {
        const notas = document.getElementById('notasCarga').value;
        const seleccionados = Array.from(empCks).filter(ck => ck.checked).map(ck => ck.dataset.id);

        if (seleccionados.length === 0) {
            alert('Por favor, seleccione al menos un colaborador antes de guardar.');
            return;
        }

        console.log('Guardando registros...', { empleados: seleccionados, observaciones: notas });
        alert(`Se han registrado asistencias/fatiga para ${seleccionados.length} colaboradores.`);
    };

    // ==========================================
    // 3. LÓGICA DE APROBACIONES (PESTAÑA 2)
    // ==========================================

    // Cambiar estado de una sola fila (Aprobar / Rechazar)
    window.cambiarEstadoFila = (btn, nuevoEstado) => {
        const fila = btn.closest('tr');
        const badge = fila.querySelector('.badge');

        if (badge) {
            badge.innerText = nuevoEstado;
            // Aplicar las clases oscuras que definimos en el CSS
            if (nuevoEstado === 'Aprobado') {
                badge.className = 'badge badge-aprobado p-2';
            } else if (nuevoEstado === 'Rechazado') {
                badge.className = 'badge badge-rechazado p-2';
            }
        }
    };

    // Aprobar un grupo entero (por ejemplo: 'g-volcan' o 'g-mojon')
    window.aprobarGrupo = (claseGrupo) => {
        const filasGrupo = cuerpoAprobaciones.querySelectorAll(`.${claseGrupo}`);

        filasGrupo.forEach(fila => {
            const badge = fila.querySelector('.badge');
            if (badge) {
                badge.innerText = 'Aprobado';
                badge.className = 'badge badge-aprobado p-2';
            }
        });

        console.log(`Grupo [${claseGrupo}] aprobado exitosamente.`);
    };

    if (selectUsuario) {
        // Disparar la verificación inicial para ajustar la vista según el usuario por defecto
        evaluarUsuarioYPermisos(selectUsuario.value);
    }
    // ==========================================
    // 4. LÓGICA DE INTERCAMBIO DE MODO (TEMA)
    // ==========================================
    const btnThemeToggle = document.getElementById('btnThemeToggle');
    const iconTheme = document.getElementById('iconTheme');
    const txtTheme = document.getElementById('txtTheme');

    // Comprobar si el usuario ya tenía una preferencia guardada anteriormente
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'light') {
        document.body.classList.add('light-mode');
        actualizarInterfazBoton(true);
    }

    if (btnThemeToggle) {
        btnThemeToggle.addEventListener('click', () => {
            // Alternar la clase en el body
            const isLight = document.body.classList.toggle('light-mode');

            // Guardar la elección en el almacenamiento local del navegador
            localStorage.setItem('theme', isLight ? 'light' : 'dark');

            // Actualizar visualmente el botón
            actualizarInterfazBoton(isLight);
        });
    }

    function actualizarInterfazBoton(isLight) {
        if (isLight) {
            iconTheme.className = 'fas fa-moon text-primary'; // Cambia el icono a luna cian/dorada
            txtTheme.innerText = 'Modo Oscuro';
            btnThemeToggle.className = 'btn btn-light btn-sm d-flex align-items-center gap-1 border me-2';
        } else {
            iconTheme.className = 'fas fa-sun text-warning'; // Cambia el icono a sol amarillo
            txtTheme.innerText = 'Modo Claro';
            btnThemeToggle.className = 'btn btn-dark btn-sm d-flex align-items-center gap-1 border-secondary me-2';
        }
    }
});