function escapeHtml(texto) {
  return String(texto ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

let rolSeleccionado = null;

function loadRegister(rol) {
  rolSeleccionado = rol;
  loadSection("register");
}

function submitPledge(event) {
  event.preventDefault();

  fetch("../auth/check_session.php")
    .then((response) => response.json())
    .then((data) => {
      if (data.logueado) {
        enviarCompromiso(event.target);
      } else {
        loadRegister('donor');
      }
    })
    .catch((error) => {
      console.error("Error verificando sesión:", error);
      loadRegister('donor');
    });
}

function enviarCompromiso(form) {
  const mensajeDiv = document.getElementById("mensajePledge");
  const btnSubmit = form.querySelector('button[type="submit"]');

  mensajeDiv.classList.add("d-none");
  btnSubmit.disabled = true;
  btnSubmit.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span> Enviando...`;

  const formData = new FormData(form);

  fetch("../solicitudes/comprometer.php", {
    method: "POST",
    body: formData,
    credentials: "include"
  })
    .then(response => response.json())
    .then(data => {
      if (data.status === "success") {
        mensajeDiv.className = "alert alert-success";
        mensajeDiv.textContent = data.message + " Redirigiendo a Mis Compromisos...";
        mensajeDiv.classList.remove("d-none");

        setTimeout(() => {
          loadSection('mydonations');
        }, 1800);
      } else {
        mensajeDiv.className = "alert alert-danger";
        mensajeDiv.textContent = data.message || "No se pudo enviar tu compromiso.";
        mensajeDiv.classList.remove("d-none");
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = "Confirm Pledge";
      }
    })
    .catch(error => {
      console.error("Error al enviar compromiso:", error);
      mensajeDiv.className = "alert alert-danger";
      mensajeDiv.textContent = "No se pudo conectar con el servidor.";
      mensajeDiv.classList.remove("d-none");
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = "Confirm Pledge";
    });
}

let solicitudActual = null;

let requestsData = {};

function cargarSolicitudes() {
  const contenedor = document.getElementById("listaSolicitudes");
  if (!contenedor) return;

  fetch("../solicitudes/listar.php")
    .then(response => response.json())
    .then(data => {
      if (data.status !== "success" || data.solicitudes.length === 0) {
        contenedor.innerHTML = `<p class="text-muted">No hay solicitudes activas por el momento.</p>`;
        return;
      }

      requestsData = {};
      contenedor.innerHTML = "";

      data.solicitudes.forEach(sol => {
        requestsData[sol.id_solicitud] = sol;

        const badges = sol.productos.map(p =>
          `<span class="badge bg-light text-dark border">${escapeHtml(p.producto)}</span>`
        ).join(" ");

        const imagen = sol.imagen ? sol.imagen : "img/ElRosarioChurch.jpg";

        const fecha = new Date(sol.fecha_publicacion).toLocaleDateString();

        contenedor.innerHTML += `
          <div class="col-md-6">
            <div class="card border-0 shadow-sm p-3 h-100">
              <div class="d-flex gap-3 align-items-center">
                <img src="${escapeHtml(imagen)}"
                     class="rounded-3 card-img-custom object-fit-cover"
                     style="width: 120px; height: 100px; flex-shrink: 0;"
                     alt="${escapeHtml(sol.titulo)}">
                <div class="w-100">
                  <h5 class="fw-bold mb-1">${escapeHtml(sol.titulo)}</h5>
                  <p class="text-muted small mb-2">${escapeHtml(sol.ubicacion) || "Ubicación no especificada"} - ${fecha}</p>
                  <div class="d-flex flex-wrap gap-1 mb-3">
                    ${badges}
                  </div>
                  <div class="d-flex gap-2">
                    <button class="btn btn-sm btn-outline-secondary" onclick="loadRequestDetail(${sol.id_solicitud})">View Details</button>
                    <button class="btn btn-sm btn-success" onclick="loadRequestDetail(${sol.id_solicitud})">Pledge Support</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
      });
    })
    .catch(error => {
      console.error("Error cargando solicitudes:", error);
      contenedor.innerHTML = `<p class="text-danger">No se pudieron cargar las solicitudes.</p>`;
    });
}

