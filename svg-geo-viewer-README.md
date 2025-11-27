# 📚 SVG_GEO Viewer - Documentation d'utilisation

## 🎯 Vue d'ensemble

**SVG_GEO Viewer** est une bibliothèque JavaScript vanilla (sans dépendances) pour visualiser et interagir avec des fichiers SVG enrichis selon la norme **SVG_GEO v0.1**.

**Fonctionnalités principales** :
- ✅ Visualisation interactive de plans SVG avec métadonnées
- ✅ Système de couches (layers) avec gestion de visibilité et d'opacité
- ✅ Zoom et déplacement (pan) fluides
- ✅ Affichage d'informations au survol et en modal
- ✅ Menu contextuel personnalisable
- ✅ Mode plein écran
- ✅ Export SVG et copie dans le presse-papier
- ✅ Système d'événements pour intégration dans vos applications
- ✅ Multilingue (français/anglais) avec traductions personnalisables
- ✅ Configuration complète via options

**Version actuelle** : 1.3.6  
**Licence** : À définir  
**Dépendances** : Aucune (vanilla JavaScript)

---

## 📦 Installation

### Option 1 : Inclusion directe

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Mon application SVG_GEO</title>
</head>
<body>
  <div id="viewer"></div>
  
  <script src="svg-geo-viewer.js"></script>
  <script>
    const viewer = new SVGGeoViewer('viewer');
    viewer.loadSVG('mon-plan.svg');
  </script>
</body>
</html>
```

### Option 2 : Module ES6 (si configuré)

```javascript
import SVGGeoViewer from './svg-geo-viewer.js';

const viewer = new SVGGeoViewer('viewer');
await viewer.loadSVG('mon-plan.svg');
```

---

## 🚀 Démarrage rapide

### 1. Créer le conteneur HTML

```html
<div id="viewer" style="width: 100%; height: 600px;"></div>
```

### 2. Initialiser le viewer

```javascript
const viewer = new SVGGeoViewer('viewer', {
  showLayerControl: true,
  showHoverInfo: true,
  enableModal: true,
  enableZoom: true,
  enablePan: true,
  enableContextMenu: true,
  locale: 'fr'
});
```

### 3. Charger un fichier SVG

```javascript
// Option 1 : Depuis un fichier
await viewer.loadSVG('mon-plan.svg');

// Option 2 : Depuis une chaîne de caractères
const svgString = '<?xml version="1.0"?>...';
await viewer.loadSVGFromString(svgString);
```

### 4. Interagir avec le viewer

```javascript
// Zoomer
viewer.setZoom(1.5);

// Masquer/afficher une couche
viewer.toggleLayer('buildings', false);

// Mode plein écran
viewer.toggleFullscreen();

