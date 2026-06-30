/* --- 1. INITIALIZATION & LIGHT/DARK THEME TOGGLE --- */
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // Theme Toggling Logic
  const themeBtn = document.getElementById('theme-btn');
  const body = document.body;

  // Check saved theme or system preference
  const savedTheme = localStorage.getItem('portfolio-theme');
  if (savedTheme) {
    body.className = savedTheme;
  } else {
    // Default to dark theme
    body.className = 'dark-theme';
    localStorage.setItem('portfolio-theme', 'dark-theme');
  }

  themeBtn.addEventListener('click', () => {
    if (body.classList.contains('dark-theme')) {
      body.classList.remove('dark-theme');
      body.classList.add('light-theme');
      localStorage.setItem('portfolio-theme', 'light-theme');
    } else {
      body.classList.remove('light-theme');
      body.classList.add('dark-theme');
      localStorage.setItem('portfolio-theme', 'dark-theme');
    }
  });

  // Mobile Navigation Drawer Toggle
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');

  mobileToggle.addEventListener('click', () => {
    navMenu.classList.toggle('open');
    // Change menu icon to "X" if menu is open
    const icon = mobileToggle.querySelector('i');
    if (navMenu.classList.contains('open')) {
      icon.setAttribute('data-lucide', 'x');
    } else {
      icon.setAttribute('data-lucide', 'menu');
    }
    lucide.createIcons();
  });

  // Close Mobile Menu on Nav Link Clicks
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (navMenu.classList.contains('open')) {
        navMenu.classList.remove('open');
        mobileToggle.querySelector('i').setAttribute('data-lucide', 'menu');
        lucide.createIcons();
      }
    });
  });

  // Highlight Current Nav Item on Scroll
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    let scrollY = window.pageYOffset;
    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 100;
      const sectionId = current.getAttribute('id');
      
      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        document.querySelector(`.nav-links a[href*=${sectionId}]`)?.classList.add('active');
      } else {
        document.querySelector(`.nav-links a[href*=${sectionId}]`)?.classList.remove('active');
      }
    });
  });

  // Initialize Stats Counters
  setupStatsCounters();

  // Initialize Project Filters
  setupProjectFilters();

  // Initialize GSAP Animations
  setupGSAPAnimations();
});


/* --- 2. INTERACTIVE SQA TERMINAL CONSOLE --- */
let consoleIsRunning = false;

const suites = {
  smoke: [
    { type: 'comment', text: '// Running Playwright Smoke Tests against Portfolio Web Application' },
    { type: 'info', text: '[PLAYWRIGHT] npx playwright test tests/smoke-assertions.spec.ts --project=chromium' },
    { type: 'info', text: '[INFO] Launching browser instance (chromium)...' },
    { type: 'info', text: '[INFO] Browser context opened successfully. Loading page: https://ranasamiuddin.qa' },
    { type: 'success', text: '✓ [PASS] Page title matches "Rana Samiuddin | SQA Engineer Portfolio" (120ms)' },
    { type: 'success', text: '✓ [PASS] Hero header renders name Rana Samiuddin successfully (85ms)' },
    { type: 'success', text: '✓ [PASS] Download Resume call-to-action button is visible and active (50ms)' },
    { type: 'success', text: '✓ [PASS] Navigation bar points: [About, Experience, Skills, Projects, Contact] are clickable (140ms)' },
    { type: 'comment', text: '// Test Run Complete.' },
    { type: 'success', text: '✓ [SUMMARY] Smoke test sweep: 4/4 assertions passed. Status: STABLE (445ms total)' }
  ],
  api: [
    { type: 'comment', text: '// Executing API Endpoint Schema & Payload Verification via Newman' },
    { type: 'info', text: '[POSTMAN] newman run collections/api-verification.postman_collection.json -e environments/prod.json' },
    { type: 'info', text: '[INFO] Initializing handshake request to /api/v1/auth...' },
    { type: 'success', text: '✓ [PASS] GET /api/v1/profile: status code is 200 OK (110ms)' },
    { type: 'success', text: '✓ [PASS] Assert profile payload has string values for "name", "title", "contact" (25ms)' },
    { type: 'success', text: '✓ [PASS] Assert email field value equals "rana.samiuddin@gmail.com" (12ms)' },
    { type: 'success', text: '✓ [PASS] GET /api/v1/experience: status code is 200 OK (130ms)' },
    { type: 'success', text: '✓ [PASS] Assert JSON body contains Tafsol Pvt Ltd and MMC objects (40ms)' },
    { type: 'success', text: '✓ [PASS] Assert yearsOfExperience attribute evaluates >= 1.4 (15ms)' },
    { type: 'comment', text: '// API Assertions Summary' },
    { type: 'success', text: '✓ [SUMMARY] API integration suite: 6/6 endpoints authenticated & passed (332ms total)' }
  ],
  regression: [
    { type: 'comment', text: '// Triggering Selenium Webdriver & DB Verification Regression Tests' },
    { type: 'info', text: '[SELENIUM] mvn test -Dtest=RegressionSuite' },
    { type: 'info', text: '[INFO] Connecting to MySQL client port (3306)...' },
    { type: 'success', text: '✓ [PASS] Database connection assertion successful (190ms)' },
    { type: 'success', text: '✓ [PASS] SQL: SELECT * FROM skills WHERE engineer = "Rana Samiuddin" -> Returns 24 entries (90ms)' },
    { type: 'success', text: '✓ [PASS] Verify skill properties [Manual, Automation, API, DevOps] are non-empty arrays (60ms)' },
    { type: 'info', text: '[INFO] Initiating browser responsiveness sweeps...' },
    { type: 'success', text: '✓ [PASS] Layout assertions passed on standard tablet resolution: 768px (150ms)' },
    { type: 'success', text: '✓ [PASS] Layout assertions passed on standard mobile resolution: 375px (170ms)' },
    { type: 'success', text: '✓ [PASS] Certifications card "SQL and Relational Databases 101" is verified (45ms)' },
    { type: 'comment', text: '// Full suite logs parsed.' },
    { type: 'success', text: '✓ [SUMMARY] Regression suite: 6/6 tests successfully completed. Build status: STABLE (705ms total)' }
  ]
};