function loadRequestDetail(idSolicitud) {
  solicitudActual = idSolicitud;
  loadSection("details");

  setTimeout(() => {
    const req = requestsData[idSolicitud];
    if (!req) return;

    const imagen = req.imagen ? req.imagen : "img/ElRosarioChurch.jpg";
    const fecha = new Date(req.fecha_publicacion).toLocaleDateString();

    document.getElementById("detail-req-title").innerText = req.titulo;
    document.getElementById("detail-req-location").innerText = `${req.ubicacion || "Ubicación no especificada"} - ${fecha}`;
    document.getElementById("detail-req-img").src = imagen;
    document.getElementById("detail-req-overview").innerText = req.descripcion;
    document.getElementById("detail-req-beneficiaries").innerText = req.cantidad_beneficiados || "N/A";
    document.getElementById("detail-req-deadline").innerText = req.fecha_limite || "Sin fecha límite";
    document.getElementById("detail-req-locationdetail").innerText = req.ubicacion || "No especificada";
    document.getElementById("detail-req-phone").innerText = "+503 7537-1280"; // dato de contacto general de la plataforma
    document.getElementById("detail-req-email").innerText = "info@feedtogether.org";

    const suppliesList = document.getElementById("detail-req-supplies");
    suppliesList.innerHTML = req.productos.map(p => `
      <li class="list-group-item d-flex justify-content-between align-items-center">
        ${escapeHtml(p.producto)} <span class="fw-bold">${escapeHtml(p.cantidad_requerida)}</span>
      </li>
    `).join("");
  }, 50);
}

function loadPledgeForm() {
  loadSection("donates");

  setTimeout(() => {
    const req = requestsData[solicitudActual];
    if (!req) return;
    document.getElementById("pledge-title").innerText = `Pledge Support for ${req.titulo}`;
    document.getElementById("pledge-id-solicitud").value = solicitudActual;
  }, 50);
}

const storiesData = {
  "anna-usulutan": {
    badge: "Impact Story • Berlín, Usulután",
    title: "Resilience in the Mountains of Usulután: Overcoming Food Insecurity",
    location: "Comunidad El Rescate, Usulután",
    img: "img/Story1.jpg",
    content: `
      <p>In remote communities across the mountains of Berlín, Usulután, families like Anna—a single mother raising three young daughters—face daily challenges in accessing basic food supplies. Limited local employment, lack of running water, and long journeys to nearby towns make food stability a constant battle.</p>
      <p>In these rural zones, meals often rely entirely on local seasonal crops like chipilín, izote flower, or plantains. Skipping meals or reducing portions to two times a day is a reality for many households when daily wage work in coffee farms or agriculture becomes scarce.</p>
      <blockquote class="border-start border-4 border-success ps-3 my-4 fst-italic text-dark bg-light p-3 rounded-end">
        "When emergency food packages arrive, they truly save us from hunger. My biggest concern is making sure my youngest daughter has milk and proper nutrition every single day."
        <footer class="blockquote-footer mt-2">Anna, Community Member from Usulután</footer>
      </blockquote>
      <p>Through humanitarian assistance networks and coordinated community distributions, emergency kits containing essential dry goods are brought directly to these high-need areas.</p>
      <h4 class="fw-bold text-dark mt-4">How FeedTogether Connects Help</h4>
      <ul>
        <li><strong>Direct Bridge:</strong> Connecting rural community representatives with donors and NGOs.</li>
        <li><strong>Focus on Early Childhood:</strong> Prioritizing essential dairy and nutritional supplements for young children.</li>
        <li><strong>Transparent Logistics:</strong> Mapping high-vulnerability rural sectors to target relief efforts effectively.</li>
      </ul>
    `,
    disclaimer: "This story is inspired by testimonies about the food security situation in the rural areas of Berlín, Usulután. The names and details have been adapted to respect privacy.",
  },
  "maura-tacuba": {
    badge: "Impact Story • Tacuba, Ahuachapán",
    title: "Overcoming Daily Food Insecurity in Rural Ahuachapán",
    location: "Cantón El Jícaro, Tacuba",
    img: "img/Story2.jpg",
    content: `
      <p>In rural sectors of Tacuba, many families rely on informal daily jobs—such as doing daily laundry—making household income unpredictable and keeping basic pantry goods out of reach.</p>
      <p>For mothers like Maura, raising four young children under limited monthly income requires daily sacrifices, often skipping her own meals so her children can have enough food. School meal programs provide critical relief during weekdays, but basic staples at home remain essential.</p>
      <blockquote class="border-start border-4 border-success ps-3 my-4 fst-italic text-dark bg-light p-3 rounded-end">
        "When income is low, securing basic staples like rice, beans, and milk for the youngest becomes our main priority every single day."
        <footer class="blockquote-footer mt-2">Maura, Resident from Cantón El Jícaro</footer>
      </blockquote>
      <p>Emergency food baskets contain essentials like rice, beans, cooking oil, and milk powder, easing the heavy burden on low-income single mothers.</p>
      <h4 class="fw-bold text-dark mt-4">FeedTogether Support Focus</h4>
      <ul>
        <li><strong>Emergency Food Baskets:</strong> Connecting donors directly with rural families in Tacuba.</li>
        <li><strong>Early Childhood Nutrition:</strong> Prioritizing food aid for households with toddlers and infants.</li>
        <li><strong>Community Networks:</strong> Facilitating direct food recovery to reduce market cost barriers.</li>
      </ul>
    `,
    disclaimer: "This story is inspired by real testimonies of food security challenges in Ahuachapán, El Salvador. All names and identifying details have been modified for privacy.",
  },
};

