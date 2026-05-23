function toggleSearch() {
  document.getElementById('searchInput').classList.toggle('open');
}

// handle the contact form
const form = document.getElementById('contactForm');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();

    document.getElementById('nameError').textContent = '';
    document.getElementById('emailError').textContent = '';
    document.getElementById('messageError').textContent = '';

    if (name.length < 2) { document.getElementById('nameError').textContent = 'Please enter your name'; valid = false; }
    if (!email.includes('@') || !email.includes('.')) { document.getElementById('emailError').textContent = 'Enter a valid email address'; valid = false; }
    if (message.length < 10) { document.getElementById('messageError').textContent = 'Message must be at least 10 characters'; valid = false; }

    if (valid) {
      alert("Thank you for reaching out! We'll get back to you soon.");
      form.reset();
    }
  });
}

// set the effective date on privacy page
(function setEffectiveDate(){
  const el = document.getElementById('effectiveDate');
  if(!el) return;
  const d = new Date();
  const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  const day = String(d.getDate()).padStart(2,'0');
  el.textContent = `EFFECTIVE: ${months[d.getMonth()]} ${day}, ${d.getFullYear()}`;
})();

// update the year in footer
(function setYear(){
  const y = document.getElementById('year');
  if(y) y.textContent = new Date().getFullYear();
})();

// setup back to top button (works with multiple id names)
(function initAllBackToTopButtons() {
  function wireBackToTop(btn) {
    if (!btn || btn.dataset.backToTopWired === 'true') return;
    btn.dataset.backToTopWired = 'true';

    function toggleBtn() {
      if (window.scrollY > 400) {
        btn.classList.add('show');
        btn.classList.add('visible');
      } else {
        btn.classList.remove('show');
        btn.classList.remove('visible');
      }
    }

    window.addEventListener('scroll', toggleBtn, { passive: true });
    toggleBtn();

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  ['backToTopBtn', 'backToTop', 'backTop'].forEach(function (id) {
    wireBackToTop(document.getElementById(id));
  });
})();

// search box slides in when you click the button, enter to search
(function () {
  const wrap = document.querySelector('.search-wrap');
  const input = document.getElementById('searchInput');
  const btn = document.getElementById('searchBtn');
  if (!wrap || !btn || !input) return;

  const HL_CLASS = 'search-highlight';

  function clearHighlights() {
    document.querySelectorAll('mark.' + HL_CLASS).forEach(m => {
      const parent = m.parentNode;
      parent.replaceChild(document.createTextNode(m.textContent), m);
      parent.normalize();
    });
  }

  function highlight(term) {
    if (!term) return null;
    const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        const p = node.parentNode;
        if (!p || ['SCRIPT','STYLE','MARK','INPUT','BUTTON'].includes(p.tagName)) return NodeFilter.FILTER_REJECT;
        if (p.closest('.navbar') || p.closest('.marquee-bar')) return NodeFilter.FILTER_REJECT;
        return regex.test(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    const nodes = [];
    let n; while ((n = walker.nextNode())) nodes.push(n);
    let first = null;
    nodes.forEach(node => {
      const frag = document.createDocumentFragment();
      let lastIdx = 0; const text = node.nodeValue;
      text.replace(regex, (match, idx) => {
        frag.appendChild(document.createTextNode(text.slice(lastIdx, idx)));
        const mark = document.createElement('mark');
        mark.className = HL_CLASS;
        mark.textContent = match;
        if (!first) first = mark;
        frag.appendChild(mark);
        lastIdx = idx + match.length;
      });
      frag.appendChild(document.createTextNode(text.slice(lastIdx)));
      node.parentNode.replaceChild(frag, node);
    });
    return first;
  }

  function runSearch() {
    clearHighlights();
    const term = input.value.trim();
    if (!term) return;
    const first = highlight(term);
    if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
    else alert('No results found for "' + term + '"');
  }

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    if (!wrap.classList.contains('open')) {
      // First click: just open the input
      wrap.classList.add('open');
      setTimeout(() => input.focus(), 200);
    } else {
      // Already open: run search if there's a term, else close
      if (input.value.trim()) runSearch();
      else wrap.classList.remove('open');
    }
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); runSearch(); }
    if (e.key === 'Escape') { wrap.classList.remove('open'); clearHighlights(); }
  });

  // Click outside closes input (if empty)
  document.addEventListener('click', (e) => {
    if (!wrap.contains(e.target) && !input.value.trim()) {
      wrap.classList.remove('open');
    }
  });
})();

// don't jump when clicking navbar anchors
document.querySelectorAll('.navbar a').forEach(a => {
  a.addEventListener('click', e => {
    if (a.getAttribute('href') === '#') e.preventDefault();
  });
});