async function runConsoleSuite(suiteName) {
  if (consoleIsRunning) return;
  consoleIsRunning = true;

  // Update button active states
  const buttons = document.querySelectorAll('.btn-console');
  buttons.forEach(btn => btn.classList.remove('active'));
  document.getElementById(`run-${suiteName}-btn`)?.classList.add('active');

  const consoleBody = document.getElementById('console-body');
  consoleBody.innerHTML = ''; // Clear prior runs

  const lines = suites[suiteName];
  if (!lines) return;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineEl = document.createElement('div');
    lineEl.className = `console-line ${line.type}`;
    
    // Create text spacing
    lineEl.textContent = line.text;
    consoleBody.appendChild(lineEl);
    
    // Auto-scroll terminal body
    consoleBody.scrollTop = consoleBody.scrollHeight;

    // Simulate script delay
    await delay(120 + Math.random() * 150);
  }

  // Prompt reset line
  const promptEl = document.createElement('div');
  promptEl.className = 'console-line prompt';
  promptEl.innerHTML = `rana-samiuddin-qa ~ % <span class="typing-placeholder">Test finished. Select another...</span>`;
  consoleBody.appendChild(promptEl);
  consoleBody.scrollTop = consoleBody.scrollHeight;

  consoleIsRunning = false;
}

function clearConsole() {
  if (consoleIsRunning) return;
  const consoleBody = document.getElementById('console-body');
  consoleBody.innerHTML = `
    <div class="console-line comment">// Console cleared. Ready for next verification run.</div>
    <div class="console-line prompt">rana-samiuddin-qa ~ % <span class="typing-placeholder">Select a test suite below...</span></div>
  `;
}

// Delay helper
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


/* --- 3. ANIMATED STATISTICS COUNTERS --- */
function setupStatsCounters() {
  const statsSection = document.querySelector('.stats-section');
  if (!statsSection) return;

  let hasAnimated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !hasAnimated) {
        hasAnimated = true;
        animateStats();
      }
    });
  }, { threshold: 0.3 });

  observer.observe(statsSection);
}

function animateStats() {
  const animateCounter = (id, target, isDecimal = false) => {
    const el = document.getElementById(id);
    if (!el) return;
    
    let start = 0;
    const duration = 2000; // 2 seconds
    const startTime = performance.now();

    const update = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function outQuad
      const easedProgress = progress * (2 - progress);
      
      let currentVal = easedProgress * target;
      if (isDecimal) {
        el.textContent = currentVal.toFixed(1);
      } else {
        el.textContent = Math.floor(currentVal).toLocaleString();
      }

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        if (isDecimal) {
          el.textContent = target.toFixed(1);
        } else {
          el.textContent = target.toLocaleString();
        }
      }
    };

    requestAnimationFrame(update);
  };

  animateCounter('stat-years', 1.5, true);
  animateCounter('stat-projects', 15, false);
  animateCounter('stat-cases', 5000, false);
  animateCounter('stat-bugs', 250, false);
}


/* --- 4. PROJECTS FILTER SYSTEM --- */
function setupProjectFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Toggle active classes
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const categories = (card.getAttribute('data-category') || '').split(/\s+/).filter(Boolean);
        const matchesFilter = filterValue === 'all' || categories.includes(filterValue);
        
        if (matchesFilter) {
          card.classList.remove('filtered-out');
          // Animate card entrance using GSAP if available
          if (typeof gsap !== 'undefined') {
            gsap.fromTo(card, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'power2.out' });
          }
        } else {
          card.classList.add('filtered-out');
        }
      });
    });
  });
}


