(() => {
  const PASSWORD = "yousrapasscode123";
  const STORAGE_KEY = "portfolioDataV1";
  const ADMIN_KEY = "portfolioAdmin";

  const adminToggle = document.getElementById("adminToggle");
  const adminPanel = document.getElementById("adminPanel");
  const adminProjects = document.getElementById("adminProjects");
  const adminSkillsList = document.getElementById("adminSkillsList");
  const adminSkillInput = document.getElementById("adminSkillInput");
  const adminSkillAdd = document.getElementById("adminSkillAdd");
  const adminSave = document.getElementById("adminSave");
  const adminReset = document.getElementById("adminReset");
  const adminLogout = document.getElementById("adminLogout");

  const skillsList = document.getElementById("skillsList");
  const projectSections = [...document.querySelectorAll(".project[data-project-id]")];

  const DEFAULT_DATA = readFromDom();

  const saved = loadSavedData();
  if (saved) {
    applyData(saved);
  }

  if (sessionStorage.getItem(ADMIN_KEY) === "1") {
    openAdmin();
  }

  adminToggle.addEventListener("click", () => {
    if (sessionStorage.getItem(ADMIN_KEY) === "1") {
      toggleAdmin();
      return;
    }

    const input = window.prompt("Enter admin password");
    if (!input) {
      return;
    }
    if (input !== PASSWORD) {
      window.alert("Incorrect password.");
      return;
    }

    sessionStorage.setItem(ADMIN_KEY, "1");
    openAdmin();
  });

  adminSkillAdd.addEventListener("click", () => {
    const value = adminSkillInput.value.trim();
    if (!value) {
      return;
    }
    const li = document.createElement("li");
    li.textContent = value;
    skillsList.appendChild(li);
    adminSkillInput.value = "";
    buildAdminSkills();
  });

  adminSave.addEventListener("click", () => {
    const data = readFromDom();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.alert("Saved to this browser.");
  });

  adminReset.addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEY);
    applyData(DEFAULT_DATA);
    buildAdminProjects();
    buildAdminSkills();
    window.alert("Reset to default.");
  });

  adminLogout.addEventListener("click", () => {
    sessionStorage.removeItem(ADMIN_KEY);
    closeAdmin();
  });

  adminPanel.addEventListener("click", (event) => {
    if (event.target === adminPanel) {
      closeAdmin();
    }
  });

  function toggleAdmin() {
    if (adminPanel.hidden) {
      openAdmin();
    } else {
      closeAdmin();
    }
  }

  function openAdmin() {
    adminPanel.hidden = false;
    buildAdminProjects();
    buildAdminSkills();
  }

  function closeAdmin() {
    adminPanel.hidden = true;
  }

  function loadSavedData() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw);
    } catch (error) {
      return null;
    }
  }

  function readFromDom() {
    return {
      skills: [...skillsList.querySelectorAll("li")].map((li) => li.textContent.trim()).filter(Boolean),
      projects: projectSections.map((section) => {
        const title = section.querySelector(".project-head h2");
        const desc = section.querySelector(".project-head p");
        const linkEl = section.querySelector("[data-project-link]");
        const images = [...section.querySelectorAll("img")].map((img) => ({
          src: img.getAttribute("src") || "",
          alt: img.getAttribute("alt") || "",
          hidden: img.hasAttribute("data-hidden")
        }));

        return {
          id: section.dataset.projectId,
          title: title ? title.textContent.trim() : "",
          description: desc ? desc.textContent.trim() : "",
          link: linkEl && !linkEl.hasAttribute("hidden") ? linkEl.getAttribute("href") || "" : "",
          images
        };
      })
    };
  }

  function applyData(data) {
    if (!data) {
      return;
    }

    if (Array.isArray(data.skills)) {
      skillsList.innerHTML = "";
      data.skills.forEach((skill) => {
        const li = document.createElement("li");
        li.textContent = skill;
        skillsList.appendChild(li);
      });
    }

    if (Array.isArray(data.projects)) {
      data.projects.forEach((project) => {
        const section = projectSections.find((item) => item.dataset.projectId === project.id);
        if (!section) {
          return;
        }
        const title = section.querySelector(".project-head h2");
        const desc = section.querySelector(".project-head p");
        const linkEl = section.querySelector("[data-project-link]");
        if (title && project.title) {
          title.textContent = project.title;
        }
        if (desc && project.description) {
          desc.textContent = project.description;
        }
        if (linkEl) {
          if (project.link) {
            linkEl.setAttribute("href", project.link);
            linkEl.hidden = false;
          } else {
            linkEl.hidden = true;
          }
        }

        const images = [...section.querySelectorAll("img")];
        if (Array.isArray(project.images)) {
          images.forEach((img, index) => {
            const payload = project.images[index];
            if (!payload) {
              return;
            }
            if (payload.src) {
              img.setAttribute("src", payload.src);
            }
            img.setAttribute("alt", payload.alt || "");
            if (payload.hidden) {
              img.setAttribute("data-hidden", "true");
              img.style.display = "none";
            } else {
              img.removeAttribute("data-hidden");
              img.style.display = "";
            }
          });
        }
      });
    }
  }

  function buildAdminProjects() {
    adminProjects.innerHTML = "";
    projectSections.forEach((section, index) => {
      const title = section.querySelector(".project-head h2");
      const desc = section.querySelector(".project-head p");
      const linkEl = section.querySelector("[data-project-link]");
      const images = [...section.querySelectorAll("img")];

      const card = document.createElement("div");
      card.className = "admin-project-card";

      const heading = document.createElement("h4");
      heading.textContent = `${index + 1}. ${title ? title.textContent.trim() : "Project"}`;
      card.appendChild(heading);

      const titleInput = createInput("Title", title ? title.textContent.trim() : "");
      titleInput.input.addEventListener("input", (event) => {
        if (title) {
          title.textContent = event.target.value;
        }
        heading.textContent = `${index + 1}. ${event.target.value || "Project"}`;
      });
      card.appendChild(titleInput.wrap);

      const descInput = createTextarea("Description", desc ? desc.textContent.trim() : "");
      descInput.input.addEventListener("input", (event) => {
        if (desc) {
          desc.textContent = event.target.value;
        }
      });
      card.appendChild(descInput.wrap);

      const linkInput = createInput("Project link (optional)", linkEl && !linkEl.hidden ? linkEl.getAttribute("href") || "" : "");
      linkInput.input.addEventListener("input", (event) => {
        if (!linkEl) {
          return;
        }
        const value = event.target.value.trim();
        if (value) {
          linkEl.setAttribute("href", value);
          linkEl.hidden = false;
        } else {
          linkEl.hidden = true;
        }
      });
      card.appendChild(linkInput.wrap);

      const imageList = document.createElement("div");
      imageList.className = "admin-image-list";
      images.forEach((img, imgIndex) => {
        const row = document.createElement("div");
        row.className = "admin-image-row";

        const label = document.createElement("div");
        label.className = "admin-image-label";
        label.textContent = `Image ${imgIndex + 1}`;
        row.appendChild(label);

        const urlInput = document.createElement("input");
        urlInput.type = "text";
        urlInput.value = img.getAttribute("src") || "";
        urlInput.addEventListener("input", (event) => {
          img.setAttribute("src", event.target.value);
        });
        row.appendChild(urlInput);

        const altInput = document.createElement("input");
        altInput.type = "text";
        altInput.value = img.getAttribute("alt") || "";
        altInput.placeholder = "Alt text";
        altInput.addEventListener("input", (event) => {
          img.setAttribute("alt", event.target.value);
        });
        row.appendChild(altInput);

        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "image/*";
        fileInput.addEventListener("change", (event) => {
          const file = event.target.files[0];
          if (!file) {
            return;
          }
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result;
            if (typeof result === "string") {
              urlInput.value = result;
              img.setAttribute("src", result);
            }
          };
          reader.readAsDataURL(file);
        });
        row.appendChild(fileInput);

        const hideToggle = document.createElement("label");
        hideToggle.className = "admin-toggle-row";
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = img.hasAttribute("data-hidden");
        checkbox.addEventListener("change", (event) => {
          if (event.target.checked) {
            img.setAttribute("data-hidden", "true");
            img.style.display = "none";
          } else {
            img.removeAttribute("data-hidden");
            img.style.display = "";
          }
        });
        const span = document.createElement("span");
        span.textContent = "Hide image";
        hideToggle.appendChild(checkbox);
        hideToggle.appendChild(span);
        row.appendChild(hideToggle);

        imageList.appendChild(row);
      });
      card.appendChild(imageList);

      adminProjects.appendChild(card);
    });
  }

  function buildAdminSkills() {
    adminSkillsList.innerHTML = "";
    [...skillsList.querySelectorAll("li")].forEach((li) => {
      const item = document.createElement("li");
      const text = document.createElement("span");
      text.textContent = li.textContent;
      const remove = document.createElement("button");
      remove.type = "button";
      remove.textContent = "Remove";
      remove.addEventListener("click", () => {
        li.remove();
        buildAdminSkills();
      });
      item.appendChild(text);
      item.appendChild(remove);
      adminSkillsList.appendChild(item);
    });
  }

  function createInput(label, value) {
    const wrap = document.createElement("label");
    wrap.className = "admin-field";
    const span = document.createElement("span");
    span.textContent = label;
    const input = document.createElement("input");
    input.type = "text";
    input.value = value;
    wrap.appendChild(span);
    wrap.appendChild(input);
    return { wrap, input };
  }

  function createTextarea(label, value) {
    const wrap = document.createElement("label");
    wrap.className = "admin-field";
    const span = document.createElement("span");
    span.textContent = label;
    const input = document.createElement("textarea");
    input.rows = 3;
    input.value = value;
    wrap.appendChild(span);
    wrap.appendChild(input);
    return { wrap, input };
  }
})();