function loadStoryDetail(storyKey) {
  loadSection("stories_details");

  setTimeout(() => {
    const story = storiesData[storyKey];
    if (story) {
      document.getElementById("detail-badge").innerText = story.badge;
      document.getElementById("detail-title").innerText = story.title;
      document.getElementById("detail-location").innerText = story.location;
      document.getElementById("detail-img").src = story.img;
      document.getElementById("detail-content").innerHTML = story.content;
      document.getElementById("detail-disclaimer").innerText = story.disclaimer;
    }
  }, 50);
}

function initNeedsMap() {
  const mapElement = document.getElementById("mapa-sv");
  if (!mapElement) return;

  const map = L.map("mapa-sv").setView([13.6929, -89.2182], 9);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "© OpenStreetMap"
  }).addTo(map);

  fetch("../solicitudes/listar.php")
    .then(response => response.json())
    .then(data => {
      if (data.status !== "success") return;

      data.solicitudes.forEach(sol => {
        if (sol.latitud == null || sol.longitud == null) return;

        requestsData[sol.id_solicitud] = sol;

        L.marker([parseFloat(sol.latitud), parseFloat(sol.longitud)])
          .addTo(map)
          .bindPopup(`
            <strong>${escapeHtml(sol.titulo)}</strong><br>
            <small>${escapeHtml(sol.ubicacion) || "Ubicación no especificada"}</small><br>
            <button class="btn btn-sm btn-success mt-2" onclick="loadRequestDetail(${sol.id_solicitud})">View Details</button>
          `);
      });
    })
    .catch(error => console.error("Error cargando puntos del mapa:", error));

  setTimeout(() => {
    map.invalidateSize();
  }, 300);
}

