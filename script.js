const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const eclipseScene = document.querySelector(".eclipse-scene");
document.querySelector(".hero").addEventListener("mousemove", (event) => {
  const x = (event.clientX / innerWidth - .5) * 34;
  const y = (event.clientY / innerHeight - .5) * 26;
  eclipseScene.style.setProperty("--mx", `${x}px`);
  eclipseScene.style.setProperty("--my", `${y}px`);
});
document.querySelector(".hero").addEventListener("mouseleave", () => {
  eclipseScene.style.setProperty("--mx", "0px");
  eclipseScene.style.setProperty("--my", "0px");
});

const splitTarget = document.querySelector(".split-reveal");
if (splitTarget) {
  splitTarget.innerHTML = splitTarget.textContent.trim().split(/\s+/).map((word) => `<span class="word">${word}</span>`).join(" ");
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add("in-view");
  });
}, { threshold: 0.14 });

document.querySelectorAll(".reveal, .system-window").forEach((element) => observer.observe(element));

const wordObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.querySelectorAll(".word").forEach((word, index) => {
      setTimeout(() => word.classList.add("visible"), index * 38);
    });
    wordObserver.unobserve(entry.target);
  });
}, { threshold: .35 });
if (splitTarget) wordObserver.observe(splitTarget);

const progress = document.querySelector(".scroll-progress span");
const cards = [...document.querySelectorAll(".service-card")];

addEventListener("scroll", () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.width = `${max > 0 ? (scrollY / max) * 100 : 0}%`;

  cards.forEach((card, index) => {
    const rect = card.getBoundingClientRect();
    const passed = Math.max(0, Math.min(1, (innerHeight * .15 - rect.top) / innerHeight));
    card.style.transform = `scale(${1 - passed * (cards.length - index) * .012})`;
  });
}, { passive: true });

document.querySelectorAll(".magnetic").forEach((element) => {
  if (reducedMotion) return;
  element.addEventListener("mousemove", (event) => {
    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    element.style.transform = `translate(${x * .12}px, ${y * .12}px)`;
  });
  element.addEventListener("mouseleave", () => element.style.transform = "");
});

const canvas = document.querySelector("#hero-canvas");
const context = canvas.getContext("2d");
let particles = [];

function sizeCanvas() {
  const ratio = Math.min(devicePixelRatio, 2);
  canvas.width = innerWidth * ratio;
  canvas.height = innerHeight * ratio;
  canvas.style.width = `${innerWidth}px`;
  canvas.style.height = `${innerHeight}px`;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  particles = Array.from({ length: innerWidth < 700 ? 38 : 75 }, () => ({
    x: Math.random() * innerWidth,
    y: Math.random() * innerHeight,
    r: Math.random() * 1.7 + .2,
    vx: (Math.random() - .5) * .15,
    vy: (Math.random() - .5) * .15,
    alpha: Math.random() * .55 + .1
  }));
}

function drawCanvas() {
  context.clearRect(0, 0, innerWidth, innerHeight);
  const centerX = innerWidth * .57;
  const centerY = innerHeight * .42;
  const radius = Math.min(innerWidth, innerHeight) * .3;

  context.save();
  context.translate(centerX, centerY);
    context.strokeStyle = "rgba(56, 128, 135, 0.2)";
  context.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    context.beginPath();
    context.ellipse(0, 0, radius * (1 - i * .16), radius * .34, i * .58 + scrollY * .00012, 0, Math.PI * 2);
    context.stroke();
  }
  context.restore();

  particles.forEach((particle) => {
    particle.x += particle.vx;
    particle.y += particle.vy;
    if (particle.x < 0) particle.x = innerWidth;
    if (particle.x > innerWidth) particle.x = 0;
    if (particle.y < 0) particle.y = innerHeight;
    if (particle.y > innerHeight) particle.y = 0;
    context.beginPath();
    context.fillStyle = `rgba(111, 179, 184, ${particle.alpha * 0.75})`;
    context.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
    context.fill();
  });
  requestAnimationFrame(drawCanvas);
}

sizeCanvas();
drawCanvas();
addEventListener("resize", sizeCanvas);

const mobileMenu = document.querySelector(".menu-button");
mobileMenu.addEventListener("click", () => {
  const open = mobileMenu.getAttribute("aria-expanded") === "true";
  mobileMenu.setAttribute("aria-expanded", String(!open));
  document.querySelector(".desktop-nav").classList.toggle("mobile-open", !open);
});

const contactForm = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");

contactForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const submitButton = contactForm.querySelector('button[type="submit"]');
  const formData = new FormData(contactForm);
  const payload = Object.fromEntries(formData.entries());

  formStatus.className = "form-status";
  formStatus.textContent = "Sending your project details securely…";
  submitButton.disabled = true;

  try {
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || "Unable to send your message.");

    contactForm.reset();
    formStatus.classList.add("success");
    formStatus.textContent = "Message received. Eclipto will respond within 24 hours.";
  } catch (error) {
    formStatus.classList.add("error");
    formStatus.textContent = `${error.message} You can also email eclipto.in@gmail.com.`;
  } finally {
    submitButton.disabled = false;
  }
});

/* ==========================================================================
   Projects / Portfolio Data & Dynamic Rendering
   ========================================================================== */
const projects = [
  {
    id: "atiger-global",
    name: "ATiger Global",
    category: "Recruitment & Workforce Platform",
    projectType: "Business / Recruitment Platform",
    description: "A modern digital platform designed for recruitment and workforce solutions, connecting job seekers, employers, and business partners through streamlined online experiences.",
    services: [
      "UI/UX Design",
      "Full-Stack Web Development",
      "Candidate Registration",
      "Employer Workflows",
      "Recruitment Platform",
      "Responsive Web Development"
    ],
    cardTags: ["UI/UX", "Full-Stack", "Recruitment"],
    overview: "A modern recruitment and workforce platform built to provide a streamlined digital experience for job seekers, employers, and business partners.",
    ourWork: [
      "UI/UX Design",
      "Frontend Development",
      "Backend Development",
      "Responsive Design",
      "Recruitment Workflow"
    ],
    urlSlug: "atigerglobal.com",
    poster: "assets/projects/atiger-hero-poster.jpg",
    previewVideo: "assets/projects/atiger-preview.mp4",
    modalVideo: "assets/projects/atiger-preview.mp4"
  },
  {
    id: "devine-homz",
    name: "Devine Homz",
    category: "Real Estate & Property Platform",
    projectType: "Real Estate / Property Platform",
    description: "A modern real-estate platform designed to help users discover properties, explore listings, connect with property owners, and access relevant real-estate services.",
    services: [
      "UI/UX Design",
      "Full-Stack Web Development",
      "Property Listings",
      "Property Search & Discovery",
      "Seller / Rental Sections",
      "Contact & WhatsApp Integration",
      "Responsive Web Development"
    ],
    cardTags: ["UI/UX", "Full-Stack", "Real Estate"],
    overview: "A modern real-estate platform focused on property discovery, listings, and direct user engagement.",
    ourWork: [
      "UI/UX Design",
      "Frontend Development",
      "Backend Development",
      "Property Listing Experience",
      "Responsive Design",
      "Contact Integration"
    ],
    urlSlug: "devinehomz.com",
    poster: "assets/projects/devine-hero-poster.jpg",
    previewVideo: "assets/projects/devine-preview.mp4",
    modalVideo: "assets/projects/devine-preview.mp4"
  }
];

