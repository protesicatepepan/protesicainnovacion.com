const TESTIMONIALS_KEY = 'protesica-testimonials';
const SUPABASE_URL = 'https://phjdvqofrbhmimuidthv.supabase.co';
const SUPABASE_KEY = 'sb_publishable_r4WpLMu7yjXKAMZzOM9YTg_py2mXwD7';
const TESTIMONIALS_ENDPOINT = `${SUPABASE_URL}/rest/v1/testimonials`;
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

function renderTestimonials(testimonials) {
  const list = document.getElementById('testimonials-list');
  if (!list) return;

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

async function getSharedTestimonials() {
  const response = await fetch(
    `${TESTIMONIALS_ENDPOINT}?select=name,message,rating,created_at&order=created_at.desc`,
    {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Supabase respondió con ${response.status}`);
  }

  return response.json();
}

async function saveSharedTestimonial(testimonial) {
  const response = await fetch(TESTIMONIALS_ENDPOINT, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal'
    },
    body: JSON.stringify(testimonial)
  });

  if (!response.ok) {
    throw new Error(`Supabase respondió con ${response.status}`);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const year = new Date().getFullYear();
  const footer = document.querySelector('.footer p');
  const nav = document.querySelector('.nav');
  const navToggle = document.getElementById('nav-toggle');

  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  document.querySelectorAll('.nav-links a').forEach((link) => {
    link.addEventListener('click', () => {
      if (nav) {
        nav.classList.remove('is-open');
      }
      if (navToggle) {
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  });

  if (footer) {
    footer.textContent += ` © ${year}`;
  }

  let sharedTestimonials = [];
  const list = document.getElementById('testimonials-list');
  const status = document.getElementById('testimonial-status');

  getSharedTestimonials()
    .then((testimonials) => {
      sharedTestimonials = testimonials;
      renderTestimonials(sharedTestimonials);
    })
    .catch(() => {
      sharedTestimonials = getTestimonials();
      renderTestimonials(sharedTestimonials);
      if (status) {
        status.textContent = 'No se pudieron cargar las reseñas compartidas.';
      }
    });

  const form = document.getElementById('testimonial-form');
  if (form) {
    const ratingOptions = [...form.querySelectorAll('.rating-option')];

    ratingOptions.forEach((option) => {
      const input = option.querySelector('input');
      if (!input) return;

      input.addEventListener('change', () => {
        const selectedRating = Number(input.value);
        ratingOptions.forEach((ratingOption) => {
          const ratingInput = ratingOption.querySelector('input');
          ratingOption.classList.toggle(
            'is-selected',
            Number(ratingInput?.value) <= selectedRating
          );
        });
      });
    });

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

      const whatsappMessage = [
        'Nueva calificación para Protesica Tepepan',
        `Nombre: ${newTestimonial.name}`,
        `Calificación: ${newTestimonial.rating}/5`,
        `Comentario: ${newTestimonial.message}`
      ].join('\n');

      window.open(
        `https://wa.me/525518547606?text=${encodeURIComponent(whatsappMessage)}`,
        '_blank',
        'noopener'
      );

      if (status) {
        status.textContent = 'Guardando tu comentario...';
      }

      saveSharedTestimonial(newTestimonial)
        .then(() => {
          sharedTestimonials = [newTestimonial, ...sharedTestimonials];
          renderTestimonials(sharedTestimonials);
          form.reset();
          if (status) {
            status.textContent = 'Comentario publicado correctamente.';
          }
        })
        .catch(() => {
          if (status) {
            status.textContent = 'No se pudo publicar. Inténtalo de nuevo.';
          }
        });
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