// Réinitialiser la vue
viewer.resetView();
```

---

## ⚙️ Options de configuration

### Options disponibles

```javascript
const viewer = new SVGGeoViewer('containerId', {
  // Interface utilisateur
  showLayerControl: true,        // Afficher les contrôles de couches en bas
  showHoverInfo: true,            // Afficher les infos au survol
  enableModal: true,              // Activer la modal au clic
  modalContainer: null,           // Sélecteur CSS pour modal externe (ex: '#my-modal')
  
  // Interactions
  enableZoom: true,               // Activer le zoom (molette souris)
  enablePan: true,                // Activer le déplacement (drag & drop)
  enableContextMenu: true,        // Activer le menu contextuel (clic droit)
  fitToViewOnLoad: true,          // Centrer le SVG au chargement
  
  // Menu contextuel personnalisé
  contextMenuItems: [
    { label: 'Mon action', icon: '⚡', callback: (viewer) => { ... } }
  ],
  
  // Langue
  locale: 'fr',                   // 'fr' ou 'en'
  
  // Filtrage des champs (nouveauté v1.3.4)
  displayFields: null,            // Liste des champs à afficher (ex: ['name', 'area'])
  excludeFields: [],              // Liste des champs à exclure (ex: ['internalId'])
  
  // Export HTML personnalisé (nouveauté v1.3.4)
  customCSS: ''                   // CSS personnalisé pour les exports HTML
});
```

### Exemples de configuration

#### Configuration minimaliste

```javascript
const viewer = new SVGGeoViewer('viewer', {
  showLayerControl: false,
  showHoverInfo: false,
  enableModal: false,
  enableContextMenu: false
});
```

#### Configuration complète

```javascript
const viewer = new SVGGeoViewer('viewer', {
  showLayerControl: true,
  showHoverInfo: true,
  enableModal: true,
  enableZoom: true,
  enablePan: true,
  enableContextMenu: true,
  locale: 'fr',
  contextMenuItems: [
    {
      label: 'Exporter en JSON',
      icon: '💾',
      callback: (viewer) => {
        const data = viewer.getGlobalData();
        console.log(data);
      }
    },
    {
      label: 'Imprimer',
      icon: '🖨️',
      callback: () => window.print()
    }
  ],
  displayFields: ['name', 'area', 'status'], // N'afficher que ces champs
  excludeFields: ['_internalId', 'temp'],     // Exclure ces champs
  customCSS: `
    body { background: #f0f0f0; }
    .svg-geo-modal { border-radius: 12px; }
  `
});
```

---

## 📖 API Publique

### Chargement de SVG

#### `loadSVG(url)`
Charge un fichier SVG depuis une URL.

```javascript
await viewer.loadSVG('plan.svg');
```

**Paramètres** :
- `url` (string) : URL du fichier SVG

**Retour** : Promise

---

#### `loadSVGFromString(svgString)`
Charge un SVG depuis une chaîne de caractères.

```javascript
const svg = '<?xml version="1.0"?>...';
await viewer.loadSVGFromString(svg);
```

**Paramètres** :
- `svgString` (string) : Contenu SVG complet

**Retour** : Promise

---

### Zoom et navigation

#### `setZoom(zoom)`
Définit le niveau de zoom.

```javascript
viewer.setZoom(1.5);  // Zoom 150%
viewer.setZoom(0.5);  // Zoom 50%
```

**Paramètres** :
- `zoom` (number) : Facteur de zoom (1 = 100%)

---

#### `resetView()`
Réinitialise la vue (zoom 100%, position centrée).

```javascript
viewer.resetView();
```

---

### Plein écran

#### `enterFullscreen()`
Active le mode plein écran.

```javascript
viewer.enterFullscreen();
```

---

#### `exitFullscreen()`
Désactive le mode plein écran.

```javascript
viewer.exitFullscreen();
```

---

#### `toggleFullscreen()`
Bascule entre mode plein écran et mode normal.

```javascript
viewer.toggleFullscreen();
```

---

### Gestion des couches

#### `toggleLayer(layerId, visible)`
Affiche ou masque une couche.

```javascript
viewer.toggleLayer('buildings', true);   // Afficher
viewer.toggleLayer('buildings', false);  // Masquer
viewer.toggleLayer('buildings');         // Basculer (toggle)
```

**Paramètres** :
- `layerId` (string) : Identifiant de la couche
- `visible` (boolean, optionnel) : `true` pour afficher, `false` pour masquer, `undefined` pour basculer

---

#### `setLayerOpacity(layerId, opacity)`
Définit l'opacité d'une couche.

```javascript
viewer.setLayerOpacity('parcels', 0.5);  // 50% opaque
viewer.setLayerOpacity('buildings', 1);   // 100% opaque
```

**Paramètres** :
- `layerId` (string) : Identifiant de la couche
- `opacity` (number) : Valeur entre 0 (transparent) et 1 (opaque)

---

### Récupération de données

#### `getDocumentMetadata()`
Récupère les métadonnées du document SVG_GEO.

```javascript
const metadata = viewer.getDocumentMetadata();
console.log(metadata.document.projectName);
```

**Retour** : Object contenant les métadonnées du document (SVG_GEO_DOCUMENT)

---

#### `getGlobalData()`
Récupère toutes les données globales (métadonnées SVG_GEO_DATA).

```javascript
const data = viewer.getGlobalData();
console.log(data.B001);  // Données du bâtiment B001
console.log(data.layers); // Définition des couches
```

**Retour** : Object contenant toutes les données SVG_GEO_DATA

---

#### `getElementsByClass(className)`
Récupère tous les éléments d'une classe donnée.

```javascript
const buildings = viewer.getElementsByClass('Building');
buildings.forEach(el => {
  console.log(el.dataset.ref, el.dataset.props);
});
```

**Paramètres** :
- `className` (string) : Nom de la classe SVG_GEO (ex: 'Building', 'Window')

**Retour** : Array d'éléments DOM

---

### Export

#### `downloadSVG()`
Télécharge le SVG actuel (avec les couches visibles/masquées).

```javascript
viewer.downloadSVG();
```

**Note** : Utilise le CSS personnalisé si défini dans les options (`customCSS`).

---

#### `copyToClipboard()`
Copie le SVG dans le presse-papier.

```javascript
await viewer.copyToClipboard();
```

**Retour** : Promise

---

### Traduction et localisation

#### `setLocale(locale)`
Change la langue de l'interface.

```javascript
viewer.setLocale('en');  // Anglais
viewer.setLocale('fr');  // Français
```

**Paramètres** :
- `locale` (string) : Code de langue ('fr' ou 'en')

---

#### `setTranslations(translations)`
Définit des traductions personnalisées.

```javascript
viewer.setTranslations({
  'Building': 'Édifice',
  'Window': 'Fenêtre',
  'Door': 'Porte',
  'Copy Data': 'Copier les données'
});
```

**Paramètres** :
- `translations` (object) : Dictionnaire de traductions (clé : valeur traduite)

---

#### `t(key)`
Traduit une clé (méthode interne exposée).

```javascript
console.log(viewer.t('Layers'));  // "Couches" (si locale = 'fr')
```

---

### Événements

#### `on(eventName, callback)`
Écoute un événement du viewer.

```javascript
viewer.on('loaded', (data) => {
  console.log('SVG chargé:', data.metadata);
});

