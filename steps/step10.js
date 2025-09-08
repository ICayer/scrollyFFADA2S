import { loadSVG } from "../utils.js";

let step10Container = null;
let step10Timeline = null;
let isStep10Active = false;

export async function showStep10() {
  console.log("✅ showStep10 déclenché");

  // Éviter les appels multiples
  if (isStep10Active) {
    console.log("⚠️ Step10 déjà actif, ignoré");
    return;
  }

  // Nettoyer l'ancienne timeline si elle existe
  if (step10Timeline) {
    step10Timeline.kill();
    step10Timeline = null;
  }

  isStep10Active = true;

  // Charger le SVG si pas déjà chargé
  if (!step10Container) {
    step10Container = await loadSVG("./svg/step10_lune_etoile.svg", "step10SVG", "graphic");
    if (!step10Container) {
      console.error("❌ Impossible de charger le SVG step10");
      return;
    }
    console.log("🔥 step10Container chargé :", step10Container);
  }

  // Container visible
  gsap.set(step10Container, { 
    opacity: 1, 
    display: "block", 
    pointerEvents: "auto" 
  });

  // Éléments initialement visibles
  const initialEls = ["#step10Sol", "#step10Famille", "#step10Coeur"];

  // Tous les autres éléments à masquer initialement
  const hiddenEls = [
    "#step10Lune", 
    "#step10PleineLune", 
    "#step10Communaute"
  ];
  
  // Ajouter les 67 étoiles à la liste des éléments cachés
  for (let i = 1; i <= 67; i++) {
    hiddenEls.push(`#etoileDebut${i}`);
    hiddenEls.push(`#etoileFin${i}`);
  }

  console.log("🎯 Éléments step10 trouvés:", {
    initial: initialEls.filter(sel => step10Container.querySelector(sel)).length,
    lune: !!step10Container.querySelector("#step10Lune"),
    pleineLune: !!step10Container.querySelector("#step10PleineLune"),
    communaute: !!step10Container.querySelector("#step10Communaute"),
    etoilesDebut: Array.from({length: 67}, (_, i) => step10Container.querySelector(`#etoileDebut${i+1}`)).filter(Boolean).length,
    etoilesFin: Array.from({length: 67}, (_, i) => step10Container.querySelector(`#etoileFin${i+1}`)).filter(Boolean).length
  });

  // Masquer tous les éléments cachés
  hiddenEls.forEach(sel => {
    const el = step10Container.querySelector(sel);
    if (el) gsap.set(el, { opacity: 0, display: "block", visibility: "visible" });
  });

  // Afficher les éléments initiaux
  initialEls.forEach(sel => {
    const el = step10Container.querySelector(sel);
    if (el) gsap.set(el, { opacity: 1, display: "block", visibility: "visible" });
  });

  // Créer la timeline
  step10Timeline = gsap.timeline({
    onComplete: () => {
      console.log("🎬 Animation step10 terminée");
    }
  });

  // 1. Afficher la lune en fade-in (2 secondes)
  const lune = step10Container.querySelector("#step10Lune");
  if (lune) {
    step10Timeline.to(lune, { 
      opacity: 1, 
      duration: 2,
      ease: "power2.out",
      onStart: () => console.log("🌙 Lune fade-in")
    });
  }

  // 2. Afficher les 67 étoiles une après l'autre (0.2 secondes au total)
  const etoilesDebut = [];
  for (let i = 1; i <= 67; i++) {
    const el = step10Container.querySelector(`#etoileDebut${i}`);
    if (el) etoilesDebut.push(el);
  }
  
  console.log(`⭐ ${etoilesDebut.length} étoiles début trouvées`);
  
  const delayPerStar = 0.2 / Math.max(etoilesDebut.length, 1); // Répartir sur 0.2 secondes
  etoilesDebut.forEach((etoile, idx) => {
    step10Timeline.to(etoile, {
      opacity: 1,
      duration: 0.005,
      onStart: idx === 0 ? () => console.log("✨ Apparition des étoiles débutée") : null
    }, `+=${delayPerStar * idx}`);
  });

  // 3. Faire disparaître Sol, Famille, Coeur (1 seconde)
  const toHide = initialEls.map(sel => step10Container.querySelector(sel)).filter(Boolean);
  if (toHide.length) {
    step10Timeline.to(toHide, { 
      opacity: 0, 
      duration: 1,
      ease: "power2.out",
      onStart: () => console.log("📻 Sol, Famille, Coeur fade-out")
    }, "+=0.5");
  }

  // 4. Faire apparaître Communaute (1 seconde)
  const communaute = step10Container.querySelector("#step10Communaute");
  if (communaute) {
    step10Timeline.to(communaute, { 
      opacity: 1, 
      duration: 1,
      ease: "power2.out",
      onStart: () => console.log("👥 Communauté fade-in")
    }, ">");
  }

  // 5. Synchronisation : Lune -> PleineLune + migration des étoiles (5 secondes)
  const pleineLune = step10Container.querySelector("#step10PleineLune");
  const etoilesFin = [];
  for (let i = 1; i <= 67; i++) {
    const el = step10Container.querySelector(`#etoileFin${i}`);
    if (el) etoilesFin.push(el);
  }

  console.log(`🌟 ${etoilesFin.length} étoiles fin trouvées`);

  // Transformation Lune -> PleineLune
  if (lune && pleineLune) {
    step10Timeline.to(lune, { 
      opacity: 0, 
      duration: 2.5,
      ease: "power2.inOut",
      onStart: () => console.log("🌑 Lune → PleineLune transformation")
    }, "+=0.5");
    step10Timeline.to(pleineLune, { 
      opacity: 1, 
      duration: 2.5,
      ease: "power2.inOut"
    }, "<");
  }

  // Migration des étoiles en parallèle
  const migrationCount = Math.min(etoilesDebut.length, etoilesFin.length);
  if (migrationCount > 0) {
    console.log(`🚀 Migration de ${migrationCount} étoiles`);
    
    etoilesDebut.forEach((etoileDebut, idx) => {
      const etoileFin = etoilesFin[idx];
      if (etoileDebut && etoileFin && idx < migrationCount) {
        // Calculer le déplacement nécessaire
        const dx = etoileFin.cx.baseVal.value - etoileDebut.cx.baseVal.value;
        const dy = etoileFin.cy.baseVal.value - etoileDebut.cy.baseVal.value;

        step10Timeline.to(etoileDebut, {
          duration: 5,
          x: dx,
          y: dy,
          ease: "power2.inOut",
          onStart: idx === 0 ? () => console.log("✨ Migration des étoiles démarrée") : null
        }, "<"); // Commencer en même temps que la transformation de la lune
      }
    });
  }

  console.log("▶️ Timeline step10 démarrée");
}

