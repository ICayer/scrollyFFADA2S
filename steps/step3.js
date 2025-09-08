import { loadSVG } from "../utils.js";

let step3Container = null;
let step3Timeline = null;
let isStep3Active = false;
let generatedGroup = null;

export async function showStep3() {
  console.log("✅ showStep3 déclenché");

  // Éviter les appels multiples
  if (isStep3Active) {
    console.log("⚠️ Step3 déjà actif, ignoré");
    return;
  }

  // Nettoyer l'ancienne timeline si elle existe
  if (step3Timeline) {
    step3Timeline.kill();
    step3Timeline = null;
  }

  // Charger le SVG si pas déjà présent
  if (!step3Container) {
    step3Container = await loadSVG("./svg/step3_etoile_tete_commune2.svg", "step3SVG", "graphic");
    if (!step3Container) {
      console.error("❌ Impossible de charger le SVG step3");
      return;
    }
  }

  isStep3Active = true;

  // Container visible et interactif
  gsap.set(step3Container, { 
    opacity: 1, 
    display: "block", 
    pointerEvents: "auto" 
  });

  // Récupérer les éléments spécifiques
  const communaute = step3Container.querySelector("#step3Communaute");
  const etoiles = step3Container.querySelectorAll('circle[id^="step3Etoile"]');
  const tetes = step3Container.querySelectorAll('g[id^="step3Tete"]');

  console.log("🎯 Éléments trouvés:", { 
    communaute, 
    etoiles: etoiles.length, 
    tetes: tetes.length 
  });

  // États initiaux clairs
  gsap.set(etoiles, { opacity: 0, visibility: "visible" });
  gsap.set(tetes, { opacity: 0, visibility: "visible" });

  // Générer les 200 étoiles dans un <g> dédié (seulement si pas déjà fait)
  if (!generatedGroup) {
    const svg = step3Container.querySelector("svg");
    if (svg) {
      generatedGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
      generatedGroup.setAttribute("id", "generatedStars");
      svg.insertBefore(generatedGroup, svg.firstChild);

      for (let i = 0; i < 300; i++) {
        const star = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        const x = Math.random() * 800;
        const y = Math.random() * 600;
        const r = Math.random() * 1.5 + 0.5;

        star.setAttribute("cx", x);
        star.setAttribute("cy", y);
        star.setAttribute("r", r);
        star.setAttribute("fill", "#eadd42");
        star.setAttribute("opacity", "1");
        generatedGroup.appendChild(star);
      }
      
      console.log("🌟 Généré", generatedGroup.children.length, "étoiles");
    }
  }

  // S'assurer que les étoiles générées sont visibles
  if (generatedGroup) {
    gsap.set(generatedGroup.querySelectorAll("circle"), { 
      opacity: 1, 
      visibility: "visible" 
    });
  }

  // Créer la nouvelle timeline
  step3Timeline = gsap.timeline({
    onComplete: () => {
      console.log("🎬 Animation step3 terminée");
    }
  });

  // Animation complexe : migration des étoiles
  if (generatedGroup && etoiles.length > 0) {
    // Étape 1 : migration des étoiles vers leurs positions finales
    etoiles.forEach((etoile, i) => {
      const cx = parseFloat(etoile.getAttribute("cx"));
      const cy = parseFloat(etoile.getAttribute("cy"));
      const r = parseFloat(etoile.getAttribute("r")) || 1;

      const star = generatedGroup.children[i];
      if (star) {
        step3Timeline.to(star, {
          duration: 3,
          attr: { cx, cy, r },
          ease: "power2.out",
          onComplete: () => {
            // Révéler l'étoile finale et cacher l'étoile mobile
            gsap.set(etoile, { opacity: 1, visibility: "visible" });
            gsap.set(star, { opacity: 0 });
          },
        }, i < 10 ? "migration" : `migration+=${i * 0.1}`);
      }
    });

    // Étape 2 : migration des têtes
    tetes.forEach((tete, i) => {
      const star = generatedGroup.children[etoiles.length + i];
      if (star && tete.getBBox) {
        try {
          const bbox = tete.getBBox();
          step3Timeline.to(star, {
            duration: 2,
            attr: { 
              cx: bbox.x + bbox.width / 2, 
              cy: bbox.y + bbox.height / 2, 
              r: 0 
            },
            ease: "power2.inOut",
            onComplete: () => {
              gsap.set(tete, { opacity: 1, visibility: "visible" });
              gsap.set(star, { opacity: 0 });
            },
          }, `tetes+=${i * 0.6}`);
        } catch (e) {
          console.warn("⚠️ Impossible de récupérer bbox pour tête", i, e);
        }
      }
    });

    // Étape 3 : disparition des étoiles restantes
    step3Timeline.to(generatedGroup.querySelectorAll("circle"), {
      duration: 1,
      opacity: 0,
      ease: "power2.out"
    }, "cleanup");
  }

  console.log("▶️ Timeline step3 démarrée");
}

export function hideStep3({ soft = false } = {}) {
  console.log("👋 hideStep3 déclenché", { soft });

  isStep3Active = false;

  // Arrêter l'animation en cours
  if (step3Timeline) {
    step3Timeline.kill();
    step3Timeline = null;
  }

  if (!step3Container) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    if (soft) {
      // Fade out rapide sans reset complet
      gsap.to(step3Container, { 
        opacity: 0, 
        duration: 0.3,
        ease: "power2.out",
        onComplete: resolve
      });
    } else {
      // Reset complet
      gsap.to(step3Container, {
        opacity: 0,
        duration: 0.5,
        ease: "power2.out",
        onComplete: () => {
          // Reset tous les éléments SVG
          const allEls = step3Container.querySelectorAll("g, path, rect, circle");
          gsap.set(allEls, { 
            opacity: 0, 
            visibility: "hidden",
            clearProps: "all" 
          });

          // Nettoyer le groupe d'étoiles générées
          if (generatedGroup) {
            gsap.set(generatedGroup.querySelectorAll("circle"), { 
              opacity: 0,
              visibility: "hidden"
            });
          }
          
          gsap.set(step3Container, { 
            display: "none",
            pointerEvents: "none"
          });
          
          console.log("🧹 Step3 complètement nettoyé");
          resolve();
        }
      });
    }
  });
}