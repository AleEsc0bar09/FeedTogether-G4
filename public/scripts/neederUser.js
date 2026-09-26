document.addEventListener("DOMContentLoaded", () => {
  loadSection("homeNeeder");
});

function loadSection(sectionName) {
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

      if (sectionName === "map") {
        initNeedsMap();
      }
    })
    .catch((error) => {
      console.error("Error loading dynamic section:", error);
      mainContent.innerHTML = `
        <div class="alert alert-danger my-4" role="alert">
          <h4 class="alert-heading">Section Error</h4>
          <p>Could not load requested content (${sectionName}.html).</p>
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

function initNeedsMap() {
  const mapElement = document.getElementById("mapa-sv");
  if (!mapElement) return;

  const map = L.map("mapa-sv").setView([13.6929, -89.2182], 9);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "© OpenStreetMap"
  }).addTo(map);

  setTimeout(() => {
    map.invalidateSize();
  }, 200);
}