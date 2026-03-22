import { layerGroups, styles, geometryTypes } from './generated-config.js';
import { detailBuilders } from './details.js';

// Context layer: perimetre-parc always visible at top of drawer
const perimetreParc = {
  id: 'administratif--perimetre-parc',
  label: 'Périmètre du Parc',
  file: 'data/layers/administratif/perimetre-parc.geojson',
};

// Remove perimetre-parc from layerGroups (it becomes a contextLayer)
const filteredLayerGroups = layerGroups.map(group => {
  if (group.id !== 'administratif') return group;
  return {
    ...group,
    layers: group.layers.filter(l => l.id !== 'administratif--perimetre-parc'),
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
    'CyclOSM': {
      url: 'https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png',
      options: {
        attribution: '&copy; <a href="https://www.cyclosm.org/">CyclOSM</a> &amp; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
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

    'OpenStreetMap': {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      options: {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
        subdomains: 'abc',
      },
    },

    'OpenTopoMap': {
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      options: {
        attribution: '&copy; <a href="https://opentopomap.org/">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
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
        ouverts publiés par le <strong>Parc naturel régional du Morvan</strong> sur les plateformes :</p>
        <ul>
          <li><a href="https://www.data.gouv.fr/" target="_blank" rel="noopener">data.gouv.fr</a></li>
          <li><a href="https://trouver.ternum-bfc.fr/" target="_blank" rel="noopener">TerNum BFC</a> (Territoire Numérique Bourgogne-Franche-Comté)</li>
        </ul>
        <h3>Fonds de carte</h3>
        <ul>
          <li><a href="https://opentopomap.org/" target="_blank" rel="noopener">OpenTopoMap</a> — carte topographique © OpenTopoMap (CC-BY-SA)</li>
          <li><a href="https://www.cyclosm.org/" target="_blank" rel="noopener">CyclOSM</a> — carte cyclable et outdoor © CyclOSM &amp; OpenStreetMap</li>
          <li><a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> — © les contributeurs OpenStreetMap</li>
          <li><a href="https://www.ign.fr/" target="_blank" rel="noopener">IGN</a> — Plan IGN et Photographies aériennes © IGN</li>
        </ul>
        <h3>Licence des données</h3>
        <p>Les jeux de données sont diffusés sous
        <a href="https://www.etalab.gouv.fr/licence-ouverte-open-licence/" target="_blank" rel="noopener">Licence Ouverte / Open Licence 2.0</a>
        (Etalab), sauf mention contraire.</p>
      `,
    },
    {
      id: 'licence',
      label: 'Licence du site',
      content: `
        <h3>Licence MIT</h3>
        <p>Copyright © 2026 Romain Lespinasse</p>
        <p>L'ensemble du code source de ce site est distribué sous licence MIT.
        Vous êtes libre de l'utiliser, le copier, le modifier et le distribuer,
        sous réserve d'inclure l'avis de copyright ci-dessus.</p>
        <p>Le texte complet de la licence est disponible dans le
        <a href="https://github.com/rlespinasse/morvan" target="_blank" rel="noopener">dépôt GitHub</a> du projet.</p>
      `,
    },
  ],
};
