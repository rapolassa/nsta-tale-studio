(function () {
  'use strict';

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;

      var target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      closeMobileNav();
    });
  });

  // Mobile navigation
  var menuToggle = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  function closeMobileNav() {
    if (!menuToggle || !mobileNav) return;
    menuToggle.setAttribute('aria-expanded', 'false');
    mobileNav.classList.remove('open');
    mobileNav.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function openMobileNav() {
    if (!menuToggle || !mobileNav) return;
    menuToggle.setAttribute('aria-expanded', 'true');
    mobileNav.classList.add('open');
    mobileNav.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', function () {
      var isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
      if (isOpen) {
        closeMobileNav();
      } else {
        openMobileNav();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMobileNav();
    });
  }

  // Scroll reveal
  var revealElements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealElements.length) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealElements.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    revealElements.forEach(function (el) {
      el.classList.add('visible');
    });
  }

  // Header shadow on scroll
  var header = document.querySelector('.header');
  if (header) {
    window.addEventListener(
      'scroll',
      function () {
        header.style.borderBottomColor =
          window.scrollY > 20 ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.08)';
      },
      { passive: true }
    );
  }

  // Email validation
  var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function validateEmail(value) {
    var trimmed = value.trim();
    if (!trimmed) return 'Please enter your email address.';
    if (!emailPattern.test(trimmed)) return 'Please enter a valid email address.';
    return '';
  }

  function setFieldError(input, message) {
    var field = input.closest('.form-field') || input.closest('.footer-form');
    var errorEl = field ? field.querySelector('.field-error') : null;

    if (message) {
      input.classList.add('error');
      input.setAttribute('aria-invalid', 'true');
      if (errorEl) errorEl.textContent = message;
    } else {
      input.classList.remove('error');
      input.removeAttribute('aria-invalid');
      if (errorEl) errorEl.textContent = '';
    }
  }

  // Toast notification
  var toast = document.getElementById('toast');
  var toastTimer;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove('show');
    }, 4000);
  }

  // Waitlist form handler
  function handleWaitlistSubmit(form, source) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var input = form.querySelector('input[type="email"]');
      if (!input) return;

      var error = validateEmail(input.value);
      setFieldError(input, error);
      if (error) {
        input.focus();
        return;
      }

      var email = input.value.trim();
      input.value = '';
      setFieldError(input, '');

      // Placeholder: replace with your waitlist API endpoint
      // fetch('https://api.storyframe.app/waitlist', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email: email, source: source })
      // });

      showToast("You're on the list! We'll be in touch soon.");
    });

    var input = form.querySelector('input[type="email"]');
    if (input) {
      input.addEventListener('input', function () {
        if (input.classList.contains('error')) {
          setFieldError(input, validateEmail(input.value));
        }
      });
    }
  }

  var heroForm = document.getElementById('hero-form');
  var ctaForm = document.getElementById('cta-form');
  var footerForm = document.getElementById('footer-form');

  if (heroForm) handleWaitlistSubmit(heroForm, 'hero');
  if (ctaForm) handleWaitlistSubmit(ctaForm, 'cta');
  if (footerForm) handleWaitlistSubmit(footerForm, 'footer');
})();