function initSolicitudForm() {

    const formSolicitud = document.getElementById("formSolicitud");
    const btnAgregarProducto = document.getElementById("btnAgregarProducto");
    const productosContainer = document.getElementById("productosContainer");
    const mensajeSolicitud = document.getElementById("mensajeSolicitud");
    const btnPublicar = document.getElementById("btnPublicar");

    if (!formSolicitud) {
        return;
    }

    // Selector de ubicación en el mapa
    const selectorEl = document.getElementById("mapa-selector");
    let marcador = null;

    if (selectorEl && typeof L !== "undefined") {
        const mapaSel = L.map("mapa-selector").setView([13.6929, -89.2182], 9);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: "© OpenStreetMap"
        }).addTo(mapaSel);

        mapaSel.on("click", (e) => {
            if (marcador) {
                marcador.setLatLng(e.latlng);
            } else {
                marcador = L.marker(e.latlng).addTo(mapaSel);
            }
            document.getElementById("latitud").value = e.latlng.lat.toFixed(7);
            document.getElementById("longitud").value = e.latlng.lng.toFixed(7);
        });

        formSolicitud.addEventListener("reset", () => {
            if (marcador) {
                mapaSel.removeLayer(marcador);
                marcador = null;
            }
            document.getElementById("latitud").value = "";
            document.getElementById("longitud").value = "";
        });

        setTimeout(() => mapaSel.invalidateSize(), 300);
    }

    btnAgregarProducto.addEventListener("click", () => {

        const cantidadProductos =
            productosContainer.querySelectorAll(".producto-item").length;

        const numeroProducto = cantidadProductos + 1;

        const nuevoProducto = document.createElement("div");

        nuevoProducto.classList.add(
            "producto-item",
            "card",
            "bg-light",
            "border",
            "mb-3"
        );

        nuevoProducto.innerHTML = `
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h6 class="fw-bold mb-0">
                        Producto #${numeroProducto}
                    </h6>
                    <button
                        type="button"
                        class="btn btn-sm btn-outline-danger btnEliminarProducto"
                    >
                        <i class="bi bi-trash"></i>
                        Eliminar
                    </button>
                </div>
                <div class="row">
                    <div class="col-md-4 mb-3">
                        <label class="form-label">Categoría</label>
                        <select class="form-select" name="id_categoria[]" required>
                            <option value="" selected disabled>Selecciona una categoría</option>
                            <option value="1">Víveres básicos</option>
                            <option value="2">Alimentos infantiles</option>
                            <option value="3">Agua potable</option>
                            <option value="4">Frutas y verduras</option>
                            <option value="5">Alimentos no perecederos</option>
                            <option value="6">Otro</option>
                        </select>
                    </div>
                    <div class="col-md-4 mb-3">
                        <label class="form-label">Producto</label>
                        <input type="text" class="form-control" name="producto[]" maxlength="150" placeholder="Ej. Arroz" required>
                    </div>
                    <div class="col-md-4 mb-3">
                        <label class="form-label">Cantidad requerida</label>
                        <input type="text" class="form-control" name="cantidad_requerida[]" maxlength="100" placeholder="Ej. 20 libras" required>
                    </div>
                </div>
            </div>
        `;

        productosContainer.appendChild(nuevoProducto);
        actualizarNumeracion();
    });

    productosContainer.addEventListener("click", (event) => {

        const botonEliminar = event.target.closest(".btnEliminarProducto");

        if (!botonEliminar) {
            return;
        }

        const productos = productosContainer.querySelectorAll(".producto-item");

        if (productos.length <= 1) {
            mostrarMensaje("Debes tener al menos un producto en la solicitud.", "danger");
            return;
        }

        const producto = botonEliminar.closest(".producto-item");
        producto.remove();
        actualizarNumeracion();
    });

    function actualizarNumeracion() {
        const productos = productosContainer.querySelectorAll(".producto-item");
        productos.forEach((producto, index) => {
            const titulo = producto.querySelector("h6");
            if (titulo) {
                titulo.textContent = `Producto #${index + 1}`;
            }
        });
    }

    formSolicitud.addEventListener("submit", async (event) => {

        event.preventDefault();
        ocultarMensaje();

        btnPublicar.disabled = true;
        btnPublicar.innerHTML = `
            <span class="spinner-border spinner-border-sm me-2" role="status"></span>
            Publicando...
        `;

        try {
            const formData = new FormData(formSolicitud);

            const respuesta = await fetch("../solicitudes/crear.php", {
                method: "POST",
                body: formData,
                credentials: "include"
            });

            const datos = await respuesta.json();

            if (datos.status === "success") {
                mostrarMensaje(datos.message, "success");
                formSolicitud.reset();

                const productos = productosContainer.querySelectorAll(".producto-item");
                productos.forEach((producto, index) => {
                    if (index > 0) {
                        producto.remove();
                    }
                });

                actualizarNumeracion();
            } else {
                mostrarMensaje(datos.message || "No se pudo crear la solicitud.", "danger");
            }

        } catch (error) {
            console.error(error);
            mostrarMensaje("No se pudo conectar con el servidor.", "danger");
        } finally {
            btnPublicar.disabled = false;
            btnPublicar.innerHTML = `<i class="bi bi-send me-2"></i> Publicar solicitud`;
        }
    });

    function mostrarMensaje(texto, tipo) {
        mensajeSolicitud.className = `alert alert-${tipo}`;
        mensajeSolicitud.textContent = texto;
        mensajeSolicitud.classList.remove("d-none");
        mensajeSolicitud.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    function ocultarMensaje() {
        mensajeSolicitud.classList.add("d-none");
        mensajeSolicitud.textContent = "";
    }
}

