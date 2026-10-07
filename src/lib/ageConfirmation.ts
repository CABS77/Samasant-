/**
 * Confirmation d'âge : SamaSanté est réservé aux adultes (18 ans ou plus).
 * Un parent qui consulte pour son enfant reste l'utilisateur adulte.
 *
 * La confirmation est mémorisée sur l'appareil pour ne pas être redemandée
 * à chaque pré-diagnostic. Le stockage peut être indisponible (navigation
 * privée, données bloquées) : dans ce cas on redemandera simplement.
 */

export const AGE_CONFIRMATION_KEY = 'samasante.ageConfirmed.v1';
export const MINIMUM_AGE = 18;

export function hasConfirmedAdult(): boolean {
  try {
    return typeof window !== 'undefined' && window.localStorage.getItem(AGE_CONFIRMATION_KEY) === 'true';
  } catch {
    return false;
  }
}

export function confirmAdult(): void {
  try {
    window.localStorage.setItem(AGE_CONFIRMATION_KEY, 'true');
  } catch {
    // Stockage indisponible : la confirmation vaut pour cette session uniquement.
  }
}