/* --- 5. CONTACT FORM VALIDATION & HANDLING --- */
function handleContactSubmit(event) {
  event.preventDefault();
  
  const form = document.getElementById('contact-form');
  const submitBtn = document.getElementById('form-submit-btn');
  const feedback = document.getElementById('form-feedback');
  
  const name = document.getElementById('form-name').value.trim();
  const email = document.getElementById('form-email').value.trim();
  const subject = document.getElementById('form-subject').value.trim();
  const message = document.getElementById('form-message').value.trim();

  // Basic Validation Check
  if (!name || !email || !subject || !message) {
    feedback.textContent = '✖ Error: Please fill in all fields before submitting.';
    feedback.className = 'form-feedback error';
    return;
  }

  // Disable button and show loader
  submitBtn.disabled = true;
  submitBtn.innerHTML = `<i data-lucide="loader" class="animate-spin"></i> Submitting Test...`;
  if (typeof lucide !== 'undefined') lucide.createIcons();

  // Simulate API post response (1.5 seconds)
  setTimeout(() => {
    feedback.textContent = '✓ Assertion Passed: Contact request received. I will reply shortly!';
    feedback.className = 'form-feedback success';
    
    // Clear inputs
    form.reset();
    
    // Restore button state
    submitBtn.disabled = false;
    submitBtn.innerHTML = `<i data-lucide="send"></i> Send Message`;
    if (typeof lucide !== 'undefined') lucide.createIcons();

    // Fade out notification after 6 seconds
    setTimeout(() => {
      feedback.textContent = '';
      feedback.className = 'form-feedback';
    }, 6000);

  }, 1500);
}


/* --- 6. GSAP ANIMATIONS & SCROLL EFFECTS --- */
function setupGSAPAnimations() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.warn('GSAP or ScrollTrigger CDNs are not available. Skipping entrance animations.');
    return;
  }

  // Register ScrollTrigger Plugin
  gsap.registerPlugin(ScrollTrigger);

  // Hero Section Elements Fade In
  gsap.from('.badge-status-container', { opacity: 0, y: -20, duration: 0.8, delay: 0.2, ease: 'power3.out' });
  gsap.from('.hero-title', { opacity: 0, x: -30, duration: 1, delay: 0.3, ease: 'power3.out' });
  gsap.from('.hero-subtitle', { opacity: 0, x: -30, duration: 1, delay: 0.4, ease: 'power3.out' });
  gsap.from('.hero-description', { opacity: 0, y: 20, duration: 1, delay: 0.5, ease: 'power3.out' });
  gsap.from('.hero-buttons', { opacity: 0, y: 20, duration: 1, delay: 0.6, ease: 'power3.out' });
  gsap.from('.hero-visual', { opacity: 0, scale: 0.9, duration: 1.2, delay: 0.4, ease: 'power2.out' });

  // Section Headers Scroll Animation
  const sectionHeaders = document.querySelectorAll('.section-header');
  sectionHeaders.forEach(header => {
    gsap.from(header, {
      opacity: 0,
      y: 30,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: header,
        start: 'top 85%',
        toggleActions: 'play none none none'
      }
    });
  });

  // Timeline Items Staggered Scroll Animation
  gsap.from('.timeline-item', {
    opacity: 0,
    x: -35,
    stagger: 0.3,
    duration: 0.8,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '.timeline',
      start: 'top 80%',
      toggleActions: 'play none none none'
    }
  });

  // Skill Cards Staggered Scroll Animation
  gsap.from('.skill-card', {
    opacity: 0,
    y: 40,
    stagger: 0.2,
    duration: 0.8,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '.skills-grid',
      start: 'top 80%',
      toggleActions: 'play none none none',
      onEnter: () => {
        // Run progress bars filling animation
        const progresses = document.querySelectorAll('.progress');
        progresses.forEach(prog => {
          const width = prog.style.width;
          prog.style.width = '0%';
          setTimeout(() => {
            prog.style.width = width;
          }, 100);
        });
      }
    }
  });


  // Project Cards Staggered Animation
  gsap.from('.projects-grid .project-card', {
    opacity: 0,
    y: 40,
    stagger: 0.2,
    duration: 0.8,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '.projects-grid',
      start: 'top 80%'
    }
  });

  // Education Cards Entrance
  gsap.from('.edu-card', {
    opacity: 0,
    y: 30,
    stagger: 0.2,
    duration: 0.8,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '.education-grid',
      start: 'top 85%'
    }
  });

  // Certifications Cards Entrance
  gsap.from('.cert-card', {
    opacity: 0,
    y: 30,
    stagger: 0.15,
    duration: 0.8,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '.certifications-grid',
      start: 'top 85%'
    }
  });

  // Testimonial Cards Entrance
  gsap.from('.testimonial-card', {
    opacity: 0,
    x: 30,
    stagger: 0.2,
    duration: 0.8,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '.testimonials-slider',
      start: 'top 85%'
    }
  });
}
