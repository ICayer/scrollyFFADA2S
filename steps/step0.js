import { loadSVG } from "../utils.js";

let step0Container = null;
let isStep0Active = false;

export async function showStep0() {
  console.log("✅ showStep0 (logo accueil)");

  // Éviter les appels multiples
  if (isStep0Active) {
    console.log("⚠️ Step0 déjà actif, ignoré");
    return;
  }

  // Charger le logo TAC uniquement si pas déjà chargé
  if (!step0Container) {
    step0Container = await loadSVG("./svg/step0_logoTAC.svg", "step0SVG", "graphic");
    if (!step0Container) {
      console.error("❌ Impossible de charger step0Container");
      return;
    }
  }

  isStep0Active = true;

  // Container visible et interactif
  gsap.set(step0Container, { 
    opacity: 1, 
    display: "block", 
    pointerEvents: "auto" 
  });

  // Réinitialiser tous les éléments SVG à l'état visible et propre
  const allEls = step0Container.querySelectorAll("g, path, rect, circle");
  gsap.set(allEls, { 
    opacity: 1, 
    visibility: "visible",
    x: 0, 
    y: 0, 
    scale: 1,
    rotation: 0,
    clearProps: "all" // Nettoyer toutes les propriétés GSAP précédentes
  });

  console.log("🎯 Step0 affiché avec", allEls.length, "éléments SVG");
}

export function hideStep0({ soft = false } = {}) {
  console.log("👋 hideStep0 (logo accueil)", { soft });

  isStep0Active = false;

  if (step0Container) {
    if (soft) {
      // Fade-out simple, garder les éléments prêts pour un retour rapide
      gsap.to(step0Container, { 
        opacity: 0, 
        duration: 0.7,
        ease: "power2.out"
      });
    } else {
      // Reset complet avec nettoyage
      gsap.to(step0Container, {
        opacity: 0,
        duration: 1,
        ease: "power2.out",
        onComplete: () => {
          // Nettoyer complètement les éléments SVG
          const allEls = step0Container.querySelectorAll("g, path, rect, circle");
          gsap.set(allEls, { 
            opacity: 0, 
            visibility: "hidden",
            clearProps: "all" 
          });
          
          gsap.set(step0Container, { 
            display: "none",
            pointerEvents: "none"
          });
          
          console.log("🧹 Step0 complètement nettoyé");
        }
      });
    }
  }
}
