const progressBar = document.querySelector(".scroll-progress span");
const navLinks = [...document.querySelectorAll(".nav-links a")];
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

function updatePageState() {
  const scrollable = document.documentElement.scrollHeight - innerHeight;
  const progress = scrollable > 0 ? scrollY / scrollable : 0;
  progressBar.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`;

  let current = "";
  sections.forEach((section) => {
    if (section.getBoundingClientRect().top <= 180) current = section.id;
  });
  navLinks.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${current}`);
  });
}

addEventListener("scroll", updatePageState, { passive: true });
updatePageState();

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll(".reveal").forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index % 3, 2) * 70}ms`;
  revealObserver.observe(element);
});

const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav-links");
menuToggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
});
navLinks.forEach((link) =>
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  })
);

const field = document.querySelector(".cube-field");
const cubeCount = 54;
for (let index = 0; index < cubeCount; index += 1) {
  const cube = document.createElement("span");
  cube.className = "cube";
  cube.dataset.index = index;
  field.append(cube);
}

const cubes = [...field.children];
let pointerActive = false;
let idleFrame = 0;

function animateCubes(x, y, force = 1) {
  const fieldRect = field.getBoundingClientRect();
  cubes.forEach((cube) => {
    if (getComputedStyle(cube).display === "none") return;
    const rect = cube.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const distance = Math.hypot(cx - x, cy - y);
    const radius = Math.max(fieldRect.width, fieldRect.height) * 0.23;
    const influence = Math.max(0, 1 - distance / radius) * force;
    cube.style.transform = `rotateX(${influence * 42}deg) rotateY(${-influence * 34}deg) translateZ(${influence * 26}px)`;
    cube.classList.toggle("is-hot", influence > 0.42);
  });
}

field.addEventListener("pointermove", (event) => {
  pointerActive = true;
  animateCubes(event.clientX, event.clientY);
});

field.addEventListener("pointerleave", () => {
  pointerActive = false;
  cubes.forEach((cube) => {
    cube.style.transform = "";
    cube.classList.remove("is-hot");
  });
});

field.addEventListener("click", (event) => {
  animateCubes(event.clientX, event.clientY, 1.35);
  setTimeout(() => {
    if (!pointerActive) field.dispatchEvent(new Event("pointerleave"));
  }, 420);
});

function idleWave() {
  if (!pointerActive && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    idleFrame += 0.012;
    const rect = field.getBoundingClientRect();
    const x = rect.left + ((Math.sin(idleFrame) + 1) / 2) * rect.width;
    const y = rect.top + ((Math.cos(idleFrame * 0.73) + 1) / 2) * rect.height;
    animateCubes(x, y, 0.72);
  }
  requestAnimationFrame(idleWave);
}
requestAnimationFrame(idleWave);

const toast = document.querySelector(".toast");
document.querySelector(".copy-email").addEventListener("click", async (event) => {
  const email = event.currentTarget.dataset.email;
  try {
    await navigator.clipboard.writeText(email);
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = email;
    document.body.append(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1800);
});

document.getElementById("year").textContent = String(new Date().getFullYear());
