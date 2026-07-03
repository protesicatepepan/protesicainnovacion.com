const TESTIMONIALS_KEY = 'protesica-testimonials';
const INITIAL_TESTIMONIALS = [
  {
    name: 'Ana G.',
    message: 'Me encantó la atención, el proceso fue claro y el resultado se ve muy natural. Lo recomiendo mucho.',
    rating: 5
  },
  {
    name: 'Luis R.',
    message: 'La precisión de la prótesis fue increíble. Me sentí acompañado en cada paso y el ajuste fue perfecto.',
    rating: 5
  },
  {
    name: 'Carmen P.',
    message: 'Muy profesional, humano y con tecnología moderna. La mejora en mi sonrisa fue inmediata.',
    rating: 5
  }
];

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getTestimonials() {
  try {
    const stored = localStorage.getItem(TESTIMONIALS_KEY);
    if (!stored) {
      localStorage.setItem(TESTIMONIALS_KEY, JSON.stringify(INITIAL_TESTIMONIALS));
      return INITIAL_TESTIMONIALS;
    }

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : INITIAL_TESTIMONIALS;
  } catch (error) {
    return INITIAL_TESTIMONIALS;
  }
}

function saveTestimonials(testimonials) {
  localStorage.setItem(TESTIMONIALS_KEY, JSON.stringify(testimonials));
}

function renderTestimonials() {
  const list = document.getElementById('testimonials-list');
  if (!list) return;

  const testimonials = getTestimonials();
  list.innerHTML = testimonials
    .map((item) => {
      const stars = '★'.repeat(item.rating) + '☆'.repeat(5 - item.rating);
      return `
        <article class="testimonial-card">
          <div class="stars" aria-label="${item.rating} de 5 estrellas">${stars}</div>
          <p>“${escapeHtml(item.message)}”</p>
          <strong>— ${escapeHtml(item.name)}</strong>
        </article>
      `;
    })
    .join('');
}

document.addEventListener('DOMContentLoaded', () => {
  const year = new Date().getFullYear();
  const footer = document.querySelector('.footer p');

  if (footer) {
    footer.textContent += ` © ${year}`;
  }

  renderTestimonials();

  const form = document.getElementById('testimonial-form');
  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();

      const nameInput = document.getElementById('testimonial-name');
      const messageInput = document.getElementById('testimonial-message');
      const selectedRating = document.querySelector('input[name="rating"]:checked');

      if (!nameInput || !messageInput || !selectedRating) return;

      const newTestimonial = {
        name: nameInput.value.trim(),
        message: messageInput.value.trim(),
        rating: Number(selectedRating.value)
      };

      const currentTestimonials = [newTestimonial, ...getTestimonials()];
      saveTestimonials(currentTestimonials);
      renderTestimonials();
      form.reset();
    });
  }

  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();

      const clinic = document.getElementById('clinic-name')?.value.trim() || '';
      const dentist = document.getElementById('dentist-name')?.value.trim() || '';
      const email = document.getElementById('dentist-email')?.value.trim() || '';
      const phone = document.getElementById('contact-phone')?.value.trim() || '';
      const service = document.getElementById('contact-service')?.value || 'Servicio';
      const message = document.getElementById('contact-message')?.value.trim() || '';

      const whatsappMessage = `Hola, envío de caso clínico.%0A%0AClínica: ${encodeURIComponent(clinic)}%0AOdontólogo: ${encodeURIComponent(dentist)}%0AEmail: ${encodeURIComponent(email)}%0ATeléfono: ${encodeURIComponent(phone)}%0AServicio: ${encodeURIComponent(service)}%0ADetalles: ${encodeURIComponent(message)}`;
      window.open(`https://wa.me/525518547606?text=${whatsappMessage}`, '_blank', 'noopener');
      contactForm.reset();
    });
  }
});
