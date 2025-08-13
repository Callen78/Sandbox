// Pull-up on upward scroll when #map-section is in view
document.addEventListener('DOMContentLoaded', () => {
    const mapSection = document.querySelector('#map-section');
    const mapPanel   = document.querySelector('#map-panel');
    let lastY        = window.scrollY;
    let inView       = false;
  
    // Observe when the map trigger section is on screen
    const io = new IntersectionObserver(
      (entries) => { inView = entries[0]?.isIntersecting || false; },
      { root: null, threshold: 0.25 } // adjust sensitivity as needed
    );
    if (mapSection) io.observe(mapSection);
  
    // Throttle with rAF for smoothness
    let ticking = false;
    const onScroll = () => {
      const currentY = window.scrollY;
      const scrollingUp = currentY < lastY;
  
      // Show when scrolling up and the map zone is visible
      if (inView && scrollingUp) {
        mapPanel.classList.add('show');
        document.body.classList.add('pullup-open');
      } else if (!inView || !scrollingUp) {
        mapPanel.classList.remove('show');
        document.body.classList.remove('pullup-open');
      }
  
      lastY = currentY;
      ticking = false;
    };
  
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(onScroll);
        ticking = true;
      }
    }, { passive: true });
  
    // Optional: swipe-down to close on touch
    let startY = null;
    mapPanel.addEventListener('touchstart', (e) => {
      startY = e.touches[0].clientY;
    }, { passive: true });
  
    mapPanel.addEventListener('touchmove', (e) => {
      if (startY === null) return;
      const delta = e.touches[0].clientY - startY;
      // If user drags down > 40px, close
      if (delta > 40) {
        mapPanel.classList.remove('show');
        document.body.classList.remove('pullup-open');
      }
    }, { passive: true });
  
    mapPanel.addEventListener('touchend', () => { startY = null; });
  });
  