function volverDesdeDetalle() {
  fetch("../auth/check_session.php")
    .then(response => response.json())
    .then(data => {
      if (data.logueado) {
        loadSection('request');
      } else {
        loadSection('home');
      }
    })
    .catch(error => {
      console.error("Error verificando sesión:", error);
      loadSection('home');
    });
}

let compromisosData = [];

function cargarMisCompromisos() {
  const contenedor = document.getElementById("listaCompromisos");
  if (!contenedor) return;

  fetch("../solicitudes/mis_compromisos.php")
    .then(response => response.json())
    .then(data => {
      if (data.status !== "success") {
        contenedor.innerHTML = `<p class="text-danger">${escapeHtml(data.message)}</p>`;
        return;
      }

      compromisosData = data.compromisos;
      pintarCompromisos(compromisosData);
    })
    .catch(error => {
      console.error("Error cargando compromisos:", error);
      contenedor.innerHTML = `<p class="text-danger">No se pudieron cargar tus compromisos.</p>`;
    });
}

function pintarCompromisos(lista) {
  const contenedor = document.getElementById("listaCompromisos");

  if (lista.length === 0) {
    contenedor.innerHTML = `<p class="text-muted">Aún no tienes compromisos de donación.</p>`;
    return;
  }

  const badgeClase = {
    pendiente: "bg-warning text-dark",
    completado: "bg-success",
    cancelado: "bg-danger"
  };

  const badgeTexto = {
    pendiente: "In Progress",
    completado: "Completed",
    cancelado: "Cancelled"
  };

  contenedor.innerHTML = lista.map(c => {
    const fecha = new Date(c.fecha_compromiso).toLocaleDateString();
    return `
      <div class="card border-0 shadow-sm p-3 d-flex flex-row justify-content-between align-items-center">
        <div>
          <h5 class="fw-bold mb-1">${escapeHtml(c.titulo)}</h5>
          <p class="text-muted small mb-0">${escapeHtml(c.ubicacion) || "Ubicación no especificada"} - ${fecha}</p>
        </div>
        <span class="badge ${badgeClase[c.estado]} px-3 py-2">${badgeTexto[c.estado]}</span>
      </div>
    `;
  }).join("");
}

function filtrarCompromisos(estado) {
  document.querySelectorAll("#main-content .nav-tabs .nav-link").forEach(link => link.classList.remove("active"));
  event.target.classList.add("active");

  if (estado === "all") {
    pintarCompromisos(compromisosData);
  } else {
    pintarCompromisos(compromisosData.filter(c => c.estado === estado));
  }
}

let misSolicitudesData = [];

function cargarMisSolicitudes() {
  const contenedor = document.getElementById("listaMisSolicitudes");
  if (!contenedor) return;

  fetch("../solicitudes/mis_solicitudes.php")
    .then(response => response.json())
    .then(data => {
      if (data.status !== "success") {
        contenedor.innerHTML = `<p class="text-danger">${escapeHtml(data.message)}</p>`;
        return;
      }

      misSolicitudesData = data.solicitudes;
      pintarMisSolicitudes(misSolicitudesData);
    })
    .catch(error => {
      console.error("Error cargando mis solicitudes:", error);
      contenedor.innerHTML = `<p class="text-danger">No se pudieron cargar tus solicitudes.</p>`;
    });
}

