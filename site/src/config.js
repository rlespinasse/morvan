import { layerGroups, styles, geometryTypes } from './generated-config.js';
import { detailBuilders } from './details.js';

// Context layer: perimetre-parc always visible at top of drawer
const perimetreParc = {
  id: 'administratif--perimetre-parc',
  label: 'Périmètre du Parc',
  file: 'data/layers/administratif/perimetre-parc.geojson',
};

// Remove perimetre-parc from layerGroups (it becomes a contextLayer)
const filteredLayerGroups = layerGroups.map((group) => {
  if (group.id !== 'administratif') return group;
  return {
    ...group,
    layers: group.layers.filter((l) => l.id !== 'administratif--perimetre-parc'),
  };
});

export const config = {
  map: {
    center: [47.1, 4.0],
    zoom: 10,
  },

  title: {
    heading: 'Parc naturel régional du Morvan',
    subtitle: 'Atlas des données ouvertes',
    icon: 'favicon.svg',
  },

  baseLayers: {
    CyclOSM: {
      url: 'https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png',
      options: {
        attribution:
          '&copy; <a href="https://www.cyclosm.org/">CyclOSM</a> &amp; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
        subdomains: 'abc',
      },
    },

    'IGN Plan': {
      url: 'https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2&STYLE=normal&FORMAT=image/png&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}',
      options: {
        attribution: '&copy; <a href="https://www.ign.fr/">IGN</a>',
        maxZoom: 19,
      },
    },

    'IGN Satellite': {
      url: 'https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=ORTHOIMAGERY.ORTHOPHOTOS&STYLE=normal&FORMAT=image/jpeg&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}',
      options: {
        attribution: '&copy; <a href="https://www.ign.fr/">IGN</a>',
        maxZoom: 19,
      },
    },

    OpenStreetMap: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      options: {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
        subdomains: 'abc',
      },
    },

    OpenTopoMap: {
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      options: {
        attribution:
          '&copy; <a href="https://opentopomap.org/">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
        maxZoom: 17,
        subdomains: 'abc',
      },
    },
  },

  defaultBaseLayer: 'IGN Plan',

  reverseLinksUrl: 'data/reverse-links.json',

  analytics: {
    provider: 'goatcounter',
    basePath: '/morvan/',
  },

  boundsLayerId: 'administratif--perimetre-parc',

  maskLayer: {
    sourceLayerId: 'administratif--perimetre-parc',
    fillOpacity: 0.25,
  },

  contextLayers: [perimetreParc],

  layerGroups: filteredLayerGroups,
  styles,
  geometryTypes,

  // Tooltips: functions that return a string from feature properties
  tooltips: {
    'administratif--communes': (p) => p.NOM,
    'administratif--communes-partenaires': (p) => p.NOM,
    'administratif--departements': (p) => p.NOM,
    'administratif--epci': (p) => p.NOM,
    'administratif--perimetre-parc': (p) => p.NOM_PNR,
    'patrimoine-culture--patrimoine-bati': (p) => p.Nom,
    'nature-environnement--natura2000': (p) => p.NOM,
    'tourisme-economie--marque-valeurs-parc': (p) => p.NOM_ETBS,
    'paysages--entites-paysageres': (p) => p.NOM,
    'paysages--sous-entites-paysageres': (p) => p.NOM,
  },

  // Search: {title, text, meta} — all functions
  searchableProps: {
    'administratif--communes': {
      title: (p) => p.NOM,
      text: ['NOM'],
      meta: (p) => 'Commune',
    },
    'administratif--communes-partenaires': {
      title: (p) => p.NOM,
      text: ['NOM'],
      meta: (p) => 'Commune partenaire',
    },
    'patrimoine-culture--patrimoine-bati': {
      title: (p) => p.Nom,
      text: ['Nom', 'Commune'],
      meta: (p) => p.Commune || 'Patrimoine bâti',
    },
    'tourisme-economie--marque-valeurs-parc': {
      title: (p) => p.NOM_ETBS,
      text: ['NOM_ETBS', 'COMMUNE'],
      meta: (p) => p.COMMUNE || 'Marque Valeurs Parc',
    },
  },

  detailBuilders,

  legalPages: [
    {
      id: 'about',
      label: 'À propos',
      content: `
        <h3>L'Atlas du Morvan</h3>
        <p>Cet atlas cartographie <strong>73 jeux de données géospatiales</strong> relatifs au
        <strong>Parc naturel régional du Morvan</strong> (Bourgogne-Franche-Comté), organisées
        en 9 catégories thématiques :</p>
        <ul>
          <li>Administratif</li>
          <li>Nature &amp; Environnement</li>
          <li>Hydrographie</li>
          <li>Paysages</li>
          <li>Patrimoine &amp; Culture</li>
          <li>Tourisme &amp; Économie</li>
          <li>Programmes &amp; Projets</li>
          <li>Démographie</li>
          <li>Énergie</li>
        </ul>
        <p>Les données proviennent majoritairement de
        <a href="https://www.data.gouv.fr/" target="_blank" rel="noopener">data.gouv.fr</a> et de
        <a href="https://trouver.ternum-bfc.fr/" target="_blank" rel="noopener">TerNum BFC</a>
        (Territoire Numérique Bourgogne-Franche-Comté). Elles ne sont pas rafraîchies en continu :
        la mise à jour se fait manuellement, à la demande. Voir l'onglet
        « Sources de données » pour le détail des licences et fonds de carte.</p>
      `,
    },
    {
      id: 'mentions',
      label: 'Mentions légales',
      content: `
        <h3>Éditeur</h3>
        <p>Ce site est un projet personnel de visualisation de données ouvertes relatives au
        Parc naturel régional du Morvan. Il n'est pas affilié au PNR du Morvan.</p>
        <p>Auteur : <a href="https://github.com/rlespinasse" target="_blank" rel="noopener">Romain Lespinasse</a></p>
        <h3>Hébergement</h3>
        <p>Ce site est hébergé sur <a href="https://pages.github.com/" target="_blank" rel="noopener">GitHub Pages</a>.</p>
        <h3>Mesure d'audience</h3>
        <p>Ce site utilise <a href="https://www.goatcounter.com/" target="_blank" rel="noopener">GoatCounter</a>,
        un outil de statistiques open source et respectueux de la vie privée.
        Aucune donnée personnelle n'est collectée, aucun cookie n'est utilisé
        et les visiteurs ne sont pas suivis entre les sites.</p>
      `,
    },
    {
      id: 'donnees',
      label: 'Sources de données',
      content: `
        <h3>Origine des données</h3>
        <p>Les données géographiques affichées sur cette carte proviennent de jeux de données
        ouverts publiés majoritairement par le <strong>Parc naturel régional du Morvan</strong>,
        avec des contributions de l'<strong>INSEE</strong> (démographie), du
        <strong>Ministère de l'Éducation nationale</strong> (établissements scolaires),
        de l'<strong>IGN</strong> et de l'<strong>ONF</strong> (données forestières), et
        d'<strong>Admin Express</strong> (limites administratives). Elles sont diffusées sur les
        plateformes :</p>
        <ul>
          <li><a href="https://www.data.gouv.fr/" target="_blank" rel="noopener">data.gouv.fr</a></li>
          <li><a href="https://trouver.ternum-bfc.fr/" target="_blank" rel="noopener">TerNum BFC</a> (Territoire Numérique Bourgogne-Franche-Comté)</li>
        </ul>
        <h3>Fonds de carte</h3>
        <ul>
          <li><a href="https://opentopomap.org/" target="_blank" rel="noopener">OpenTopoMap</a> — carte topographique © OpenTopoMap (<a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noopener">CC-BY-SA</a>)</li>
          <li><a href="https://www.cyclosm.org/" target="_blank" rel="noopener">CyclOSM</a> — carte cyclable et outdoor © CyclOSM &amp; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> (<a href="https://opendatacommons.org/licenses/odbl/" target="_blank" rel="noopener">ODbL</a>)</li>
          <li><a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> — © les contributeurs OpenStreetMap (<a href="https://opendatacommons.org/licenses/odbl/" target="_blank" rel="noopener">ODbL</a>)</li>
          <li><a href="https://www.ign.fr/" target="_blank" rel="noopener">IGN</a> — Plan IGN et Photographies aériennes © IGN (<a href="https://www.etalab.gouv.fr/licence-ouverte-open-licence/" target="_blank" rel="noopener">Licence Ouverte / Open Licence 2.0</a>)</li>
        </ul>
        <h3>Licence des données</h3>
        <p>Les jeux de données sont diffusés sous
        <a href="https://www.etalab.gouv.fr/licence-ouverte-open-licence/" target="_blank" rel="noopener">Licence Ouverte / Open Licence 2.0</a>
        (Etalab), sauf mention contraire. Consultez la page source de chaque jeu de données sur
        data.gouv.fr pour la licence précise et le producteur.</p>
        <h3>Fréquence de mise à jour</h3>
        <p>Les données ne sont <strong>pas rafraîchies automatiquement</strong> : elles sont
        téléchargées à nouveau manuellement (script <code>just fetch</code>) à l'initiative du
        mainteneur du site, sans calendrier fixe. La date de dernier téléchargement de chaque
        couche est disponible dans les métadonnées internes du projet.</p>
      `,
    },
    {
      id: 'confidentialite',
      label: 'Confidentialité',
      content: `
        <h3>Mesure d'audience</h3>
        <p>Ce site utilise <a href="https://www.goatcounter.com/" target="_blank" rel="noopener">GoatCounter</a>,
        un outil de statistiques open source et respectueux de la vie privée, pour mesurer :</p>
        <ul>
          <li>le nombre de visites,</li>
          <li>les pages consultées,</li>
          <li>la durée de visite.</li>
        </ul>
        <h3>Aucune donnée personnelle</h3>
        <p>Ce site n'utilise <strong>aucun cookie</strong> et ne collecte
        <strong>aucune donnée personnelle</strong>. Les adresses IP publiques ne sont
        <strong>pas stockées</strong>. Les requêtes provenant de <code>localhost</code> ou de
        réseaux privés sont ignorées par la mesure d'audience.</p>
        <h3>Aucun suivi</h3>
        <p>Les visiteurs ne sont pas suivis entre les sites et aucun profil individuel n'est
        constitué.</p>
      `,
    },
    {
      id: 'credits',
      label: 'Crédits',
      content: `
        <h3>Technologies</h3>
        <ul>
          <li><a href="https://leafletjs.com/" target="_blank" rel="noopener">Leaflet</a> — bibliothèque cartographique JavaScript</li>
          <li><a href="https://github.com/rlespinasse/leaflet-atlas" target="_blank" rel="noopener">leaflet-atlas</a> — composant d'atlas interactif au-dessus de Leaflet</li>
          <li><a href="https://vite.dev/" target="_blank" rel="noopener">Vite</a> — outil de build du site</li>
          <li>Scripts Python de téléchargement des données (fetch, reprojection, validation)</li>
        </ul>
        <h3>Code source</h3>
        <p>Le code de ce projet est disponible sur
        <a href="https://github.com/rlespinasse/morvan" target="_blank" rel="noopener">github.com/rlespinasse/morvan</a>.</p>
        <h3>Licences</h3>
        <ul>
          <li>Code du site : <strong>MIT</strong></li>
          <li>Données géographiques : <strong>Licence Ouverte / Open Licence 2.0</strong> (Etalab), sauf mention contraire</li>
        </ul>
        <h3>Auteur</h3>
        <p><a href="https://github.com/rlespinasse" target="_blank" rel="noopener">Romain Lespinasse</a></p>
      `,
    },
  ],
};
