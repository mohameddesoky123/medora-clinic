/* ============================================
   Medora Clinic — Main JavaScript
   Vanilla JS for all interactivity
   ============================================ */

(function () {
  'use strict';

  /* ---------- Sticky Navbar Shadow ---------- */
  const navbar = document.getElementById('mainNavbar');

  function handleNavbarScroll() {
    if (!navbar) return;
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  handleNavbarScroll();

  /* ---------- Active Nav Link (based on current page) ---------- */
  function setActiveNavLink() {
    const navLinks = document.querySelectorAll('.nav-link-custom');
    let currentPage = window.location.pathname.split('/').pop();
    if (!currentPage || currentPage === '') currentPage = 'index.html';

    navLinks.forEach(function (link) {
      const linkPage = link.getAttribute('data-page');
      if (linkPage === currentPage) {
        link.classList.add('active');
      }
    });
  }
  setActiveNavLink();

  /* ---------- Mobile Nav Close on Link Click ---------- */
  const navCollapse = document.getElementById('navCollapse');
  const navToggler = document.querySelector('.navbar-toggler-custom');

  document.querySelectorAll('.nav-link-custom').forEach(function (link) {
    link.addEventListener('click', function () {
      if (navCollapse && navCollapse.classList.contains('show')) {
        navToggler.click();
      }
    });
  });

  /* ---------- Smooth Scroll for Anchor Links ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId.length < 2) return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const offset = navbar ? navbar.offsetHeight : 0;
        const top = target.getBoundingClientRect().top + window.pageYOffset - offset - 10;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

  /* ---------- Fade-Up on Scroll (IntersectionObserver) ---------- */
  function initFadeUp() {
    const elements = document.querySelectorAll('.fade-up');
    if (!('IntersectionObserver' in window) || elements.length === 0) {
      elements.forEach(function (el) { el.classList.add('visible'); });
      return;
    }
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    elements.forEach(function (el) { observer.observe(el); });
  }
  initFadeUp();

  /* ---------- Footer Year ---------- */
  const yearEl = document.getElementById('currentYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Appointment Date: Prevent Past Dates ---------- */
  const dateInput = document.getElementById('preferredDate');
  if (dateInput) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    dateInput.setAttribute('min', yyyy + '-' + mm + '-' + dd);
  }

  /* ---------- Service Preselection (from services.html) ---------- */
  function preselectService() {
    const serviceSelect = document.getElementById('serviceSelect');
    if (!serviceSelect) return;
    const params = new URLSearchParams(window.location.search);
    const service = params.get('service');
    if (service) {
      for (var i = 0; i < serviceSelect.options.length; i++) {
        if (serviceSelect.options[i].text.toLowerCase().indexOf(service.toLowerCase()) !== -1) {
          serviceSelect.selectedIndex = i;
          serviceSelect.classList.add('is-valid');
          break;
        }
      }
    }
  }
  preselectService();

  /* ---------- Form Validation Helpers ---------- */
  function showError(input, message) {
    input.classList.add('is-invalid');
    input.classList.remove('is-valid');
    var feedback = input.parentNode.querySelector('.invalid-feedback-custom');
    if (feedback) {
      feedback.textContent = message;
      feedback.classList.add('show');
    }
  }

  function clearError(input) {
    input.classList.remove('is-invalid');
    input.classList.add('is-valid');
    var feedback = input.parentNode.querySelector('.invalid-feedback-custom');
    if (feedback) {
      feedback.classList.remove('show');
    }
  }

  function validateField(input, rules) {
    var value = (input.value || '').trim();

    if (rules.required && value === '') {
      showError(input, rules.requiredMsg || 'This field is required.');
      return false;
    }

    if (rules.email && value !== '') {
      var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRe.test(value)) {
        showError(input, 'Please enter a valid email address.');
        return false;
      }
    }

    if (rules.phone && value !== '') {
      var phoneRe = /^[+]?[\d\s\-()]{8,}$/;
      if (!phoneRe.test(value)) {
        showError(input, 'Please enter a valid phone number.');
        return false;
      }
    }

    if (rules.minLength && value.length < rules.minLength) {
      showError(input, rules.minLengthMsg || 'Input is too short.');
      return false;
    }

    if (rules.select && value === '') {
      showError(input, rules.requiredMsg || 'Please select an option.');
      return false;
    }

    if (rules.date && value !== '') {
      var selected = new Date(value);
      var today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected < today) {
        showError(input, 'Please select a future date.');
        return false;
      }
    }

    clearError(input);
    return true;
  }

  /* ---------- Appointment Form ---------- */
  var appointmentForm = document.getElementById('appointmentForm');
  if (appointmentForm) {
    var fields = {
      fullName: { required: true, requiredMsg: 'Please enter your full name.', minLength: 2, minLengthMsg: 'Name must be at least 2 characters.' },
      phone: { required: true, requiredMsg: 'Please enter your phone number.', phone: true },
      email: { required: true, requiredMsg: 'Please enter your email address.', email: true },
      serviceSelect: { required: true, select: true, requiredMsg: 'Please select a service.' },
      doctorSelect: { required: true, select: true, requiredMsg: 'Please select a doctor.' },
      preferredDate: { required: true, requiredMsg: 'Please select a preferred date.', date: true },
      preferredTime: { required: true, select: true, requiredMsg: 'Please select a preferred time.' },
      additionalNotes: {}
    };

    Object.keys(fields).forEach(function (id) {
      var input = document.getElementById(id);
      if (input) {
        input.addEventListener('blur', function () {
          if (fields[id].required || input.value.trim() !== '') {
            validateField(input, fields[id]);
          }
        });
        input.addEventListener('input', function () {
          if (input.classList.contains('is-invalid')) {
            validateField(input, fields[id]);
          }
        });
      }
    });

    appointmentForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var allValid = true;

      Object.keys(fields).forEach(function (id) {
        var input = document.getElementById(id);
        if (input && fields[id].required) {
          if (!validateField(input, fields[id])) allValid = false;
        }
      });

      if (allValid) {
        showAppointmentSuccessModal();
      } else {
        var firstError = appointmentForm.querySelector('.is-invalid');
        if (firstError) firstError.focus();
      }
    });
  }

  function showAppointmentSuccessModal() {
    var name = document.getElementById('fullName').value.trim();
    var service = document.getElementById('serviceSelect');
    var doctor = document.getElementById('doctorSelect');
    var date = document.getElementById('preferredDate').value;
    var time = document.getElementById('preferredTime');

    var firstName = name.split(' ')[0];
    document.getElementById('modalPatientName').textContent = firstName;

    document.getElementById('modalService').textContent = service.options[service.selectedIndex].text;
    document.getElementById('modalDoctor').textContent = doctor.options[doctor.selectedIndex].text;
    document.getElementById('modalDate').textContent = formatDate(date);
    document.getElementById('modalTime').textContent = time.options[time.selectedIndex].text;

    var modal = document.getElementById('successModal');
    if (modal) modal.classList.add('show');
  }

  function formatDate(dateStr) {
    var d = new Date(dateStr);
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
  }

  /* ---------- Modal Close ---------- */
  var successModal = document.getElementById('successModal');
  if (successModal) {
    successModal.addEventListener('click', function (e) {
      if (e.target === successModal) closeModal();
    });
  }

  function closeModal() {
    if (successModal) successModal.classList.remove('show');
  }

  var closeModalBtn = document.getElementById('modalCloseBtn');
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);

  var modalHomeBtn = document.getElementById('modalHomeBtn');
  if (modalHomeBtn) modalHomeBtn.addEventListener('click', function () {
    closeModal();
    window.location.href = 'index.html';
  });

  /* ---------- Contact Form ---------- */
  var contactForm = document.getElementById('contactForm');
  if (contactForm) {
    var contactFields = {
      contactName: { required: true, requiredMsg: 'Please enter your name.', minLength: 2, minLengthMsg: 'Name must be at least 2 characters.' },
      contactEmail: { required: true, requiredMsg: 'Please enter your email.', email: true },
      contactPhone: { required: false, phone: true },
      contactSubject: { required: true, requiredMsg: 'Please enter a subject.', minLength: 3, minLengthMsg: 'Subject must be at least 3 characters.' },
      contactMessage: { required: true, requiredMsg: 'Please enter your message.', minLength: 10, minLengthMsg: 'Message must be at least 10 characters.' }
    };

    Object.keys(contactFields).forEach(function (id) {
      var input = document.getElementById(id);
      if (input) {
        input.addEventListener('blur', function () {
          if (contactFields[id].required || input.value.trim() !== '') {
            validateField(input, contactFields[id]);
          }
        });
        input.addEventListener('input', function () {
          if (input.classList.contains('is-invalid')) {
            validateField(input, contactFields[id]);
          }
        });
      }
    });

    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var allValid = true;

      Object.keys(contactFields).forEach(function (id) {
        var input = document.getElementById(id);
        if (input && contactFields[id].required) {
          if (!validateField(input, contactFields[id])) allValid = false;
        }
      });

      if (allValid) {
        var successMsg = document.getElementById('contactSuccessMsg');
        if (successMsg) {
          successMsg.style.display = 'block';
          successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        contactForm.reset();
        document.querySelectorAll('#contactForm .is-valid, #contactForm .is-invalid').forEach(function (el) {
          el.classList.remove('is-valid', 'is-invalid');
        });
        setTimeout(function () {
          if (successMsg) successMsg.style.display = 'none';
        }, 6000);
      } else {
        var firstError = contactForm.querySelector('.is-invalid');
        if (firstError) firstError.focus();
      }
    });
  }

  /* ---------- Keyboard: Escape closes modal ---------- */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && successModal && successModal.classList.contains('show')) {
      closeModal();
    }
  });

})();
