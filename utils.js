// utils.js — version modulaire corrigée
// 🚀 Gère tous les éléments avec un attribut id dans les SVG (g, path, circle, rect, etc.)

/**
 * Charge un SVG externe dans un conteneur HTML.
 * @param {string} path - Chemin vers le fichier SVG.
 * @param {string} containerId - ID du conteneur <div> dans lequel charger le SVG.
 * @param {string} parentId - ID du parent (par défaut "graphic").
 * @param {string|null} visibleId - Si défini, seul cet élément reste visible.
 * @returns {Promise<HTMLElement|null>} Le conteneur créé/chargé.
 */
export async function loadSVG(path, containerId, parentId = "graphic", visibleId = null) {
  try {
    // Ajouter un cache buster pour forcer le rechargement du SVG
    const cacheBuster = `?v=${Date.now()}`;
    const response = await fetch(path + cacheBuster);
    if (!response.ok) {
      console.error(`❌ Impossible de charger le SVG: ${path}`);
      return null;
    }

    const text = await response.text();
    let container = document.getElementById(containerId);

    if (!container) {
      container = document.createElement("div");
      container.id = containerId;
      Object.assign(container.style, {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        opacity: 0, // invisible par défaut
        zIndex: 1500,
        pointerEvents: "none"
      });
      const parent = document.getElementById(parentId);
      if (parent) parent.appendChild(container);
      else console.warn(`⚠️ Parent #${parentId} introuvable`);
    }

    container.innerHTML = text;

    // 🚀 masquer tous les éléments avec id sauf visibleId
    if (visibleId) {
      const elements = container.querySelectorAll("[id]");
      elements.forEach(el => {
        if (el.id === visibleId) {
          el.style.display = "block";
        } else {
          el.style.display = "none";
        }
      });
    }

    return container;
  } catch (err) {
    console.error(`❌ Erreur lors du chargement du SVG: ${path}`, err);
    return null;
  }
}

/**
 * Rend visible un élément par id (opacity: 1).
 */
export function showElement(id) {
  const el = document.getElementById(id);
  if (el) el.style.opacity = 1;
}

/**
 * Cache un élément par id (opacity: 0).
 */
export function hideElement(id) {
  const el = document.getElementById(id);
  if (el) el.style.opacity = 0;
}