function pintarMisSolicitudes(lista) {
  const contenedor = document.getElementById("listaMisSolicitudes");

  if (lista.length === 0) {
    contenedor.innerHTML = `<p class="text-muted">Aún no has creado ninguna solicitud.</p>`;
    return;
  }

  const badgeClase = {
    activa: "bg-success",
    cerrada: "bg-danger"
  };

  const badgeTexto = {
    activa: "Active",
    cerrada: "Closed"
  };

  contenedor.innerHTML = lista.map((s, index) => {
    const donantesHtml = s.donantes.length === 0
      ? `<p class="text-muted small mb-0 mt-2">Nadie se ha comprometido aún.</p>`
      : s.donantes.map(d => {
          const foto = d.foto_perfil
            ? `<img src="uploads/${escapeHtml(d.foto_perfil)}" class="rounded-circle me-2" style="width: 28px; height: 28px; object-fit: cover;" alt="${escapeHtml(d.nombre)}">`
            : `<div class="rounded-circle bg-secondary bg-opacity-25 d-flex align-items-center justify-content-center me-2" style="width: 28px; height: 28px;"><i class="bi bi-person-fill text-secondary small"></i></div>`;
          const fecha = new Date(d.fecha_compromiso).toLocaleDateString();
          return `
            <div class="d-flex align-items-center mb-2 mt-2">
              ${foto}
              <div>
                <span class="fw-semibold small">${escapeHtml(d.nombre)}</span>
                <span class="text-muted small"> - ${fecha}</span>
                <div class="small">
                  <i class="bi bi-telephone me-1"></i>${escapeHtml(d.telefono) || "—"}
                  <span class="mx-1">·</span>
                  <i class="bi bi-envelope me-1"></i>${escapeHtml(d.email) || "—"}
                </div>
                ${d.mensaje ? `<p class="text-muted small mb-0 fst-italic">"${escapeHtml(d.mensaje)}"</p>` : ""}
              </div>
            </div>
          `;
        }).join("");

    return `
      <div class="card border-0 shadow-sm p-3">
        <div class="d-flex justify-content-between align-items-center" style="cursor: pointer;" onclick="toggleDonantes(${index})">
          <div>
            <h5 class="fw-bold mb-1">${escapeHtml(s.titulo)}</h5>
            <p class="text-muted small mb-0">${escapeHtml(s.ubicacion) || "Sin ubicación"} - ${s.cantidad_beneficiados || "N/A"} Beneficiaries · ${s.total_compromisos} pledge(s)</p>
          </div>
          <div class="d-flex align-items-center gap-2">
            <span class="badge ${badgeClase[s.estado]} px-3 py-2">${badgeTexto[s.estado]}</span>
            <i class="bi bi-chevron-down"></i>
          </div>
        </div>
        <div id="donantes-${index}" class="d-none border-top mt-2 pt-2">
          ${donantesHtml}
          ${s.estado === "activa" ? `
            <div class="text-end mt-3">
              <button class="btn btn-sm btn-outline-danger" onclick="cerrarSolicitud(${s.id_solicitud})">
                <i class="bi bi-x-circle me-1"></i> Close request
              </button>
            </div>
          ` : ""}
        </div>
      </div>
    `;
  }).join("");
}

function toggleDonantes(index) {
  const panel = document.getElementById(`donantes-${index}`);
  if (panel) panel.classList.toggle("d-none");
}

function cerrarSolicitud(idSolicitud) {
  if (!confirm("¿Seguro que quieres cerrar esta solicitud? Ya no recibirá más compromisos.")) {
    return;
  }

  const formData = new FormData();
  formData.append("id_solicitud", idSolicitud);

  fetch("../solicitudes/cerrar.php", {
    method: "POST",
    body: formData,
    credentials: "include"
  })
    .then(response => response.json())
    .then(data => {
      if (data.status === "success") {
        cargarMisSolicitudes();
      } else {
        alert(data.message || "No se pudo cerrar la solicitud.");
      }
    })
    .catch(error => {
      console.error("Error al cerrar solicitud:", error);
      alert("No se pudo conectar con el servidor.");
    });
}