viewer.on('zoom', (data) => {
  console.log('Nouveau zoom:', data.zoom);
});

viewer.on('click', (data) => {
  console.log('Élément cliqué:', data.element);
});
```

**Événements disponibles** :
- `loaded` : SVG chargé (data: `{ metadata, globalData }`)
- `zoom` : Zoom modifié (data: `{ zoom }`)
- `pan` : Vue déplacée (data: `{ x, y }`)
- `fullscreen` : Mode plein écran changé (data: `{ fullscreen }`)
- `click` : Élément cliqué (data: `{ element, data }`)
- `hover` : Survol d'élément (data: `{ element, data }`)
- `contextMenuItem` : Item du menu contextuel personnalisé cliqué (data: `{ item, viewer }`)
- `reset` : Vue réinitialisée

**Paramètres** :
- `eventName` (string) : Nom de l'événement
- `callback` (function) : Fonction de rappel

---

#### `off(eventName, callback)`
Retire un écouteur d'événement.

```javascript
const handler = (data) => console.log(data);
viewer.on('zoom', handler);
viewer.off('zoom', handler);
```

---

#### `emit(eventName, data)`
Émet un événement personnalisé (usage interne principalement).

```javascript
viewer.emit('customEvent', { message: 'Hello' });
```

---

### Destruction

#### `destroy()`
Détruit le viewer et libère les ressources.

```javascript
viewer.destroy();
```

**Note** : Retire tous les écouteurs d'événements, vide le conteneur, supprime l'instance de `window.svgGeoViewerInstances`.

---

## 🎨 Format SVG_GEO

### Structure minimale

```xml
<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     version="1.1"
     viewBox="0 0 800 600"
     data-svg-geo-version="0.2">

  <!-- Métadonnées du document -->
  <metadata id="SVG_GEO_DOCUMENT">
  {
    "document": {
      "schemaVersion": "0.2",
      "vocabularyVersion": "0.1",
      "created": "2025-11-27",
      "lastModified": "2025-11-27",
      "author": "Votre nom",
      "lang": "fr",
      "defaultUnit": "m",
      "coordinateReferenceSystem": "EPSG:2154"
    },
    "project": {
      "projectName": "Mon projet",
      "projectId": "PRJ-001",
      "source": "AutoCAD",
      "domain": "Architecture"
    }
  }
  </metadata>

  <!-- Métadonnées des données et couches -->
  <metadata id="SVG_GEO_DATA">
  {
    "B001": {
      "class": "Building",
      "attributes": {
        "name": "Bâtiment principal",
        "area": "450m2"
      }
    },
    "layers": {
      "buildings": {
        "label": { "fr": "Bâtiments", "en": "Buildings" },
        "defaultVisible": true,
        "defaultOpacity": 1.0,
        "order": 10
      }
    }
  }
  </metadata>

  <!-- Éléments SVG avec attributs SVG_GEO -->
  <rect x="100" y="100" width="200" height="150"
        fill="#cccccc"
        data-class="Building"
        data-ref="B001"
        data-layer="buildings"
        data-props='{"name":"Bâtiment principal","area":"450m2"}' />
