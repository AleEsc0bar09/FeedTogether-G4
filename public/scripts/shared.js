
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
        loadSection('mydonations');
      } else {
        loadRegister('donor');
      }
    })
    .catch((error) => {
      console.error("Error verificando sesión:", error);
      loadRegister('donor');
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
          `<span class="badge bg-light text-dark border">${p.producto}</span>`
        ).join(" ");

        const imagen = sol.imagen 
          ? `../${sol.imagen}` 
          : "img/ElRosarioChurch.jpg"; // imagen por defecto si no subieron una

        const fecha = new Date(sol.fecha_publicacion).toLocaleDateString();

        contenedor.innerHTML += `
          <div class="col-md-6">
            <div class="card border-0 shadow-sm p-3 h-100">
              <div class="d-flex gap-3 align-items-center">
                <img src="${imagen}" 
                     class="rounded-3 card-img-custom object-fit-cover" 
                     style="width: 120px; height: 100px; flex-shrink: 0;" 
                     alt="${sol.titulo}">
                <div class="w-100">
                  <h5 class="fw-bold mb-1">${sol.titulo}</h5>
                  <p class="text-muted small mb-2">${sol.ubicacion || "Ubicación no especificada"} - ${fecha}</p>
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

    const imagen = req.imagen ? `../${req.imagen}` : "img/ElRosarioChurch.jpg";
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
        ${p.producto} <span class="fw-bold">${p.cantidad_requerida}</span>
      </li>
    `).join("");
  }, 50);
}

function loadPledgeForm() {
  loadSection("donates");

  setTimeout(() => {
    const req = requestsData[solicitudActual];
    if (!req) return;
    document.getElementById("pledge-title").innerText = `Pledge Support for ${req.title}`;
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

  const locations = [
    {
      coords: [13.6980, -89.1914],
      title: "Iglesia San Francisco - Comedor Comunitario",
      desc: "Serves daily lunches to elderly residents in San Salvador."
    },
    {
      coords: [13.9942, -89.5597],
      title: "Centro Parroquial Santa Ana",
      desc: "Receiving dry grains for rural family distribution."
    },
    {
      coords: [13.3440, -88.1780],
      title: "Red Comunitaria Usulután",
      desc: "Logistics hub for mountain community kits."
    }
  ];

  locations.forEach(loc => {
    L.marker(loc.coords)
      .addTo(map)
      .bindPopup(`<strong>${loc.title}</strong><br><small>${loc.desc}</small>`);
  });

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

