// script.js — version corrigée pour éliminer les conflits de timing
import { showStep0, hideStep0 } from './steps/step0.js';
import { showStep1, hideStep1 } from './steps/step1.js';
import { showStep2, hideStep2 } from './steps/step2.js';
import { showStep3, hideStep3 } from './steps/step3.js';
import { showStep4, hideStep4 } from './steps/step4.js';
import { showStep5, hideStep5 } from './steps/step5.js';
import { showStep6, hideStep6 } from './steps/step6.js';
import { showStep7, hideStep7 } from './steps/step7.js';
import { showStep8, hideStep8 } from './steps/step8.js';
import { showStep9, hideStep9 } from './steps/step9.js';
import { showStep10, hideStep10 } from './steps/step10.js';

// ==================== Controllers ====================
const stepControllers = [
  { show: showStep1, hide: hideStep1 },   // index 0 = step 1
  { show: showStep2, hide: hideStep2 },   // index 1 = step 2
  { show: showStep3, hide: hideStep3 },   // index 2 = step 3
  { show: showStep4, hide: hideStep4 },
  { show: showStep5, hide: hideStep5 },
  { show: showStep6, hide: hideStep6 },
  { show: showStep7, hide: hideStep7 },
  { show: showStep8, hide: hideStep8 },
  { show: showStep9, hide: hideStep9 },
  { show: showStep10, hide: hideStep10 },
];

const steps = document.querySelectorAll(".step");

// ==================== State Management ====================
const scroller = scrollama();
let welcomeDismissed = false;
let currentStepIndex = -1;
let isTransitioning = false;

// ==================== Helper Functions ====================
async function cleanupStep(index, soft = false) {
  if (index >= 0 && index < stepControllers.length) {
    console.log(`🧹 Nettoyage step ${index + 1} (soft: ${soft})`);
    
    // Cacher immédiatement le texte
    if (steps[index]) {
      steps[index].classList.remove("active");
    }
    
    // Nettoyer le SVG
    if (stepControllers[index]?.hide) {
      await stepControllers[index].hide({ soft });
    }
  }
}

async function activateStep(index, element) {
  if (index >= 0 && index < stepControllers.length) {
    console.log(`✨ Activation step ${index + 1}`);
    
    // Activer le SVG
    if (stepControllers[index]?.show) {
      await stepControllers[index].show();
    }
    
    // Montrer le texte
    if (element) {
      element.classList.add("active");
    }
  }
}

// ==================== Transition Management ====================
async function transitionToStep(newIndex, element, direction) {
  if (isTransitioning) {
    console.log("⏸️ Transition en cours, ignorée");
    return;
  }

  isTransitioning = true;
  console.log(`🔄 Transition vers step ${newIndex + 1} (${direction})`);

  try {
    // 1. Nettoyer l'ancien step rapidement
    if (currentStepIndex >= 0 && currentStepIndex !== newIndex) {
      await cleanupStep(currentStepIndex, true); // soft cleanup
    }

    // 2. Court délai pour éviter les conflits GSAP
    await new Promise(resolve => setTimeout(resolve, 100));

    // 3. Activer le nouveau step
    await activateStep(newIndex, element);
    currentStepIndex = newIndex;

  } catch (error) {
    console.error("❌ Erreur durante transition:", error);
  } finally {
    isTransitioning = false;
  }
}

// ==================== Scrollama Event Handlers ====================
function handleStepEnter({ element, index, direction }) {
  console.log(`👉 Step Enter: ${index + 1}, Direction: ${direction}, Current: ${currentStepIndex + 1}`);
  
  // Masquer step0 (accueil) dès qu'on entre dans le scroll
  if (!welcomeDismissed && index >= 0) {
    hideStep0({ soft: true });
    welcomeDismissed = true;
  }

  // Si on change de step, faire la transition
  if (index !== currentStepIndex) {
    transitionToStep(index, element, direction);
  }
}

function handleStepExit({ element, index, direction }) {
  console.log(`🚪 Step Exit: ${index + 1}, Direction: ${direction}, Current: ${currentStepIndex + 1}`);

  // Gérer les sorties complètes du scroll
  if (direction === "down" && index === steps.length - 1) {
    // Sorti en bas
    setTimeout(() => {
      if (currentStepIndex >= 0) {
        cleanupStep(currentStepIndex, false); // cleanup complet
        currentStepIndex = -1;
      }
    }, 200);
    console.log("📤 Sorti du scroll vers le bas");
  }
  
  if (direction === "up" && index === 0) {
    // Retour vers l'accueil
    setTimeout(() => {
      if (currentStepIndex >= 0) {
        cleanupStep(currentStepIndex, false); // cleanup complet
        currentStepIndex = -1;
      }
      
      // Réafficher step0 après un délai
      setTimeout(() => {
        showStep0();
        welcomeDismissed = false;
      }, 300);
    }, 200);
    console.log("📤 Retour à l'accueil");
  }
}

// ==================== Scrollama Init ====================
function initScrollama() {
  scroller
    .setup({
      step: ".step",
      offset: 0.5,
      debug: false, // Mettre à true pour déboguer le positionnement
    })
    .onStepEnter(handleStepEnter)
    .onStepExit(handleStepExit);

  // Gérer le resize avec debounce
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      console.log("📐 Resize détecté, recalcul Scrollama");
      scroller.resize();
    }, 250);
  });
}

// ==================== Init ====================
window.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 Initialisation du scrollytelling");
  
  // Afficher l'accueil au départ
  showStep0();
  
  // Attendre que les SVG soient prêts avant d'initialiser Scrollama
  setTimeout(() => {
    initScrollama();
    console.log("📜 Scrollama initialisé");
  }, 200);
});

// ==================== Debug Tools ====================
// Raccourci pour déboguer (Ctrl+D)
window.addEventListener("keydown", (e) => {
  if (e.key === "d" && e.ctrlKey) {
    console.log("🔧 Debug State:", {
      currentStepIndex: currentStepIndex + 1,
      welcomeDismissed,
      isTransitioning,
      activeSteps: Array.from(steps).map((step, i) => ({
        step: i + 1,
        active: step.classList.contains("active")
      }))
    });
  }
});

// Raccourci pour forcer un reset (Ctrl+R)
window.addEventListener("keydown", (e) => {
  if (e.key === "r" && e.ctrlKey && e.shiftKey) {
    e.preventDefault();
    console.log("🔄 Reset forcé");
    
    // Nettoyer tous les steps
    for (let i = 0; i < stepControllers.length; i++) {
      cleanupStep(i, false);
    }
    
    currentStepIndex = -1;
    isTransitioning = false;
    welcomeDismissed = false;
    
    showStep0();
  }
});