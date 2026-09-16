document.addEventListener("DOMContentLoaded", () => {
  loadSection("home");
});

//Asigna un rol al form de registro, ya sea "donor" o "requester"
let rolSeleccionado = null;

function loadRegister(rol) {
  rolSeleccionado = rol;
  loadSection("register");
}

<<<<<<< HEAD
function initRegisterForm() {
  const form = document.getElementById("registerForm");

  if (!form) {
    console.error("registerForm not found in the DOM.");
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    // Próximo paso: armar el FormData y enviarlo con fetch a auth/register.php
  });
}

function loadSection(sectionName) {
=======
const proteccionSecciones = {
  request: "donor",
  donorHub: "donor",
  donorUser: "donor",
  mydonations: "donor",
  myrequest: "requester",
  homeNeeder: "requester",
  neederUser: "requester",
  requestcreation: "requester",
  profile: null,
};

async function protegerSeccion(rolRequerido) {
  try {
    const response = await fetch("../auth/session_check.php");
    const data = await response.json();

    if (!data.authenticated) {
      loadSection("login");
      return null;
    }
    if (rolRequerido && data.usuario.rol !== rolRequerido) {
      loadSection("home");
      return null;
    }
    return data.usuario;
  } catch (error) {
    console.error("Error verificando sesión:", error);
    loadSection("login");
    return null;
  }
}

async function loadSection(sectionName) {
>>>>>>> parent of 91730b2 (update)
  const mainContent = document.getElementById("main-content");

  if (!mainContent) {
    console.error("Target container #main-content not found.");
    return;
  }

  fetch(`${sectionName}.html`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to load section: ${response.statusText}`);
      }
      return response.text();
    })
    .then((htmlContent) => {
      mainContent.innerHTML = htmlContent;
      updateActiveNavLink(sectionName);
      window.scrollTo(0, 0);

      if (sectionName === "register") {
        initRegisterForm();
      } else if (sectionName === 'map') {
       initNeedsMap();
      }
    })
    .catch((error) => {
      console.error("Error loading dynamic section:", error);
      mainContent.innerHTML = `
        <div class="alert alert-danger my-4" role="alert">
          <h4 class="alert-heading">Section Error</h4>
          <p>Could not load requested content (${sectionName}.html). Make sure you are running a local web server (e.g., Live Server).</p>
        </div>
      `;
    });
}

function updateActiveNavLink(activeSection) {
  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("onclick")?.includes(`'${activeSection}'`)) {
      link.classList.add("active");
    }
  });
}

//Funcion para hacer una revisión de todos los elementos del form:
function initRegisterForm() {
  const form = document.getElementById("registerForm");

  if (!form) {
    console.error("registerForm not found in the DOM.");
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    formData.append("rol", rolSeleccionado);

    fetch("../auth/register.php", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        alert(data.message);
      })
      .catch((error) => {
        console.error("Error al registrar el usuario:", error);
        alert("Ocurrió un error al procesar el registro. Inténtalo de nuevo.");
      });
  });
}

<<<<<<< HEAD
=======
function initLoginForm() {
  const form = document.getElementById("loginForm");

  if (!form) {
    console.error("loginForm not found in the DOM.");
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    const errorBox = document.getElementById("loginError");
    errorBox.style.display = "none";

    fetch("../auth/login.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "success") {
          loadSection(data.usuario.rol === "donor" ? "request" : "myrequest");
        } else {
          errorBox.textContent = data.message;
          errorBox.style.display = "block";
        }
      })
      .catch((error) => {
        console.error("Error al iniciar sesión:", error);
        errorBox.textContent = "Ocurrió un error al conectar con el servidor.";
        errorBox.style.display = "block";
      });
  });
}

function cerrarSesion() {
  fetch("../auth/logout.php")
    .catch((error) => console.error("Error al cerrar sesión:", error))
    .finally(() => {
      loadSection("login");
    });
}

>>>>>>> parent of 91730b2 (update)
function loginAs(role) {
  if (role === "requester") {
    alert("Logged in as Requester. Redirecting to active requests...");
    loadSection("myrequest");
  } else if (role === "donor") {
    alert("Logged in as Donor. Redirecting to explore requests...");
    loadSection("request");
  } else {
    loadSection("home");
  }
}

const storiesData = {
  "anna-usulutan": {  },
  "maura-tacuba": { },
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
<<<<<<< HEAD
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
      type: "High Priority Needs",
      desc: "Serves daily lunches to elderly residents in San Salvador."
    },
    {
      coords: [13.9942, -89.5597],
      title: "Centro Parroquial Santa Ana",
      type: "Active Collection Point",
      desc: "Receiving dry grains for rural family distribution."
    },
    {
      coords: [13.3440, -88.1780],
      title: "Red Comunitaria Usulután",
      type: "Partner Church / NGO",
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
  }, 200);
}

=======
}
>>>>>>> parent of 91730b2 (update)
