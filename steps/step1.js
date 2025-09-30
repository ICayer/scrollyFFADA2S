import { loadSVG } from "../utils.js";

let step1Container = null;
let step1Timeline = null;
let isStep1Active = false;

export async function showStep1() {
  console.log("✅ showStep1 déclenché");
  
  // Éviter les appels multiples
  if (isStep1Active) {
    console.log("⚠️ Step1 déjà actif, ignoré");
    return Promise.resolve();
  }

  // Nettoyer l'ancienne timeline immédiatement
  if (step1Timeline) {
    step1Timeline.kill();
    step1Timeline = null;
  }

  // Charger le SVG step1 si pas déjà chargé
  if (!step1Container) {
    step1Container = await loadSVG("./svg/step1_logoTAC.svg", "step1SVG", "graphic");
    if (!step1Container) {
      console.error("❌ Impossible de charger step1Container");
      return Promise.reject("SVG non chargé");
    }
  }

  isStep1Active = true;

  // Container visible immédiatement
  gsap.set(step1Container, { 
    opacity: 1, 
    display: "block", 
    pointerEvents: "auto" 
  });

  // Sélectionner les éléments spécifiques
  const logo = step1Container.querySelector("#step1LogoTAC");
  const luneDebut = step1Container.querySelector("#step1luneDebut");
  const luneFin = step1Container.querySelector("#step1luneFin");
  const etoiles = step1Container.querySelectorAll("#step1Etoile circle");

  console.log("🎯 Éléments trouvés:", { logo, luneDebut, luneFin, etoiles: etoiles.length });

  // États initiaux - réinitialisation complète
  gsap.set([logo, luneDebut, luneFin], { 
    opacity: 0, 
    visibility: "visible",
    clearProps: "transform,scale,rotation"
  });
  
  gsap.set(etoiles, { 
    opacity: 0, 
    visibility: "visible",
    clearProps: "transform,scale,rotation"
  });

  // Créer la nouvelle timeline
  step1Timeline = gsap.timeline({
    onComplete: () => {
      console.log("🎬 Animation step1 terminée");
    }
  });

  // Animation séquencée
  // 1. Fade-in logo + luneDebut
  if (logo && luneDebut) {
    step1Timeline.to([logo, luneDebut], { 
      opacity: 1, 
      duration: 2,
      ease: "power2.out"
    }, "start");
  }

  // 2. Fade-in des étoiles (légèrement après)
  if (etoiles.length > 0) {
    step1Timeline.to(etoiles, { 
      opacity: 1, 
      duration: 1.5,
      ease: "power2.out",
      stagger: 0.1
    }, "start+=0.5");
  }

  // 3. Pause
  step1Timeline.to({}, { duration: 2 });

  // 4. Fade-out du logo et des étoiles
  const elementsToFadeOut = [];
  if (logo) elementsToFadeOut.push(logo);
  if (etoiles.length > 0) elementsToFadeOut.push(...etoiles);
  
  if (elementsToFadeOut.length > 0) {
    step1Timeline.to(elementsToFadeOut, { 
      opacity: 0, 
      duration: 1.5,
      ease: "power2.in"
    }, "fadeout");
  }

  // 5. Transition lune
  if (luneDebut && luneFin) {
    step1Timeline
      .to(luneDebut, { 
        opacity: 0, 
        duration: 1,
        ease: "power2.inOut"
      }, "luneTransition")
      .to(luneFin, { 
        opacity: 1, 
        duration: 1,
        ease: "power2.inOut"
      }, "luneTransition");
  }

  console.log("▶️ Timeline step1 démarrée");
  return Promise.resolve();
}

export function hideStep1({ soft = false } = {}) {
  console.log("👋 hideStep1 déclenché", { soft });

  isStep1Active = false;

  // Arrêter l'animation immédiatement
  if (step1Timeline) {
    step1Timeline.kill();
    step1Timeline = null;
  }

  if (!step1Container) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    if (soft) {
      // Fade out rapide, résolution immédiate
      gsap.to(step1Container, { 
        opacity: 0, 
        duration: 0.3, // Plus rapide pour up-scroll
        ease: "power2.out",
        onComplete: resolve
      });
    } else {
      // Reset complet avec destruction du DOM
      gsap.to(step1Container, {
        opacity: 0,
        duration: 0.5,
        ease: "power2.out",
        onComplete: () => {
          // Détruire complètement le conteneur pour éviter les IDs dupliqués
          if (step1Container && step1Container.parentNode) {
            step1Container.parentNode.removeChild(step1Container);
          }
          step1Container = null;

          console.log("🧹 Step1 complètement détruit");
          resolve();
        }
      });
    }
  });
}
