import { loadSVG } from "../utils.js";

let step4Container = null;
let step4Timeline = null;
let isStep4Active = false;

// Variables spécifiques à step4
let stars = [];
let pearls = [];
let luneFemme = null;
let originalStarsData = [];
let animationGroup = null;

export async function showStep4() {
  console.log("✅ showStep4 déclenché");

  if (isStep4Active) {
    console.log("⚠️ Step4 déjà actif, ignoré");
    return Promise.resolve();
  }

  if (step4Timeline) {
    step4Timeline.kill();
    step4Timeline = null;
  }

  if (!step4Container) {
    step4Container = await loadSVG("./svg/step4_etoile_robe_perle2.svg", "step4SVG", "graphic");
    if (!step4Container) {
      console.error("❌ Impossible de charger step4Container");
      return Promise.reject("SVG non chargé");
    }
  }

  isStep4Active = true;

  gsap.set(step4Container, { 
    opacity: 1, 
    display: "block", 
    pointerEvents: "auto" 
  });

  const svgRoot = step4Container.querySelector("svg");
  if (!svgRoot) {
    console.error("❌ SVG root step4 introuvable");
    return Promise.reject("SVG root non trouvé");
  }

  const oldAnimGroup = svgRoot.querySelector("#step4_animations");
  if (oldAnimGroup) oldAnimGroup.remove();

  animationGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  animationGroup.id = "step4_animations";
  svgRoot.appendChild(animationGroup);

  luneFemme = svgRoot.querySelector("#lune_x5F_femme");
  stars = Array.from(svgRoot.querySelectorAll("#etoile circle"));
  pearls = Array.from(svgRoot.querySelectorAll("#perle circle"));

  console.log("🎯 Éléments trouvés:", { 
    luneFemme: !!luneFemme, 
    stars: stars.length, 
    pearls: pearls.length 
  });

  if (!luneFemme || stars.length === 0 || pearls.length === 0) {
    console.error("❌ Éléments manquants (luneFemme/stars/pearls)");
    return Promise.reject("Éléments SVG manquants");
  }

  stars.forEach((star, index) => {
    if (!star.id || star.id === "") {
      star.id = `star_original_${index}`;
    }
  });

  pearls.forEach((pearl, index) => {
    if (!pearl.id || pearl.id === "") {
      pearl.id = `pearl_original_${index}`;
    }
  });

  originalStarsData = stars.map(star => ({
    cx: star.getAttribute("cx"),
    cy: star.getAttribute("cy"),
    r: star.getAttribute("r"),
    fill: star.getAttribute("fill") || star.style.fill || "#eadd42",
    opacity: star.getAttribute("opacity") || "1"
  }));

  console.log("💾 Sauvegarde des données originales:", originalStarsData.length);

  gsap.set([stars, pearls], { 
    opacity: 0,
    visibility: "visible",
    clearProps: "transform,x,y"
  });

  gsap.set(luneFemme, { 
    opacity: 0,
    visibility: "visible"
  });

  step4Timeline = gsap.timeline({
    onComplete: () => console.log("🎬 Animation step4 terminée")
  });

  step4Timeline.to(luneFemme, { 
    opacity: 1, 
    duration: 0.8,
    ease: "power2.out",
    onStart: () => console.log("🌙 Lune-Femme fade-in")
  });

  step4Timeline.to(stars, { 
    opacity: 1, 
    stagger: 0.01, 
    duration: 0.2,
    ease: "power2.out",
    onStart: () => console.log("⭐ Étoiles originales apparition")
  }, "-=0.4");

  const clones = [];
  stars.forEach((star, i) => {
    const clone = star.cloneNode(true);
    clone.id = `star_clone_${i}`;
    clone.setAttribute("data-clone", "true");
    animationGroup.appendChild(clone);

    const originalData = originalStarsData[i];
    gsap.set(clone, {
      opacity: 0,
      visibility: "visible",
      attr: {
        cx: originalData.cx,
        cy: originalData.cy,
        r: originalData.r,
        fill: originalData.fill
      }
    });
    clones.push(clone);
  });

  console.log("🔄 Clones créés:", clones.length);

  step4Timeline.to(clones, { 
    opacity: 1, 
    stagger: 0.005,
    duration: 0.15,
    ease: "power2.out",
    onStart: () => console.log("✨ Clones apparition")
  });

  const migrating = [...stars, ...clones];
  const availablePearls = pearls.slice(0, migrating.length);

  console.log("🚀 Migration:", {
    migrating: migrating.length,
    targetPearls: availablePearls.length
  });

  migrating.forEach((star, i) => {
    const target = availablePearls[i];
    if (!target) return;

    step4Timeline.to(star, {
      duration: 0.2,
      attr: {
        cx: target.getAttribute("cx"),
        cy: target.getAttribute("cy"),
        r: target.getAttribute("r")
      },
      fill: target.getAttribute("fill") || target.style.fill || "#000000ff",
      ease: "power2.inOut",
      onComplete: () => {
        gsap.set(star, { opacity: 0 });
        gsap.set(target, { opacity: 1 });
      }
    }, ">+0.0002");
  });

  step4Timeline.call(() => console.log("🔄 Restauration des étoiles originales - DÉBUT"), null, null, "+=0.5");

  // ✅ Nouvelle logique : restauration immédiate puis fade-in global
  step4Timeline.call(() => {
    stars.forEach((star, i) => {
      const data = originalStarsData[i];
      star.setAttribute("cx", data.cx);
      star.setAttribute("cy", data.cy);
      star.setAttribute("r", data.r);
      star.setAttribute("fill", data.fill);
      star.style.fill = "";
      gsap.set(star, { opacity: 0, visibility: "visible" });
    });
    console.log("⭐ Restauration des étoiles originales effectuée");
  }, null, null, ">+0.2");

  step4Timeline.to(stars, {
    duration: 2,
    opacity: 1,
    ease: "power2.out",
    onStart: () => console.log("🌟 Fade-in global des étoiles")
  });

  step4Timeline.call(() => console.log("🎬 Toutes les étoiles originales sont réapparues"));

  console.log("▶️ Timeline step4 démarrée");
  return Promise.resolve();
}

export function hideStep4({ soft = false } = {}) {
  console.log("👋 hideStep4 déclenché", { soft });
  isStep4Active = false;

  if (step4Timeline) {
    step4Timeline.kill();
    step4Timeline = null;
  }

  if (!step4Container) return Promise.resolve();

  return new Promise((resolve) => {
    if (soft) {
      gsap.to(step4Container, { 
        opacity: 0, 
        duration: 0.3,
        ease: "power2.out",
        onComplete: resolve
      });
    } else {
      // Reset complet avec destruction du DOM
      gsap.to(step4Container, {
        opacity: 0,
        duration: 0.5,
        ease: "power2.out",
        onComplete: () => {
          // Détruire complètement le conteneur pour éviter les IDs dupliqués
          if (step4Container && step4Container.parentNode) {
            step4Container.parentNode.removeChild(step4Container);
          }
          step4Container = null;
          animationGroup = null;
          stars = [];
          pearls = [];
          luneFemme = null;
          originalStarsData = [];

          console.log("🧹 Step4 complètement détruit");
          resolve();
        }
      });
    }
  });
}
