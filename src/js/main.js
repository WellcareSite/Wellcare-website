// Mobile navigation toggle
document.addEventListener('DOMContentLoaded', function() {
  const toggle = document.getElementById('nav-toggle');
  const navList = document.getElementById('nav-list');

  if (toggle && navList) {
    toggle.addEventListener('click', function() {
      navList.classList.toggle('open');
      toggle.textContent = navList.classList.contains('open') ? '✕' : '☰';
    });
  }

  // Close mobile nav when a link is clicked
  document.querySelectorAll('.nav-list a').forEach(function(link) {
    link.addEventListener('click', function() {
      if (window.innerWidth <= 768) {
        navList.classList.remove('open');
        toggle.textContent = '☰';
      }
    });
  });

  // Scroll animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.value-card, .service-card, .team-card, .location-card, .blog-card, .benefit-item, .milestone-card').forEach(function(el) {
    el.style.opacity = '0';
    observer.observe(el);
  });


});
