import { fadeTo } from '../script.js';

export function showStep14() {
  // Affiche l'image associée à ce step avec fade
  // Et lance éventuellement des animations spécifiques (à ajouter ici)
  fadeTo('images/image14.png', () => {
    // Callback après fade-in, ici vous pouvez lancer d'autres animations pour le step1
    // Exemple : animationTexte(), animationGraphique(), etc.
  });
}

export function hideStep14() {
  // On peut simplement faire disparaître l'image du step (fade-out)
  
  // Si vous avez d'autres éléments spécifiques, ajouter ici leur remise à zéro ou fade-out
}