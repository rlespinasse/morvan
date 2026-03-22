import { renderValue } from 'leaflet-atlas';

function getReverseLinksGroup(helpers, layerId, featureIndex) {
  const allLinks = helpers.getReverseLinks();
  if (!allLinks) return null;
  const layerLinks = allLinks[layerId];
  if (!layerLinks) return null;
  const featureLinks = layerLinks[String(featureIndex)];
  if (!featureLinks) return null;
  return helpers.buildReverseLinksSection(featureLinks, 'Voir aussi');
}

function withReverseLinks(helpers, layerId, featureIndex, groups) {
  const rl = getReverseLinksGroup(helpers, layerId, featureIndex);
  if (rl) groups.push(rl);
  return groups;
}

function communeDetail(helpers) {
  return (props, layerId, featureIndex) => {
    const groups = [
      {
        label: 'Informations',
        rows: [
          ['Nom', props.NOM],
          ['Département', props.DEPT || props.DEP || props.NOM_DEPT],
          ['EPCI', props.NOM_EPCI || props.EPCI],
          ['Population', props.POPULATION || props.POP],
          ['Surface (ha)', props.AREA_HA || props.SUPERFICIE],
          ['Code INSEE', props.INSEE_COM || props.CODE_INSEE],
          ['Maire', props.MAIRE],
        ].filter(([, v]) => v != null && v !== ''),
      },
    ];
    return helpers.buildDetail(props.NOM || 'Commune', layerId || 'administratif--communes',
      withReverseLinks(helpers, layerId || 'administratif--communes', featureIndex, groups));
  };
}

function patrimoineBatiDetail(helpers) {
  return (props, layerId, featureIndex) => {
    const lid = layerId || 'patrimoine-culture--patrimoine-bati';
    const groups = [
      {
        label: 'Informations',
        rows: [
          ['Nom', props.Nom],
          ['Thème', props.Theme],
          ['Type', props.Type],
          ['Commune', props.Commune],
          ['Datation', props.Datation],
          ['Statut', props.Statut],
          ['Protection', props.Protection],
        ].filter(([, v]) => v != null && v !== ''),
      },
    ];
    return helpers.buildDetail(props.Nom || 'Patrimoine bâti', lid,
      withReverseLinks(helpers, lid, featureIndex, groups));
  };
}

function marqueValeursParcDetail(helpers) {
  return (props, layerId, featureIndex) => {
    const lid = layerId || 'tourisme-economie--marque-valeurs-parc';
    const groups = [
      {
        label: 'Informations',
        rows: [
          ['Établissement', props.NOM_ETBS],
          ['Commune', props.COMMUNE],
          ['Type de produit', props.TYP_PDT],
        ].filter(([, v]) => v != null && v !== ''),
      },
    ];
    return helpers.buildDetail(props.NOM_ETBS || 'Marque Valeurs Parc', lid,
      withReverseLinks(helpers, lid, featureIndex, groups));
  };
}

function natura2000Detail(helpers) {
  return (props, layerId, featureIndex) => {
    const lid = layerId || 'nature-environnement--natura2000';
    const groups = [
      {
        label: 'Informations',
        rows: [
          ['Nom', props.NOM],
          ['Code', props.CODE],
          ['Animation', props.ANIMATION],
        ].filter(([, v]) => v != null && v !== ''),
      },
    ];
    return helpers.buildDetail(props.NOM || 'Natura 2000', lid,
      withReverseLinks(helpers, lid, featureIndex, groups));
  };
}

function genericDetail(helpers) {
  return (props, layerId, featureIndex) => {
    const entries = Object.entries(props)
      .filter(([, v]) => v != null && v !== '')
      .map(([k, v]) => [k, renderValue(v)]);
    const groups = [{ label: 'Propriétés', rows: entries }];
    return helpers.buildDetail('Détails', layerId,
      withReverseLinks(helpers, layerId, featureIndex, groups));
  };
}

export function detailBuilders(helpers) {
  const generic = genericDetail(helpers);
  return {
    'administratif--communes': communeDetail(helpers),
    'administratif--communes-partenaires': communeDetail(helpers),
    'patrimoine-culture--patrimoine-bati': patrimoineBatiDetail(helpers),
    'tourisme-economie--marque-valeurs-parc': marqueValeursParcDetail(helpers),
    'nature-environnement--natura2000': natura2000Detail(helpers),
    __default: generic,
  };
}
