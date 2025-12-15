const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const header = document.querySelector("header");
const navToggle = $("#navToggle");
const mobileNav = $("#mobileNav");
const backToTopBtn = $("#backToTop");
const yearSpan = $("#year");

// Get header height (sticky header offset)
const getHeaderOffset = () => (header ? header.getBoundingClientRect().height : 0);

// ===========================
// Mobile Nav Toggle + Accessibility
// ===========================
function openMobileNav() {
  if (!mobileNav) return;
  mobileNav.classList.remove("hidden");
  navToggle?.setAttribute("aria-expanded", "true");
}

function closeMobileNav() {
  if (!mobileNav) return;
  mobileNav.classList.add("hidden");
  navToggle?.setAttribute("aria-expanded", "false");
}

function toggleMobileNav() {
  if (!mobileNav) return;
  const isHidden = mobileNav.classList.contains("hidden");
  isHidden ? openMobileNav() : closeMobileNav();
}

// Init aria attrs
if (navToggle) {
  navToggle.setAttribute("aria-controls", "mobileNav");
  navToggle.setAttribute("aria-expanded", "false");
}

navToggle?.addEventListener("click", (e) => {
  e.stopPropagation();
  toggleMobileNav();
});

// Close mobile nav on outside click
document.addEventListener("click", (e) => {
  if (!mobileNav || !navToggle) return;
  const clickedInsideNav = mobileNav.contains(e.target);
  const clickedToggle = navToggle.contains(e.target);

  if (!mobileNav.classList.contains("hidden") && !clickedInsideNav && !clickedToggle) {
    closeMobileNav();
  }
});

// Close mobile nav on ESC
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && mobileNav && !mobileNav.classList.contains("hidden")) {
    closeMobileNav();
  }
});

// Close mobile nav when resizing to desktop
window.addEventListener("resize", () => {
  if (window.innerWidth >= 768) closeMobileNav();
});

// ===========================
// Smooth Scroll with Header Offset
// ===========================
function scrollToTarget(targetEl) {
  const offset = getHeaderOffset() + 12; // small breathing space
  const y = targetEl.getBoundingClientRect().top + window.pageYOffset - offset;
  window.scrollTo({ top: y, behavior: "smooth" });
}

$$('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", function (e) {
    const targetId = this.getAttribute("href");
    if (!targetId || targetId === "#") return;

    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      e.preventDefault();
      scrollToTarget(targetElement);

      // close mobile nav after clicking a link
      if (mobileNav && !mobileNav.classList.contains("hidden")) closeMobileNav();
    }
  });
});

// ===========================
// Back-to-top Button
// ===========================
if (backToTopBtn) {
  let ticking = false;

  const onScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        if (window.scrollY > 350) backToTopBtn.classList.remove("hidden");
        else backToTopBtn.classList.add("hidden");
        ticking = false;
      });
      ticking = true;
    }
  };

  window.addEventListener("scroll", onScroll, { passive: true });

  backToTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// ===========================
// Dynamic Year
// ===========================
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

// ===========================
// Active Section Highlight (Desktop + Mobile)
// ===========================
// Works if your nav links are like href="#mission", etc.
const sectionIds = ["#mission", "#directors", "#about", "#impact", "#contact"];
const allNavLinks = $$('a[href^="#"]').filter((a) => sectionIds.includes(a.getAttribute("href")));

function setActiveLink(id) {
  allNavLinks.forEach((a) => {
    const isActive = a.getAttribute("href") === id;

    // "active" style (Tailwind classes). Safe to add/remove.
    a.classList.toggle("bg-white/10", isActive);         // good for header links
    a.classList.toggle("font-semibold", isActive);
    a.classList.toggle("ring-1", isActive);
    a.classList.toggle("ring-white/20", isActive);
  });
}

const sections = sectionIds
  .map((id) => document.querySelector(id))
  .filter(Boolean);

if (sections.length) {
  const spy = new IntersectionObserver(
    (entries) => {
      // Choose the most visible active section
      const visible = entries
        .filter((en) => en.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (visible?.target?.id) setActiveLink(`#${visible.target.id}`);
    },
    {
      root: null,
      threshold: [0.18, 0.25, 0.35, 0.5, 0.7],
      // offset for sticky header
      rootMargin: `-${Math.round(getHeaderOffset())}px 0px -60% 0px`,
    }
  );

  sections.forEach((sec) => spy.observe(sec));
}

// ===========================
// Optional Premium Touch: Header shrink on scroll
// ===========================
if (header) {
  let last = 0;
  window.addEventListener(
    "scroll",
    () => {
      const now = window.scrollY || 0;
      const goingDown = now > last;
      last = now;

      // Add a subtle compact feel after scrolling a bit
      if (now > 20) {
        header.classList.add("backdrop-blur", "bg-opacity-95");
        header.classList.add("shadow");
      } else {
        header.classList.remove("backdrop-blur", "bg-opacity-95");
      }

      // (Optional) You can add more behavior if you want hide/show on scroll
      // but keeping it simple for now.
    },
    { passive: true }
  );
}