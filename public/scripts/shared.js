
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

const requestsData = {
  "el-rosario": {
    title: "El Rosario Church",
    location: "San Miguel",
    posted: "Posted 3 days ago",
    img: "img/ElRosarioChurch.jpg",
    overview: "Local church community seeking food supplies to support families currently facing temporary shortages.",
    supplies: [
      { name: "Rice", amount: "50 kg" },
      { name: "Beans", amount: "40 kg" },
      { name: "Milk", amount: "20 units" }
    ],
    beneficiaries: 90,
    deadline: "May 30, 2026",
    locationDetail: "El Rosario Church Center",
    phone: "+503 7537-1280",
    email: "info@feedtogether.org"
  },
  "nuevo-israel": {
    title: "Nuevo Israel Community",
    location: "San Salvador",
    posted: "Posted 5 days ago",
    img: "img/ComunidadNuevoIsrael.jpg",
    overview: "Local community center seeking food supplies to support families currently facing temporary shortages.",
    supplies: [
      { name: "Sugar", amount: "30 kg" },
      { name: "Cooking Oil", amount: "20 L" },
      { name: "Flour", amount: "25 kg" }
    ],
    beneficiaries: 120,
    deadline: "June 30, 2026",
    locationDetail: "Main Community Center",
    phone: "+503 7537-1280",
    email: "info@feedtogether.org"
  }
};

function loadRequestDetail(requestKey) {
  solicitudActual = requestKey;
  loadSection("details");

  setTimeout(() => {
    const req = requestsData[requestKey];
    if (!req) return;

    document.getElementById("detail-req-title").innerText = req.title;
    document.getElementById("detail-req-location").innerText = `${req.location} - ${req.posted}`;
    document.getElementById("detail-req-img").src = req.img;
    document.getElementById("detail-req-overview").innerText = req.overview;
    document.getElementById("detail-req-beneficiaries").innerText = req.beneficiaries;
    document.getElementById("detail-req-deadline").innerText = req.deadline;
    document.getElementById("detail-req-locationdetail").innerText = req.locationDetail;
    document.getElementById("detail-req-phone").innerText = req.phone;
    document.getElementById("detail-req-email").innerText = req.email;

    const suppliesList = document.getElementById("detail-req-supplies");
    suppliesList.innerHTML = req.supplies.map(s => `
      <li class="list-group-item d-flex justify-content-between align-items-center">
        ${s.name} <span class="fw-bold">${s.amount}</span>
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