</svg>
```

### Attributs SVG_GEO

- `data-class` : Classe de l'objet (ex: Building, Window, Door)
- `data-ref` : Référence unique de l'objet
- `data-layer` : Couche à laquelle appartient l'élément
- `data-level` : Niveau de détail (ex: LOD1, LOD2, LOD3)
- `data-props` : Propriétés JSON de l'objet

### Couches (layers)

Les couches permettent de gérer la visibilité et l'opacité de groupes d'éléments.

```json
"layers": {
  "background": {
    "label": { "fr": "Fond de plan", "en": "Background" },
    "defaultVisible": true,
    "defaultOpacity": 1.0,
    "order": 0
  },
  "buildings": {
    "label": { "fr": "Bâtiments", "en": "Buildings" },
    "defaultVisible": true,
    "defaultOpacity": 1.0,
    "order": 10
  },
  "networks": {
    "label": { "fr": "Réseaux", "en": "Networks" },
    "defaultVisible": false,
    "defaultOpacity": 0.7,
    "order": 20
  }
}
```

---

## 🎯 Exemples d'utilisation

### Exemple 1 : Visualisation simple

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Visualisation simple</title>
  <style>
    #viewer { width: 100%; height: 600px; }
  </style>
</head>
<body>
  <div id="viewer"></div>
  
  <script src="svg-geo-viewer.js"></script>
  <script>
    const viewer = new SVGGeoViewer('viewer');
    viewer.loadSVG('plan.svg');
  </script>
</body>
</html>
```

---

### Exemple 2 : Application interactive

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Application interactive</title>
  <style>
    body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
    #controls { margin-bottom: 20px; }
    button { margin-right: 10px; padding: 8px 16px; }
    #viewer { width: 100%; height: 600px; border: 2px solid #ddd; }
    #info { margin-top: 20px; padding: 16px; background: #f5f5f5; }
  </style>
</head>
<body>
  <div id="controls">
    <button onclick="viewer.setZoom(1.5)">Zoom 150%</button>
    <button onclick="viewer.setZoom(1)">Zoom 100%</button>
    <button onclick="viewer.resetView()">Reset</button>
    <button onclick="viewer.toggleFullscreen()">Plein écran</button>
    <button onclick="viewer.toggleLayer('buildings')">Toggle Buildings</button>
    <button onclick="exportData()">Export JSON</button>
  </div>

  <div id="viewer"></div>
  
  <div id="info">
    <strong>Info :</strong> <span id="info-text">Chargez un SVG pour commencer</span>
  </div>

  <script src="svg-geo-viewer.js"></script>
  <script>
    const viewer = new SVGGeoViewer('viewer', {
      showLayerControl: true,
      showHoverInfo: true,
      enableModal: true,
      enableZoom: true,
      enablePan: true,
      enableContextMenu: true
    });

    // Écouter les événements
    viewer.on('loaded', (data) => {
      document.getElementById('info-text').textContent = 
        `SVG chargé : ${data.metadata.document.projectName}`;
    });

    viewer.on('zoom', (data) => {
      document.getElementById('info-text').textContent = 
        `Zoom : ${Math.round(data.zoom * 100)}%`;
    });

    viewer.on('click', (data) => {
      console.log('Élément cliqué:', data);
    });

    // Charger le SVG
    viewer.loadSVG('plan.svg');

    // Export des données
    function exportData() {
      const data = {
        metadata: viewer.getDocumentMetadata(),
        globalData: viewer.getGlobalData(),
        buildings: viewer.getElementsByClass('Building').map(el => ({
          ref: el.dataset.ref,
          props: JSON.parse(el.dataset.props || '{}')
        }))
      };
      
      console.log('Export:', data);
      alert('Données exportées dans la console (F12)');
    }
  </script>
