document.addEventListener("DOMContentLoaded", () => {
  loadSection("home");
});

//Asigna un rol al form de registro, ya sea "donor" o "requester"
let rolSeleccionado = null;

function loadRegister(rol) {
  rolSeleccionado = rol;
  loadSection("register");
}

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


const storiesData = {
  "anna-usulutan": {
    badge: "Impact Story • Berlín, Usulután",
    title:
      "Resilience in the Mountains of Usulután: Overcoming Food Insecurity",
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
    disclaimer:
      "This story is inspired by testimonies about the food security situation in the rural areas of Berlín, Usulután. The names and details have been adapted to respect privacy.",
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
    disclaimer:
      "This story is inspired by real testimonies of food security challenges in Ahuachapán, El Salvador. All names and identifying details have been modified for privacy.",
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

