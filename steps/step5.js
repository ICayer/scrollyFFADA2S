import { loadSVG } from "../utils.js";

let step5Container = null;
let tl = null;
let isStep5Active = false;

export async function showStep5() {
  console.log("✅ showStep5 déclenché");

  // Éviter les appels multiples
  if (isStep5Active) {
    console.log("⚠️ Step5 déjà actif, ignoré");
    return;
  }

  // Nettoyer l'ancienne timeline si elle existe
  if (tl) {
    tl.kill();
    tl = null;
  }

  isStep5Active = true;

  // Charger et afficher le SVG step5_nature
  if (!step5Container) {
    step5Container = await loadSVG("./svg/step5_femme_nature.svg", "step5SVG", "graphic");
    if (!step5Container) {
      console.error("❌ Impossible de charger le SVG step5");
      return;
    }
  }

  if (step5Container) {
    gsap.set(step5Container, { opacity: 0, display: "block", pointerEvents: "auto" });
    gsap.to(step5Container, { 
      opacity: 1, 
      duration: 1,
      ease: "power2.out",
      onComplete: () => {
        console.log("🎬 Fade-in step5 terminé");
      }
    });
  }

  console.log("🎯 Step5 container chargé et affiché");

  // Pas d'animations spécifiques pour l'instant
  tl = gsap.timeline();
}

export function hideStep5({ soft = false } = {}) {
  console.log("👋 hideStep5 déclenché", { soft });

  isStep5Active = false;

  // Arrêter l'animation en cours
  if (tl) {
    tl.kill();
    tl = null;
  }

  if (!step5Container) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    if (soft) {
      // Fade out rapide sans reset complet
      gsap.to(step5Container, { 
        opacity: 0, 
        duration: 0.3,
        ease: "power2.out",
        onComplete: resolve
      });
    } else {
      // Reset complet
      gsap.to(step5Container, {
        opacity: 0,
        duration: 0.5,
        ease: "power2.out",
        onComplete: () => {
          gsap.set(step5Container, { 
            display: "none",
            pointerEvents: "none"
          });
          
          console.log("🧹 Step5 complètement nettoyé");
          resolve();
        }
      });
    }
  });
}