</body>
</html>
```

---

### Exemple 3 : Filtrage des champs affichés

```javascript
const viewer = new SVGGeoViewer('viewer', {
  // N'afficher que certains champs
  displayFields: ['name', 'area', 'status', 'yearOfConstruction'],
  
  // OU exclure certains champs
  excludeFields: ['_internalId', 'tempData', 'debug']
});

await viewer.loadSVG('plan.svg');
```

---

### Exemple 4 : Export HTML personnalisé

```javascript
const viewer = new SVGGeoViewer('viewer', {
  customCSS: `
    body {
      background: linear-gradient(to bottom, #f0f0f0, #e0e0e0);
      font-family: 'Arial', sans-serif;
    }
    .svg-geo-modal {
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
    }
    .svg-geo-modal-header {
      background: linear-gradient(to right, #007bff, #0056b3);
      color: white;
    }
  `
});

// L'export HTML utilisera ce CSS personnalisé
viewer.downloadSVG();
```

---

### Exemple 5 : Menu contextuel personnalisé

```javascript
const viewer = new SVGGeoViewer('viewer', {
  contextMenuItems: [
    {
      label: 'Exporter en JSON',
      icon: '💾',
      callback: (viewer) => {
        const data = viewer.getGlobalData();
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'export.json';
        a.click();
        URL.revokeObjectURL(url);
      }
    },
    {
      label: 'Imprimer',
      icon: '🖨️',
      callback: () => window.print()
    },
    {
      label: 'Partager',
      icon: '📤',
      callback: (viewer) => {
        if (navigator.share) {
          navigator.share({
            title: 'Mon plan SVG',
            text: 'Découvrez ce plan interactif',
            url: window.location.href
          });
        } else {
          alert('Fonction de partage non disponible');
        }
      }
    }
  ]
});
```

---

## 🐛 Dépannage

### Le viewer ne s'affiche pas

**Vérifications** :
1. Le conteneur a-t-il une hauteur définie ? (`height: 600px` par exemple)
2. Le fichier `svg-geo-viewer.js` est-il bien chargé ?
3. Y a-t-il des erreurs dans la console JavaScript (F12) ?

```html
<!-- ✅ BON -->
<div id="viewer" style="width: 100%; height: 600px;"></div>

<!-- ❌ MAUVAIS : Pas de hauteur définie -->
<div id="viewer"></div>
```

---

### Les couches ne se masquent/affichent pas

**Cause** : Bug corrigé en v1.3.6. Vérifiez que vous utilisez la dernière version.

**Vérification** :
```javascript
console.log(window.svgGeoViewerInstances);
// Doit afficher : Map(1) { 'viewer' => SVGGeoViewer {...} }
```

---

### Le SVG n'est pas centré au chargement

**Cause** : Le conteneur n'avait pas encore de dimensions au moment du calcul.

**Solution** : Corrigé en v1.3.6 avec `requestAnimationFrame()` double pour garantir que le rendu est complet. Si le problème persiste, vérifiez que votre conteneur a bien une hauteur définie en CSS.

```css
/* ✅ BON : Hauteur définie */
#viewer {
  width: 100%;
  height: 600px;
}

