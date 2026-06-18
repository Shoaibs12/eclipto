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
    context.strokeStyle = "rgba(17,183,237,.18)";
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
    context.fillStyle = `rgba(95,216,255,${particle.alpha})`;
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
