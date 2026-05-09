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

  // Project filter tabs
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      // update active button
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // show/hide cards
      projectCards.forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.classList.remove('hidden');
          // re-trigger fade animation
          card.style.animation = 'none';
          card.offsetHeight; // reflow
          card.style.animation = 'fadeUp 0.35s ease both';
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
});