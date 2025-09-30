import { loadSVG } from "../utils.js";

let step2Container = null;
let step2Timeline = null;
let isStep2Active = false;

export async function showStep2() {
  console.log("✅ showStep2 déclenché");

  // Éviter les appels multiples
  if (isStep2Active) {
    console.log("⚠️ Step2 déjà actif, ignoré");
    return;
  }

  // Nettoyer l'ancienne timeline si elle existe
  if (step2Timeline) {
    step2Timeline.kill();
    step2Timeline = null;
  }

  // Charger le SVG step2 si pas déjà chargé
  if (!step2Container) {
    step2Container = await loadSVG("./svg/step2_lune.svg", "step2SVG", "graphic");
    if (!step2Container) {
      console.error("❌ Impossible de charger step2Container");
      return;
    }
  }

  isStep2Active = true;

  // Container visible et interactif
  gsap.set(step2Container, { 
    opacity: 1, 
    display: "block", 
    pointerEvents: "auto" 
  });

  // Sélectionner la lune et les étoiles
  const lune = step2Container.querySelector("#step2Lune");
  const stars = step2Container.querySelectorAll("#step2Etoile circle");

  console.log("🎯 Éléments trouvés:", { lune, stars: stars.length });

  // États initiaux clairs
  if (lune) gsap.set(lune, { opacity: 0, visibility: "visible" });
  if (stars.length > 0) {
    gsap.set(stars, { opacity: 0, visibility: "visible" });
  }

  // Créer la nouvelle timeline
  step2Timeline = gsap.timeline({
    onComplete: () => {
      console.log("🎬 Animation step2 terminée");
    }
  });

  // Animation : lune et étoiles apparaissent ensemble
  const elementsToShow = [];
  if (lune) elementsToShow.push(lune);
  if (stars.length > 0) elementsToShow.push(...stars);

  if (elementsToShow.length > 0) {
    // 1. Fade-in de la lune
    if (lune) {
      step2Timeline.to(lune, { 
        opacity: 1, 
        duration: 1.5,
        ease: "power2.out"
      }, "start");
    }

    // 2. Fade-in progressif des étoiles avec stagger
    if (stars.length > 0) {
      step2Timeline.to(stars, {
        opacity: 1,
        duration: 2,
        stagger: { 
          amount: 1.5, 
          from: "random",
          ease: "power2.out"
        },
        ease: "power2.out"
      }, "start+=0.3");
    }
  }

  console.log("▶️ Timeline step2 démarrée");
}

export function hideStep2({ soft = false } = {}) {
  console.log("👋 hideStep2 déclenché", { soft });

  isStep2Active = false;

  // Arrêter l'animation en cours
  if (step2Timeline) {
    step2Timeline.kill();
    step2Timeline = null;
  }

  if (!step2Container) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    if (soft) {
      // Fade out rapide sans reset complet
      gsap.to(step2Container, { 
        opacity: 0, 
        duration: 0.3,
        ease: "power2.out",
        onComplete: resolve
      });
    } else {
      // Reset complet avec destruction du DOM
      gsap.to(step2Container, {
        opacity: 0,
        duration: 0.5,
        ease: "power2.out",
        onComplete: () => {
          // Détruire complètement le conteneur pour éviter les IDs dupliqués
          if (step2Container && step2Container.parentNode) {
            step2Container.parentNode.removeChild(step2Container);
          }
          step2Container = null;

          console.log("🧹 Step2 complètement détruit");
          resolve();
        }
      });
    }
  });
}