// toggle the mobile menu
(function () {
  const hamburger = document.querySelector('.hamburger-menu');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileNavBtns = document.querySelectorAll('.mobile-nav-btn');

  if (!hamburger || !mobileMenu) return;

  function closeAllDropdowns() {
    mobileNavBtns.forEach(function (btn) {
      btn.classList.remove('active');
      btn.setAttribute('aria-expanded', 'false');
      const dropdown = btn.nextElementSibling;
      if (dropdown && dropdown.classList.contains('mobile-dropdown')) {
        dropdown.classList.remove('active');
      }
    });
  }

  function closeMobileMenu() {
    hamburger.classList.remove('active');
    mobileMenu.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    closeAllDropdowns();
  }

  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.setAttribute('aria-controls', 'mobileMenuPanel');
  mobileMenu.id = mobileMenu.id || 'mobileMenuPanel';

  hamburger.addEventListener('click', function (e) {
    e.stopPropagation();
    const willOpen = !mobileMenu.classList.contains('active');
    hamburger.classList.toggle('active', willOpen);
    mobileMenu.classList.toggle('active', willOpen);
    hamburger.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
    document.body.style.overflow = willOpen ? 'hidden' : '';
    if (willOpen) {
      closeAllDropdowns();
    } else {
      closeAllDropdowns();
    }
  });

  mobileNavBtns.forEach(function (btn) {
    btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      const dropdown = btn.nextElementSibling;
      const isOpen = btn.classList.contains('active');

      closeAllDropdowns();

      if (!isOpen) {
        btn.classList.add('active');
        btn.setAttribute('aria-expanded', 'true');
        if (dropdown && dropdown.classList.contains('mobile-dropdown')) {
          dropdown.classList.add('active');
        }
      }
    });
  });

  document.querySelectorAll('.mobile-dropdown a').forEach(function (link) {
    link.addEventListener('click', function () {
      closeMobileMenu();
    });
  });

  document.addEventListener('click', function (e) {
    if (!mobileMenu.classList.contains('active')) return;
    if (!mobileMenu.contains(e.target) && !hamburger.contains(e.target)) {
      closeMobileMenu();
    }
  });
})();

// search for stuff on the page
function performMobileSearch() {
  const searchInput = document.getElementById('mobileSearchInput');
  if (!searchInput) return;
  const searchTerm = searchInput.value.toLowerCase().trim();

  // redirect based on what they search for
  if (searchTerm === 'k2 base camp' || searchTerm === 'k2') {
    window.location.href = 'k2-base-camp.html';
  } else if (searchTerm === 'hunza valley' || searchTerm === 'hunza') {
    window.location.href = 'hunza-valley.html';
  } else if (searchTerm === 'fairy meadows' || searchTerm === 'fairy') {
    window.location.href = 'fairy-meadows.html';
  } else if (searchTerm === 'deosai' || searchTerm === 'deosai plains') {
    window.location.href = 'deosai.html';
  } else {
    searchInput.style.borderColor = '#FF4500';
    setTimeout(() => {
      searchInput.style.borderColor = '';
    }, 2000);
  }
}

// sections fade in as you scroll down the page
function initSmoothReveal() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var skipWithin = '.navbar, .mobile-menu, .na-marquee, .footer-scene';
  var sectionSelectors = [
    'section',
    '.hero-section',
    '.hero',
    '.explore-section',
    '.destinations-section',
    '.experience-section',
    '.wildlife-section',
    '.camping-section',
    '.access-section',
    '.tabs-section',
    '.description-section',
    '.content-section',
    '.perks-section',
    '.why-section',
    '.footer-body'
  ];

  var revealEls = [];
  var seen = [];

  function shouldSkip(el) {
    if (!el || el.nodeType !== 1) return true;
    if (el.matches(skipWithin) || el.closest(skipWithin)) return true;
    if (el.closest('.navbar') || el.closest('.mobile-menu')) return true;
    return seen.indexOf(el) !== -1;
  }

  sectionSelectors.forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (el) {
      if (shouldSkip(el)) return;
      seen.push(el);
      el.classList.add('reveal');
      revealEls.push(el);
    });
  });

  document.querySelectorAll(
    '.dest-grid, .camping-grid, .perks-grid, .why-grid, .perks-items, .wildlife-side'
  ).forEach(function (grid) {
    if (shouldSkip(grid)) return;
    grid.classList.add('reveal-stagger');
    Array.from(grid.children).forEach(function (child, i) {
      child.style.transitionDelay = Math.min(i, 8) * 0.07 + 's';
    });
    revealEls.push(grid);
  });

  if (!revealEls.length) return;

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    { root: null, rootMargin: '0px 0px -6% 0px', threshold: 0.06 }
  );

  revealEls.forEach(function (el) {
    observer.observe(el);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSmoothReveal);
} else {
  initSmoothReveal();
}