export function hideStep10({ soft = false } = {}) {
  console.log("👋 hideStep10 déclenché", { soft });

  isStep10Active = false;

  // Arrêter l'animation en cours
  if (step10Timeline) {
    step10Timeline.kill();
    step10Timeline = null;
    console.log("🛑 Timeline step10 reset");
  }

  if (!step10Container) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    if (soft) {
      // Fade out rapide sans reset complet
      gsap.to(step10Container, { 
        opacity: 0, 
        duration: 0.3,
        ease: "power2.out",
        onComplete: resolve
      });
    } else {
      // Reset complet
      gsap.to(step10Container, {
        opacity: 0,
        duration: 0.5,
        ease: "power2.out",
        onComplete: () => {
          // Reset spécifique de tous les éléments step10
          const initialEls = ["#step10Sol", "#step10Famille", "#step10Coeur"];
          const specialEls = ["#step10Lune", "#step10PleineLune", "#step10Communaute"];
          const allStaticEls = [...initialEls, ...specialEls];
          
          // Reset éléments statiques
          allStaticEls.forEach(sel => {
            const el = step10Container.querySelector(sel);
            if (el) {
              gsap.set(el, { 
                opacity: 0, 
                visibility: "hidden",
                clearProps: "all" 
              });
            }
          });

          // Reset des 67 étoiles (début et fin)
          for (let i = 1; i <= 67; i++) {
            const etoileDebut = step10Container.querySelector(`#etoileDebut${i}`);
            const etoileFin = step10Container.querySelector(`#etoileFin${i}`);
            
            if (etoileDebut) {
              gsap.set(etoileDebut, { 
                opacity: 0, 
                visibility: "hidden",
                x: 0, 
                y: 0,
                clearProps: "all" 
              });
            }
            
            if (etoileFin) {
              gsap.set(etoileFin, { 
                opacity: 0, 
                visibility: "hidden",
                clearProps: "all" 
              });
            }
          }

          gsap.set(step10Container, { 
            display: "none",
            pointerEvents: "none"
          });
          
          console.log("🧹 Step10 complètement nettoyé");
          resolve();
        }
      });
    }
  });
}
