/**
 * FairFly Pro — Supersonic Jet Animation Engine (jet.png)
 * Handles:
 *  1. Supersonic load-in transition
 *  2. Scroll-reactive pitch, bank, altitude parallax & contrail thrust
 *  3. Page-change fly-off transition when navigating between pages
 *  4. 3D cursor banking
 */
(function () {
  const jetWrapper = document.getElementById('jetWrapper');
  const jetTiltLayer = document.getElementById('jetTiltLayer');
  const contrails = document.querySelectorAll('.contrail');
  const pageCurtain = document.getElementById('pageCurtain');

  let mouseX = 0;
  let mouseY = 0;
  let isDeparting = false;

  // 1. Trigger supersonic entrance once DOM & jet.png are ready
  window.addEventListener('DOMContentLoaded', () => {
    if (jetWrapper) {
      requestAnimationFrame(() => {
        jetWrapper.classList.add('jet-entered');
      });
    }

    // Sub-page escort jet entrance (About, Support, Flights, Destinations, Deals)
    const escortJet = document.getElementById('escortJetBadge');
    if (escortJet) {
      setTimeout(() => {
        escortJet.classList.add('escort-active');
      }, 150);
    }
  });

  // 2. Track mouse for 3D aerospace banking
  window.addEventListener('mousemove', (e) => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    mouseX = (e.clientX - cx) / cx;
    mouseY = (e.clientY - cy) / cy;
  });

  // 3. Track scroll for altitude climb, pitch & contrail boost
  window.addEventListener('scroll', () => {
    const thrustScale = 1 + Math.min(1.4, window.scrollY / 280);
    contrails.forEach((c) => {
      c.style.transform = `scaleY(${thrustScale.toFixed(2)})`;
      c.style.opacity = Math.min(1, 0.55 + window.scrollY / 400).toFixed(2);
    });
  }, { passive: true });

  // 4. Smooth 60fps animation loop combining mouse tilt + scroll flight path
  function updateJetPhysics() {
    if (!isDeparting) {
      if (jetTiltLayer) {
        const scrollClimbY = -window.scrollY * 0.28;
        const scrollBankZ = Math.sin(window.scrollY * 0.008) * 8;
        const scrollScale = Math.max(0.78, 1 - window.scrollY * 0.00035);

        const rotY = mouseX * 16;
        const rotX = -mouseY * 12 + Math.min(15, window.scrollY * 0.03);
        const rotZ = mouseX * 5 + scrollBankZ;

        jetTiltLayer.style.transform = `
          translate3d(0, ${scrollClimbY.toFixed(1)}px, 0)
          scale(${scrollScale.toFixed(3)})
          rotateY(${rotY.toFixed(2)}deg)
          rotateX(${rotX.toFixed(2)}deg)
          rotateZ(${rotZ.toFixed(2)}deg)
        `;
      }

      const escortJet = document.getElementById('escortJetBadge');
      if (escortJet) {
        const yOffset = Math.sin(window.scrollY * 0.01) * 18;
        const tilt = Math.cos(window.scrollY * 0.01) * 6;
        escortJet.style.transform = `translateY(${yOffset.toFixed(1)}px) rotate(${tilt.toFixed(1)}deg)`;
      }
    }

    requestAnimationFrame(updateJetPhysics);
  }
  requestAnimationFrame(updateJetPhysics);

  // 5. Page-Change Jet Fly-Off Transition (Home -> About, Support, Flights, etc.)
  window.navigateSmooth = function (e, url) {
    if (e) e.preventDefault();
    if (isDeparting) return;
    isDeparting = true;

    if (typeof window.playChime === 'function') {
      window.playChime(740, 'triangle', 0.18);
    }

    if (jetWrapper) {
      jetWrapper.classList.add('jet-departing');
    }
    const escortJet = document.getElementById('escortJetBadge');
    if (escortJet) {
      escortJet.classList.add('escort-departing');
    }

    contrails.forEach((c) => {
      c.style.transform = 'scaleY(2.6)';
      c.style.opacity = '1';
    });

    setTimeout(() => {
      if (pageCurtain) pageCurtain.classList.add('active');
    }, 180);

    setTimeout(() => {
      window.location.href = url;
    }, 460);
  };
})();