function initProjects() {
  const grid = document.querySelector("#projects-grid");
  const modal = document.querySelector("#project-modal");
  const modalContent = document.querySelector("#modal-content");
  const modalClose = document.querySelector("#modal-close");
  const modalBackdrop = document.querySelector("#modal-backdrop");
  if (!grid) return;

  grid.innerHTML = projects.map((project) => `
    <article class="project-card reveal" data-project-id="${project.id}" tabindex="0" role="button" aria-haspopup="dialog" aria-label="View case study for ${project.name}">
      <div class="project-card-media">
        <div class="project-window-bar" aria-hidden="true">
          <div class="project-window-dots"><span></span><span></span><span></span></div>
          <p class="project-window-url">eclipto.in / projects / ${project.urlSlug}</p>
          <span class="project-window-badge">PREVIEW</span>
        </div>
        <video class="project-card-video"
          poster="${project.poster}"
          playsinline
          muted
          loop
          preload="none"
          data-src="${project.previewVideo}"
          aria-label="${project.name} live platform preview"></video>
        <div class="project-preview-pill" aria-hidden="true">
          <span>▶</span> PREVIEW
        </div>
      </div>

      <div class="project-card-body">
        <div class="project-category">${project.category}</div>
        <h3 class="project-card-title">${project.name}</h3>
        <p class="project-card-desc">${project.description}</p>
        <div class="project-tags">
          ${project.cardTags.map(tag => `<span class="project-tag">${tag}</span>`).join("")}
        </div>
        <div class="project-card-footer">
          <span class="project-view-btn magnetic">
            View Project <span>→</span>
          </span>
        </div>
      </div>
    </article>
  `).join("");

  // Re-observe dynamic cards for reveal animation
  grid.querySelectorAll(".project-card").forEach((card) => {
    observer.observe(card);
  });

  // Re-attach magnetic handlers to new buttons
  if (!reducedMotion) {
    grid.querySelectorAll(".magnetic").forEach((element) => {
      element.addEventListener("mousemove", (event) => {
        const rect = element.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        element.style.transform = `translate(${x * .12}px, ${y * .12}px)`;
      });
      element.addEventListener("mouseleave", () => element.style.transform = "");
    });
  }

  // Video lazy loading & hover playback
  const projectCards = grid.querySelectorAll(".project-card");
  
  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const video = entry.target.querySelector("video");
      if (!video) return;
      if (entry.isIntersecting) {
        if (!video.src && video.dataset.src) {
          video.src = video.dataset.src;
        }
        if (window.innerWidth <= 768 && !reducedMotion) {
          video.play().catch(() => {});
        }
      } else {
        video.pause();
      }
    });
  }, { threshold: 0.25 });

  projectCards.forEach((card) => {
    videoObserver.observe(card);

    const video = card.querySelector("video");
    const playVideo = () => {
      if (reducedMotion || !video) return;
      if (!video.src && video.dataset.src) {
        video.src = video.dataset.src;
      }
      video.play().catch(() => {});
    };
    const pauseVideo = () => {
      if (window.innerWidth > 768 && video) {
        video.pause();
      }
    };

    card.addEventListener("mouseenter", playVideo);
    card.addEventListener("mouseleave", pauseVideo);
    card.addEventListener("focus", playVideo);
    card.addEventListener("blur", pauseVideo);

    card.addEventListener("click", () => {
      openModal(card.dataset.projectId, card);
    });

    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openModal(card.dataset.projectId, card);
      }
    });
  });

  let previousActiveElement = null;

  function openModal(projectId, triggerCard) {
    const project = projects.find((p) => p.id === projectId);
    if (!project || !modal || !modalContent) return;

    previousActiveElement = triggerCard || document.activeElement;

    modalContent.innerHTML = `
      <div class="modal-meta-top">
        <span class="modal-badge">ECLIPTO PORTFOLIO / CLIENT CASE STUDY</span>
        <span class="modal-type-badge">${project.projectType}</span>
      </div>

      <div class="modal-media-frame">
        <div class="project-window-bar" aria-hidden="true">
          <div class="project-window-dots"><span></span><span></span><span></span></div>
          <p class="project-window-url">eclipto.in / client-work / ${project.urlSlug}</p>
          <span class="project-window-badge">RECORDING</span>
        </div>
        <video class="modal-video"
          src="${project.modalVideo}"
          poster="${project.poster}"
          controls
          playsinline
          preload="auto"
          autoplay
          muted
          aria-label="${project.name} client screen recording"></video>
      </div>

      <div class="modal-details-grid">
        <div class="modal-left">
          <h2 id="modal-project-title">${project.name}</h2>
          <p class="modal-category-text">Category: ${project.category}</p>
          <div class="modal-section-title">Overview</div>
          <p class="modal-overview">${project.overview}</p>
          <div class="modal-action-row">
            <a class="modal-cta-btn magnetic" href="#contact">
              Start a project with Eclipto <span>↗</span>
            </a>
          </div>
        </div>

        <div class="modal-right">
          <div>
            <div class="modal-section-title">Our Work</div>
            <ul class="modal-work-list">
              ${project.ourWork.map((work) => `<li class="modal-work-item">${work}</li>`).join("")}
            </ul>
          </div>
          <div>
            <div class="modal-section-title">Services Delivered</div>
            <div class="modal-services-cloud">
              ${project.services.map((service) => `<span class="modal-service-pill">${service}</span>`).join("")}
            </div>
          </div>
        </div>
      </div>
    `;

    if (!reducedMotion) {
      modalContent.querySelectorAll(".magnetic").forEach((element) => {
        element.addEventListener("mousemove", (event) => {
          const rect = element.getBoundingClientRect();
          const x = event.clientX - rect.left - rect.width / 2;
          const y = event.clientY - rect.top - rect.height / 2;
          element.style.transform = `translate(${x * .12}px, ${y * .12}px)`;
        });
        element.addEventListener("mouseleave", () => element.style.transform = "");
      });
    }

    const modalCta = modalContent.querySelector(".modal-cta-btn");
    if (modalCta) {
      modalCta.addEventListener("click", () => {
        closeModal();
      });
    }

    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    modalClose?.focus();
  }

  function closeModal() {
    if (!modal) return;
    const modalVideo = modal.querySelector(".modal-video");
    if (modalVideo) {
      modalVideo.pause();
    }
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    if (previousActiveElement && typeof previousActiveElement.focus === "function") {
      previousActiveElement.focus();
    }
  }

  modalClose?.addEventListener("click", closeModal);
  modalBackdrop?.addEventListener("click", closeModal);

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal?.classList.contains("active")) {
      closeModal();
    }
  });
}

initProjects();
