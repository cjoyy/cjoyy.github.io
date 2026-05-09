// Subtle hover parallax on hero title
document.addEventListener('mousemove', (e) => {
  const hero = document.querySelector('.hero-title');
  if (!hero) return;
  const x = (e.clientX / window.innerWidth - 0.5) * 6;
  const y = (e.clientY / window.innerHeight - 0.5) * 4;
  hero.style.transform = `translate(${x}px, ${y}px)`;
});

// Stagger cards on load
document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.project-card, .peek-card, .exp-item, .cert-card');
  cards.forEach((card, i) => {
    card.style.animationDelay = `${0.1 + i * 0.07}s`;
    card.style.animation = 'fadeUp 0.5s ease both';
  });
});
