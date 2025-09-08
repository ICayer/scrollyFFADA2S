import { loadSVG } from "../utils.js";

let step9Container = null;
let step9Timeline = null;
let isStep9Active = false;

export async function showStep9() {
  console.log("✅ showStep9 déclenché");

  // Éviter les appels multiples
  if (isStep9Active) {
    console.log("⚠️ Step9 déjà actif, ignoré");
    return;
  }

  // Nettoyer l'ancienne timeline si elle existe
  if (step9Timeline) {
    step9Timeline.kill();
    step9Timeline = null;
  }

  isStep9Active = true;

  // Charger le SVG si pas déjà chargé
  if (!step9Container) {
    step9Container = await loadSVG("/svg/step9_coeur2.svg", "step9SVG", "graphic");
    if (!step9Container) {
      console.error("❌ Impossible de charger le SVG step9");
      return;
    }
    console.log("🔥 step9Container chargé :", step9Container);
  }

  // Container visible
  gsap.set(step9Container, { 
    opacity: 1, 
    display: "block", 
    pointerEvents: "auto" 
  });

  // IDs initiaux
  const initialEls = ["#step9Lune", "#step9Famille", "#step9Femme"];
  const stripes = ["#stripe1", "#stripe2", "#stripe3"];
  const coeurs = ["#coeur1", "#coeur2", "#coeur3"];

  console.log("🎯 Éléments step9 trouvés:", {
    initial: initialEls.filter(sel => step9Container.querySelector(sel)).length,
    stripes: stripes.filter(sel => step9Container.querySelector(sel)).length,
    coeurs: coeurs.filter(sel => step9Container.querySelector(sel)).length,
    etoileDebut: !!step9Container.querySelector("#etoileDebut"),
    etoileFin: !!step9Container.querySelector("#etoileFin")
  });

  // Masquer tout sauf les initiaux
  const allEls = [...stripes, ...coeurs, "#etoileDebut", "#etoileFin"];
  allEls.forEach(sel => {
    const el = step9Container.querySelector(sel);
    if (el) gsap.set(el, { opacity: 0, display: "block", visibility: "visible" });
  });

  initialEls.forEach(sel => {
    const el = step9Container.querySelector(sel);
    if (el) gsap.set(el, { opacity: 1, display: "block", visibility: "visible" });
  });

  step9Timeline = gsap.timeline({
    onComplete: () => {
      console.log("🎬 Animation step9 terminée");
    }
  });


  // 1. Stripes fade-in + Femme fade-out
  const stripesEls = stripes.map(sel => step9Container.querySelector(sel)).filter(Boolean);
  const femmeEl = step9Container.querySelector("#step9Femme");

  if (stripesEls.length) {
    step9Timeline.to(stripesEls, { 
      opacity: 1, 
      duration: 2,
      ease: "power2.out",
      onStart: () => console.log("📺 Stripes fade-in")
    }, 0);
  }

  if (femmeEl) {
    step9Timeline.to(femmeEl, { 
      opacity: 0, 
      duration: 2,
      ease: "power2.out",
      onStart: () => console.log("📻 Femme fade-out")
    }, 0);
  }

  // Pause de 5 secondes
  step9Timeline.to({}, { 
    duration: 1, 
    onStart: () => console.log("⏸ Pause 5s avant morphing") 
  });

  // 2. Morphing stripe → coeur (avec déplacement)
  stripes.forEach((stripeSel, idx) => {
    const stripe = step9Container.querySelector(stripeSel);
    const coeur = step9Container.querySelector(coeurs[idx]);
    if (stripe && coeur && window.flubber) {
      const interp = flubber.interpolate(stripe.getAttribute("d"), coeur.getAttribute("d"));

      step9Timeline.to(stripe, {
        duration: 2,
        ease: "power2.inOut",
        onStart: () => console.log(`🔄 Morphing ${stripeSel} → ${coeurs[idx]}`),
        onUpdate: function () {
          stripe.setAttribute("d", interp(this.progress()));
        },
        onComplete: () => {
          gsap.set(stripe, { opacity: 0 });
          gsap.set(coeur, { opacity: 1 });
          console.log(`💖 ${coeurs[idx]} visible`);
        }
      }, "+=0.5");
    }
  });

  // 3. Etoiles apparition
  const etoileDebut = step9Container.querySelector("#etoileDebut");
  if (etoileDebut) {
    step9Timeline.to(etoileDebut, { opacity: 1, duration: 2 }, "+=0.5");
  }

  // 4. Migration etoileDebutX → etoileFinX
  const etoileFin = step9Container.querySelector("#etoileFin");
  const cerclesDebut = etoileDebut ? etoileDebut.querySelectorAll("circle") : [];
  const cerclesFin = etoileFin ? etoileFin.querySelectorAll("circle") : [];

  if (cerclesDebut.length && cerclesFin.length) {
    cerclesDebut.forEach((cDebut, idx) => {
      const cFin = cerclesFin[idx];
      if (cFin) {
        const dx = cFin.cx.baseVal.value - cDebut.cx.baseVal.value;
        const dy = cFin.cy.baseVal.value - cDebut.cy.baseVal.value;

        step9Timeline.to(cDebut, {
          duration: 5,
          x: dx,
          y: dy,
          ease: "power2.inOut"
        }, "<+=0.05"); // léger décalage
      }
    });
  }

  console.log("▶️ Timeline step9 démarrée");
}

export function hideStep9({ soft = false } = {}) {
  console.log("👋 hideStep9 déclenché", { soft });

  isStep9Active = false;

  // Arrêter l'animation en cours
  if (step9Timeline) {
    step9Timeline.kill();
    step9Timeline = null;
    console.log("🛑 Timeline step9 reset");
  }

  if (!step9Container) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    if (soft) {
      // Fade out rapide sans reset complet
      gsap.to(step9Container, { 
        opacity: 0, 
        duration: 0.3,
        ease: "power2.out",
        onComplete: resolve
      });
    } else {
      // Reset complet
      gsap.to(step9Container, {
        opacity: 0,
        duration: 0.5,
        ease: "power2.out",
        onComplete: () => {
          // Reset spécifique de tous les éléments step9
          const initialEls = ["#step9Lune", "#step9Famille", "#step9Femme"];
          const stripes = ["#stripe1", "#stripe2", "#stripe3"];
          const coeurs = ["#coeur1", "#coeur2", "#coeur3"];
          const etoiles = ["#etoileDebut", "#etoileFin"];
          
          const allSelectors = [...initialEls, ...stripes, ...coeurs, ...etoiles];
          
          allSelectors.forEach(sel => {
            const el = step9Container.querySelector(sel);
            if (el) {
              gsap.set(el, { 
                opacity: 0, 
                visibility: "hidden",
                x: 0, 
                y: 0,
                clearProps: "all" 
              });
            }
          });

          // Reset spécifique des cercles dans les étoiles
          const allCircles = step9Container.querySelectorAll("circle");
          gsap.set(allCircles, { 
            x: 0, 
            y: 0, 
            opacity: 0,
            visibility: "hidden",
            clearProps: "all" 
          });

          gsap.set(step9Container, { 
            display: "none",
            pointerEvents: "none"
          });
          
          console.log("🧹 Step9 complètement nettoyé");
          resolve();
        }
      });
    }
  });
}