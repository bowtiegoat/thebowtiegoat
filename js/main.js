/**
 * Shared site behavior: mobile nav toggle, "Client Portal" dropdown,
 * and the homepage testimonial slider. No dependencies, no build step.
 */
document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initDropdowns();
  initTestimonialSlider();
});

function initMobileMenu() {
  const toggle = document.querySelector('[data-mobile-toggle]');
  const panel = document.querySelector('[data-mobile-panel]');
  if (!toggle || !panel) return;

  toggle.addEventListener('click', () => {
    const isOpen = panel.getAttribute('data-open') === 'true';
    panel.setAttribute('data-open', String(!isOpen));
    toggle.setAttribute('aria-expanded', String(!isOpen));
  });
}

function initDropdowns() {
  const dropdowns = document.querySelectorAll('[data-dropdown]');

  dropdowns.forEach((dropdown) => {
    const trigger = dropdown.querySelector('[data-dropdown-trigger]');
    const panel = dropdown.querySelector('[data-menu-panel]');
    if (!trigger || !panel) return;

    trigger.addEventListener('click', (event) => {
      event.stopPropagation();
      const isOpen = panel.getAttribute('data-open') === 'true';

      // Close any other open dropdowns first
      document.querySelectorAll('[data-menu-panel][data-open="true"]').forEach((p) => {
        if (p !== panel) p.setAttribute('data-open', 'false');
      });

      panel.setAttribute('data-open', String(!isOpen));
      trigger.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  // Close open dropdowns when clicking outside, or on Escape
  document.addEventListener('click', () => {
    document.querySelectorAll('[data-menu-panel][data-open="true"]').forEach((p) => {
      p.setAttribute('data-open', 'false');
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      document.querySelectorAll('[data-menu-panel][data-open="true"]').forEach((p) => {
        p.setAttribute('data-open', 'false');
      });
    }
  });
}

function initTestimonialSlider() {
  const root = document.querySelector('[data-testimonial-slider]');
  if (!root) return;

  const slides = Array.from(root.querySelectorAll('[data-slide]'));
  const dots = Array.from(root.querySelectorAll('[data-slide-dot]'));
  const prevBtn = root.querySelector('[data-slide-prev]');
  const nextBtn = root.querySelector('[data-slide-next]');
  let current = 0;
  let autoplayId = null;

  function show(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.setAttribute('data-active', String(i === current)));
    dots.forEach((dot, i) => {
      dot.classList.toggle('bg-blue-500', i === current);
      dot.classList.toggle('bg-slate-300', i !== current);
    });
  }

  function startAutoplay() {
    autoplayId = window.setInterval(() => show(current + 1), 6000);
  }

  function stopAutoplay() {
    if (autoplayId) window.clearInterval(autoplayId);
  }

  prevBtn?.addEventListener('click', () => { show(current - 1); stopAutoplay(); startAutoplay(); });
  nextBtn?.addEventListener('click', () => { show(current + 1); stopAutoplay(); startAutoplay(); });
  dots.forEach((dot, i) => dot.addEventListener('click', () => { show(i); stopAutoplay(); startAutoplay(); }));

  root.addEventListener('mouseenter', stopAutoplay);
  root.addEventListener('mouseleave', startAutoplay);

  show(0);
  startAutoplay();
}
