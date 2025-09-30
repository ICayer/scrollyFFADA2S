import { loadSVG } from "../utils.js";

let step8Container = null;
let step8Timeline = null;
let isStep8Active = false;

export async function showStep8() {
  console.log("✅ showStep8 déclenché");

  // Éviter les appels multiples
  if (isStep8Active) {
    console.log("⚠️ Step8 déjà actif, ignoré");
    return;
  }

  // Nettoyer l'ancienne timeline si elle existe
  if (step8Timeline) {
    step8Timeline.kill();
    step8Timeline = null;
  }

  isStep8Active = true;

  // Charger le SVG si pas déjà chargé
  if (!step8Container) {
    step8Container = await loadSVG("./svg/step8_spirale.svg", "step8SVG", "graphic");
    if (!step8Container) {
      console.error("❌ Impossible de charger le SVG step8");
      return;
    }
  }

  // Rendre visible le conteneur principal
  gsap.set(step8Container, { 
    opacity: 1, 
    display: "block", 
    pointerEvents: "auto" 
  });

  // Sélecteurs
  const spirale = step8Container.querySelector("#step8Spirale");
  const stripes = [
    "#stripe1", "#stripe2", "#stripe3", "#stripe4", "#stripe5",
    "#stripe6", "#stripe7", "#stripe8", "#stripe9", "#stripe10"
  ];

  console.log("🎯 Éléments step8 trouvés:", {
    spirale: !!spirale,
    stripes: stripes.filter(sel => step8Container.querySelector(sel)).length
  });

  // Tout masquer au départ
  if (spirale) gsap.set(spirale, { opacity: 0, display: "block", visibility: "visible" });
  stripes.forEach(sel => {
    const el = step8Container.querySelector(sel);
    if (el) gsap.set(el, { opacity: 0, display: "block", visibility: "visible" });
  });

  // Construire la timeline
  step8Timeline = gsap.timeline({
    onComplete: () => {
      console.log("🎬 Animation step8 terminée");
    }
  });

  // 1. Apparition de la spirale
  if (spirale) {
    step8Timeline.to(spirale, {
      opacity: 1,
      duration: 1.5,
      ease: "power2.out",
      onStart: () => console.log("📺 step8Spirale visible")
    });
  }

  // 2. Pause de 2 secondes avant les stripes
  step8Timeline.to({}, { duration: 1, onStart: () => console.log("⏸ pause 1s avant stripes") });

  // 3. Apparition des stripes, un par un toutes les 1s
  stripes.forEach(sel => {
    const el = step8Container.querySelector(sel);
    if (el) {
      step8Timeline.to(el, {
        opacity: 1,
        duration: 0.5,
        ease: "power2.out",
        onStart: () => console.log(`📺 ${sel} visible`)
      }, "+=0.2");
    }
  });

  console.log("▶️ Timeline step8 démarrée");
}

export function hideStep8({ soft = false } = {}) {
  console.log("👋 hideStep8 déclenché", { soft });

  isStep8Active = false;

  // Arrêter l'animation en cours
  if (step8Timeline) {
    step8Timeline.kill();
    step8Timeline = null;
    console.log("🛑 Timeline step8 reset");
  }

  if (!step8Container) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    if (soft) {
      // Fade out rapide sans reset complet
      gsap.to(step8Container, { 
        opacity: 0, 
        duration: 0.3,
        ease: "power2.out",
        onComplete: resolve
      });
    } else {
      // Reset complet avec destruction du DOM
      gsap.to(step8Container, {
        opacity: 0,
        duration: 0.5,
        ease: "power2.out",
        onComplete: () => {
          // Détruire complètement le conteneur pour éviter les IDs dupliqués
          if (step8Container && step8Container.parentNode) {
            step8Container.parentNode.removeChild(step8Container);
          }
          step8Container = null;

          console.log("🧹 Step8 complètement détruit");
          resolve();
        }
      });
    }
  });
}
