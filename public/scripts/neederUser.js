document.addEventListener("DOMContentLoaded", () => {
  loadSection("homeNeeder");
  cargarFotoPerfil();
});

let historialSecciones = [];

function loadSection(sectionName, guardarEnHistorial = true) {
  const mainContent = document.getElementById("main-content");

  if (!mainContent) {
    console.error("Target container #main-content not found.");
    return;
  }

  if (guardarEnHistorial) {
    historialSecciones.push(sectionName);
  }

  fetch(`${sectionName}.html`, { cache: 'no-store' })
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

           } else if (sectionName === "inicioRequester") {
        initSolicitudForm();
      } else if (sectionName === "request") {
        cargarSolicitudes();
      } else if (sectionName === 'profile') {
        cargarDatosPerfil();

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

function volverAtras() {
  if (historialSecciones.length <= 1) {
    return;
  }
  historialSecciones.pop();
  const anterior = historialSecciones[historialSecciones.length - 1];
  loadSection(anterior, false);
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

function logoutUser() {
  fetch("../auth/logout.php", {
    method: "POST"
  })
    .then((response) => response.json())
    .then((data) => {
      window.location.href = "index.html";
    })
    .catch((error) => {
      console.error("Error al cerrar sesión:", error);
      window.location.href = "index.html";
    });
}

function cargarFotoPerfil() {
  const wrapper = document.getElementById("perfil-icono-wrapper");
  if (!wrapper) return;

  fetch("../auth/perfil.php", { cache: "no-store" })
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "success" && data.usuario.foto_perfil) {
        wrapper.innerHTML = `<img src="uploads/${data.usuario.foto_perfil}" alt="Perfil" class="rounded-circle" style="width: 40px; height: 40px; object-fit: cover;">`;
      }
    })
    .catch((error) => {
      console.error("Error al cargar foto de perfil:", error);
    });
}

function cargarDatosPerfil() {
  fetch("../auth/perfil.php", { cache: "no-store" })
    .then((response) => response.json())
    .then((data) => {
      if (data.status !== "success") return;

      const u = data.usuario;

      document.getElementById("perfil-nombre").textContent = u.nombre || "—";
      document.getElementById("perfil-rol").textContent = u.rol || "—";
      document.getElementById("perfil-email").textContent = u.email || "—";
      document.getElementById("perfil-telefono").textContent = u.telefono || "No especificado";
      document.getElementById("perfil-departamento").textContent = u.departamento || "No especificado";
      document.getElementById("perfil-distrito").textContent = u.distrito || "No especificado";

      if (u.foto_perfil) {
        const img = document.getElementById("perfil-foto-grande");
        img.src = `uploads/${u.foto_perfil}`;
        img.style.display = "inline-block";
        document.getElementById("perfil-icono-grande").style.display = "none";
      }
    })
    .catch((error) => {
      console.error("Error al cargar datos de perfil:", error);
    });
}