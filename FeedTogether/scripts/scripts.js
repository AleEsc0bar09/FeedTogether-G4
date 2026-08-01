document.addEventListener("DOMContentLoaded", () => {
  loadSection("home");
});

function loadSection(sectionName) {
  const mainContent = document.getElementById("main-content");

  if (!mainContent) {
    console.error("Target container #main-content not found.");
    return;
  }

  fetch(`public/${sectionName}.html`)
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
function loadStoryDetail(storyKey) {
  loadSection("stories_details");

  setTimeout(() => {
    const title = document.getElementById("detail-story-title");
    const img = document.getElementById("detail-story-img");

    if (storyKey === "surplus-recovery" && title && img) {
      title.innerText = "Surplus Recovery Initiative in Local Markets";
      img.src = "img/Food recovery.jpg";
    }
  }, 50);
}