function filtrarMisSolicitudes(estado) {
  document.querySelectorAll("#main-content .nav-tabs .nav-link").forEach(link => link.classList.remove("active"));
  event.target.classList.add("active");

  if (estado === "all") {
    pintarMisSolicitudes(misSolicitudesData);
  } else {
    pintarMisSolicitudes(misSolicitudesData.filter(s => s.estado === estado));
  }
}

function cargarRecentRequestsHome() {
  const contenedor = document.getElementById("recentRequestsHome");
  if (!contenedor) return;

  fetch("../solicitudes/listar.php")
    .then(response => response.json())
    .then(data => {
      if (data.status !== "success" || data.solicitudes.length === 0) {
        contenedor.innerHTML = `<p class="text-muted">No hay solicitudes activas por el momento.</p>`;
        return;
      }

      const recientes = data.solicitudes.slice(0, 2); // solo las 2 más recientes
      contenedor.innerHTML = "";

      recientes.forEach(sol => {
        requestsData[sol.id_solicitud] = sol;

        const badges = sol.productos.map(p =>
          `<span class="badge bg-light text-dark border">${escapeHtml(p.producto)}</span>`
        ).join(" ");

        const imagen = sol.imagen ? sol.imagen : "img/ElRosarioChurch.jpg";

        contenedor.innerHTML += `
          <div class="col-md-6">
            <div class="card border-0 shadow-sm p-3 h-100">
              <div class="d-flex align-items-center gap-3">
                <img src="${escapeHtml(imagen)}" class="rounded-3 card-img-custom w-50" style="width: 100px; height: 100px; object-fit: cover;" alt="${escapeHtml(sol.titulo)}">
                <div>
                  <h5 class="mb-1">${escapeHtml(sol.titulo)}</h5>
                  <p class="text-muted small mb-2">${escapeHtml(sol.ubicacion) || "Sin ubicación"}</p>
                  <div class="d-flex flex-wrap gap-1 mb-2">
                    ${badges}
                  </div>
                  <button class="btn btn-sm btn-outline-success" onclick="loadRequestDetail(${sol.id_solicitud})">View Details</button>
                </div>
              </div>
            </div>
          </div>
        `;
      });
    })
    .catch(error => {
      console.error("Error cargando recent requests:", error);
      contenedor.innerHTML = `<p class="text-danger">No se pudieron cargar las solicitudes.</p>`;
    });
}

function cargarRankingDonantes() {
  const contenedor = document.getElementById("ranking-donantes");
  if (!contenedor) return;

  fetch("../actividad/ranking_donantes.php")
    .then(response => response.json())
    .then(data => {
      if (data.status !== "success" || data.ranking.length === 0) {
        contenedor.innerHTML = `<p class="text-muted text-center">Aún no hay donantes este mes. ¡Sé el primero!</p>`;
        return;
      }

      contenedor.innerHTML = data.ranking.map((donante, index) => {
        const destacado = index === 0 ? "bg-warning bg-opacity-25 rounded-3" : "";
        const foto = donante.foto_perfil
          ? `uploads/${donante.foto_perfil}`
          : null;

        const avatar = foto
          ? `<img src="${escapeHtml(foto)}" class="rounded-circle me-3" style="width: 40px; height: 40px; object-fit: cover;" alt="${escapeHtml(donante.nombre)}">`
          : `<div class="rounded-circle bg-secondary bg-opacity-25 d-flex align-items-center justify-content-center me-3" style="width: 40px; height: 40px;"><i class="bi bi-person-fill text-secondary"></i></div>`;

        return `
          <div class="d-flex justify-content-between align-items-center p-2 mb-2 ${destacado}">
            <div class="d-flex align-items-center">
              <span class="fw-bold text-muted me-3" style="width: 20px;">${index + 1}</span>
              ${avatar}
              <span class="fw-semibold">${escapeHtml(donante.nombre)}</span>
            </div>
            <span class="badge bg-success rounded-pill">${donante.total_compromisos} pledge${donante.total_compromisos != 1 ? 's' : ''}</span>
          </div>
        `;
      }).join("");
    })
    .catch(error => {
      console.error("Error cargando ranking:", error);
      contenedor.innerHTML = `<p class="text-danger text-center">No se pudo cargar el ranking.</p>`;
    });
}