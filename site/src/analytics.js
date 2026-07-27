// Mesure d'audience GoatCounter (compte personnel « rlespinasse »).
//
// `basePath` préfixe les événements personnalisés par « /morvan/ » — le compte
// GoatCounter héberge plusieurs projets, ce préfixe les cloisonne. Les vues de
// page sont déjà comptées par le script `count.js` chargé dans index.html ;
// `initAnalytics` se contente de vérifier que ce script est bien présent et
// `trackEvent` sert aux événements applicatifs additionnels (ex. interactions
// spécifiques à l'atlas).
//
// Les hits depuis localhost / réseaux privés sont ignorés par défaut par
// count.js (option `allow_local` non activée).
export const analyticsConfig = {
  account: 'rlespinasse',
  basePath: '/morvan/',
  endpoint: 'https://rlespinasse.goatcounter.com/count',
};

function isLocalhost() {
  return (
    location.hostname === 'localhost' ||
    location.hostname === '127.0.0.1' ||
    location.hostname === '0.0.0.0'
  );
}

export function initAnalytics() {
  if (isLocalhost()) return;
  if (typeof window === 'undefined' || !window.goatcounter) {
    // Le script count.js (chargé depuis index.html) n'est pas encore prêt,
    // ou l'audience est désactivée (bloqueur de pub, etc.) : on ne fait rien.
    return;
  }
}

export function trackEvent(name, value) {
  if (isLocalhost()) return;
  if (typeof window === 'undefined' || !window.goatcounter || !window.goatcounter.count) return;

  window.goatcounter.count({
    path: analyticsConfig.basePath + name,
    title: value,
    event: true,
  });
}