/* ❌ MAUVAIS : Pas de hauteur définie */
#viewer {
  width: 100%;
}
```

---

### La modal s'ouvre après un déplacement

**Cause** : Détection de mouvement trop sensible ou timeout trop court.

**Solution 1** : Augmenter le seuil de détection (ligne 1108) :
```javascript
// De
if (deltaX > 3 || deltaY > 3) {

// À
if (deltaX > 5 || deltaY > 5) {
```

**Solution 2** : Augmenter le timeout (ligne 1132) :
```javascript
// De
setTimeout(() => { this.hasPanned = false; }, 300);

// À
setTimeout(() => { this.hasPanned = false; }, 500);
```

---

### Les attributs `data-props` ne s'affichent pas

**Vérifications** :
1. Le JSON dans `data-props` est-il valide ?
2. Les guillemets sont-ils échappés correctement ?

```xml
<!-- ✅ BON : JSON valide -->
<rect data-props='{"name":"Test","area":"100m2"}' />

<!-- ❌ MAUVAIS : Guillemets non échappés -->
<rect data-props="{"name":"Test","area":"100m2"}" />
```

---

## 📊 Performances

### Recommandations

- **Fichiers SVG** : Limitez la taille à moins de 5 Mo pour de meilleures performances
- **Nombre d'éléments** : Jusqu'à 10 000 éléments SVG testés avec succès
- **Couches** : Limitez à 20 couches maximum
- **Métadonnées** : Évitez les propriétés JSON trop volumineuses dans `data-props`

### Optimisations

```javascript
// Désactiver les fonctionnalités non utilisées
const viewer = new SVGGeoViewer('viewer', {
  showLayerControl: false,  // Si pas de couches
  showHoverInfo: false,     // Si pas besoin d'infos au survol
  enableModal: false,       // Si pas besoin de modal
  enableContextMenu: false  // Si pas besoin de menu contextuel
});
```

---

## 🔧 Compatibilité

### Navigateurs supportés

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Edge 90+
- ✅ Safari 14+
- ✅ Opera 76+

### APIs utilisées

- **DOM** : `querySelector`, `addEventListener`, `classList`
- **SVG DOM** : Manipulation native des éléments SVG
- **Fullscreen API** : `requestFullscreen()`, `exitFullscreen()`
- **Clipboard API** : `navigator.clipboard.writeText()`
- **Fetch API** : Chargement des fichiers SVG

---

## 📝 Changelog

### v1.3.6 (2025-11-27)
- ✅ **FIX CRITIQUE** : Enregistrement de l'instance dans `window.svgGeoViewerInstances` (corrige 5 bugs)
- ✅ Checkboxes des couches fonctionnent correctement
- ✅ Mode plein écran fonctionne correctement
- ✅ Reset View fonctionne correctement
- ✅ **FIX** : Cadrage initial amélioré avec `requestAnimationFrame()` double au lieu de `setTimeout()`
- ✅ **FIX** : Vérification des dimensions du conteneur avant `_fitToView()` (retry automatique si dimensions = 0)

### v1.3.5 (2025-11-26)
- ✅ Amélioration de la logique `hasPanned` (détection de mouvement)
- ✅ API native Fullscreen pour meilleure compatibilité
- ✅ `resetView()` appelle `_fitToView()` correctement

### v1.3.4 (2025-11-25)
- ✅ Option `customCSS` pour exports HTML personnalisés
- ✅ Options `displayFields` et `excludeFields` pour filtrer les champs affichés
- ✅ Conformité RFC SVG_GEO v0.1 vérifiée

---

## 🤝 Contribution

Pour contribuer au projet :

1. Forkez le dépôt
2. Créez une branche (`git checkout -b feature/ma-feature`)
3. Committez vos modifications (`git commit -am 'Ajout de ma feature'`)
4. Pushez vers la branche (`git push origin feature/ma-feature`)
5. Créez une Pull Request

---

## 📄 Licence

À définir selon votre projet.

---

## 📞 Support

Pour toute question ou problème :

1. Consultez la documentation : `svg-geo-viewer-README.md`
2. Consultez le changelog : `CHANGELOG_v1.3.6_ROOT_CAUSE_FIX.md`
3. Testez avec les fichiers fournis :
   - `svg-geo-viewer-demo.html` (démo complète)
   - `svg-geo-viewer-test-instance-registration.html` (tests unitaires)

---

## 🎓 Ressources

- **RFC SVG_GEO** : `rfc_geo_svg.md` (spécification complète)
- **Guide de tests** : `TESTS_REGRESSION_v1.3.6.md`
- **Résumé v1.3.6** : `SUMMARY_v1.3.6.md`
- **Fichier de démo** : `svg-geo-viewer-demo.html`

---

**Dernière mise à jour** : 27 novembre 2025  
**Version de la documentation** : 1.0  
**Version du viewer** : 1.3.6
