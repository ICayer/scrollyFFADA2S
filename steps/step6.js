import { loadSVG } from "../utils.js";

let frameContainer = null;
let communeContainer = null;
let tl = null;
let isStep6Active = false;

export async function showStep6() {
  console.log("✅ showStep6 déclenché");

  // Éviter les appels multiples
  if (isStep6Active) {
    console.log("⚠️ Step6 déjà actif, ignoré");
    return;
  }

  // Nettoyer l'ancienne timeline si elle existe
  if (tl) {
    tl.kill();
    tl = null;
  }

  isStep6Active = true;

  // Vérifier ou charger les frames
  if (!frameContainer) {
    frameContainer = await loadSVG("./svg/step6_frame2.svg", "step6FrameSVG", "graphic");
  }
  if (!frameContainer) {
    console.error("❌ Impossible de charger le SVG step6_frame");
    return;
  }

  gsap.to(frameContainer, { 
    opacity: 1, 
    display: "block", 
    duration: 0.5,
    pointerEvents: "auto"
  });

  const frames = [
    frameContainer.querySelector("#frame1"),
    frameContainer.querySelector("#frame2"),
    frameContainer.querySelector("#frame3"),
    frameContainer.querySelector("#frame4"),
    frameContainer.querySelector("#frame5"),
  ];

  console.log("🎯 Frames trouvées:", frames.filter(f => f).length);

  // Masquer toutes sauf frame1
  frames.forEach((f, i) => {
    if (f) gsap.set(f, { opacity: i === 0 ? 1 : 0, display: "block", visibility: "visible" });
  });

  // Vérifier ou charger le SVG commun
  if (!communeContainer) {
    communeContainer = await loadSVG("./svg/step6_commune.svg", "step6CommuneSVG", "graphic");
  }
  if (!communeContainer) {
    console.error("❌ Impossible de charger le SVG step6_commune");
    return;
  }

  gsap.to(communeContainer, { 
    opacity: 1, 
    display: "block", 
    duration: 0.5,
    pointerEvents: "auto"
  });

  const sol = communeContainer.querySelector("#step6Sol");
  const persos = [];
  for (let i = 1; i <= 8; i++) {
    const perso = communeContainer.querySelector(`#step6Perso${i}`);
    if (perso) {
      gsap.set(perso, { opacity: 0, display: "block", visibility: "visible" });
      persos.push(perso);
    }
  }
  if (sol) gsap.set(sol, { opacity: 0, display: "block", visibility: "visible" });

  console.log("🎯 Éléments commune trouvés:", { 
    sol: !!sol, 
    persos: persos.length 
  });

  // Timeline
  tl = gsap.timeline({
    onComplete: () => {
      console.log("🎬 Animation step6 terminée");
    }
  });

  // Animation frames
  for (let i = 0; i < frames.length - 1; i++) {
    const current = frames[i];
    const next = frames[i + 1];
    if (current && next) {
      tl.to(current, {
        opacity: 0,
        duration: 1.5,
        onStart: () => console.log(`📻 Frame${i + 1} fade-out`)
      });
      tl.to(next, {
        opacity: 1,
        duration: 1.5,
        onStart: () => console.log(`📺 Frame${i + 2} fade-in`)
      }, "<");
    }
  }
  if (frames[4]) {
    tl.to(frames[4], {
      opacity: 0,
      duration: 1.5,
      onStart: () => console.log("📻 Frame5 fade-out (fin des frames)")
    });
  }

  // Pause
  tl.to({}, { duration: 1, onStart: () => console.log("⏸ Pause 1s avant sol") });

  // Sol
  if (sol) {
    tl.to(sol, {
      opacity: 1,
      duration: 1,
      onStart: () => console.log("🌍 Sol visible")
    });
  }

  // Persos un par un
  persos.forEach((perso, idx) => {
    tl.to(perso, {
      opacity: 1,
      duration: 1,
      onStart: () => console.log(`👤 Perso${idx + 1} visible`)
    });
  });

  console.log("▶️ Timeline step6 démarrée");
}

export function hideStep6({ soft = false } = {}) {
  console.log("👋 hideStep6 déclenché", { soft });

  isStep6Active = false;

  // Arrêter l'animation en cours
  if (tl) {
    tl.kill();
    tl = null;
    console.log("🛑 Timeline step6 reset");
  }

  const promises = [];

  if (!frameContainer && !communeContainer) {
    return Promise.resolve();
  }

  if (soft) {
    // Fade out rapide sans reset complet
    if (frameContainer) {
      promises.push(new Promise(resolve => {
        gsap.to(frameContainer, { 
          opacity: 0, 
          duration: 0.3,
          ease: "power2.out",
          onComplete: resolve
        });
      }));
    }

    if (communeContainer) {
      promises.push(new Promise(resolve => {
        gsap.to(communeContainer, { 
          opacity: 0, 
          duration: 0.3,
          ease: "power2.out",
          onComplete: resolve
        });
      }));
    }
  } else {
    // Reset complet
    if (frameContainer) {
      promises.push(new Promise(resolve => {
        gsap.to(frameContainer, {
          opacity: 0,
          duration: 0.5,
          ease: "power2.out",
          onComplete: () => {
            // Reset tous les frames
            const allFrames = frameContainer.querySelectorAll("[id^='frame']");
            gsap.set(allFrames, { 
              opacity: 0, 
              visibility: "hidden",
              clearProps: "all" 
            });
            
            gsap.set(frameContainer, { 
              display: "none",
              pointerEvents: "none"
            });
            
            console.log("🧹 Frames complètement nettoyées");
            resolve();
          }
        });
      }));
    }

    if (communeContainer) {
      promises.push(new Promise(resolve => {
        gsap.to(communeContainer, {
          opacity: 0,
          duration: 0.5,
          ease: "power2.out",
          onComplete: () => {
            // Reset sol et persos
            const sol = communeContainer.querySelector("#step6Sol");
            const allPersos = communeContainer.querySelectorAll("[id^='step6Perso']");
            
            if (sol) {
              gsap.set(sol, { 
                opacity: 0, 
                visibility: "hidden",
                clearProps: "all" 
              });
            }
            
            gsap.set(allPersos, { 
              opacity: 0, 
              visibility: "hidden",
              clearProps: "all" 
            });
            
            gsap.set(communeContainer, { 
              display: "none",
              pointerEvents: "none"
            });
            
            console.log("🧹 Sol + persos complètement nettoyés");
            resolve();
          }
        });
      }));
    }
  }

  return Promise.all(promises);
}
