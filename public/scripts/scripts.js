document.addEventListener("DOMContentLoaded", () => {
  loadSection("home");
});


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

  fetch(`${sectionName}.html` ,{ cache: 'no-store' })
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
        loadSection('login')
      })
      .catch((error) => {
        console.error("Error al registrar el usuario:", error);
        alert("Ocurrió un error al procesar el registro. Inténtalo de nuevo.");
      });
  });
}

function loginAs() {

  const formLogin = document.getElementById("formLogin");

  const formData = new FormData(formLogin);

  fetch("../auth/login.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      alert(data.message);

      if (data.status === 'success') {
        if (data.usuario.rol === 'donor') {
          location.href = "donorUser.html";
        } else if (data.usuario.rol === 'requester') {
          location.href = "neederUser.html";
        }
      }

    })
    .catch((error) => {
      console.error("Error al iniciar sesión:", error);
      alert("Ocurrió un error al procesar el inicio de sesión. Inténtalo de nuevo.");
    });

}

