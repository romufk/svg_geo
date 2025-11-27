# SVG_GEO — Convention d’annotation sémantique des SVG géographiques et bâtimentaires
Convention d’annotation sémantique des SVG géographiques et bâtimentaires

**Version** : 0.1 (draft)  
**Date** : 2025-11-27  
**Auteur** : Franck Lamendin
**Langue** : Français  

---

## 1. Objet du document

Le présent document définit la convention **SVG_GEO** pour enrichir des fichiers **SVG** avec des données :

- géographiques (parcelles, zones, emprises),
- bâtimentaires (bâtiments, façades, murs, ouvertures),
- patrimoniales (état, matériaux, protection, historique),

en s’inspirant des modèles **CityGML / CityJSON / IFC**, tout en restant :

- compatible avec les **navigateurs web**,
- compatible avec **React** & autres frameworks front,
- compatible avec des **éditeurs SVG libres** (notamment Inkscape),
- simple à lire et modifier “à la main”.

Ce format est un **format léger de médiation**, ce n’est **pas** un substitut à IFC ou CityGML, mais un pont entre géométrie SVG et données métiers.

---

## 2. Contexte et positionnement

SVG_GEO se veut :

- un **“vue 2D intelligente”** d’objets issus de sources BIM, SIG ou CityGML ;
- un format de travail pour :
  - plans interactifs web,
  - maquettes patrimoniales légères,
  - visualisations simplifiées issues de BIM ou CityGML.

Il repose sur trois piliers :

1. **SVG standard** pour la géométrie (paths, polygons, groups, etc.)
2. **Attributs `data-*`** pour les métadonnées par élément
3. **Bloc JSON global dans `<metadata>`** pour les données partagées ou complexes

---

## 3. Principes généraux

### 3.1. Données locales : attributs `data-*`

Les données métiers associées à un élément graphique (bâtiment, mur, fenêtre, parcelle…) sont stockées dans des attributs **`data-*`** directement sur l’élément SVG :

<svg xmlns="http://www.w3.org/2000/svg" data-svg-geo-version="0.1">
<g id="building_01"
   data-class="Building"
   data-ref="B001"
   data-level="LOD2"
   data-props='{"yearBuilt":1850,"heritageStatus":"Protected"}'>
  ...
</g>
</svg>

Ces attributs :
- sont standards (HTML5 / SVG2),
- sont conservés par les éditeurs SVG (dont Inkscape),
- sont accessibles en JavaScript via element.dataset.

### Données globales : <metadata> + JSON

Un bloc optionnel <metadata> permet de stocker des informations :
- partagées par plusieurs éléments, 
- plus volumineuses,
- versionnées ou hiérarchiques.

<metadata id="SVG_GEO_DATA">
{
  "B001": {
    "class": "Building",
    "attributes": {
      "name": "Ancienne Mairie",
      "yearOfConstruction": 1850,
      "heritageStatus": "Protected"
    }
  }
}
</metadata>

Les éléments SVG peuvent référencer ces entrées via data-ref="B001".

# Schéma de données SVG_GEO
## Attributs principaux

Les attributs suivants sont recommandés :

| Attribut     | Description                                   | Exemple                   | Alignement              |
| ------------ | --------------------------------------------- | ------------------------- | ----------------------- |
| `data-ref`   | Identifiant unique métier                     | `B001`, `FR-LNS-CH-M01`   | CityJSON `id`, IFC GUID |
| `data-class` | Classe sémantique de l’objet                  | `Building`, `WallSurface` | CityGML / CityJSON      |
| `data-level` | Niveau de détail (LOD)                        | `LOD0`, `LOD1`, `LOD2`    | CityGML LoD             |
| `data-layer` | Couche logique (parcelle, bâti, réseau, etc.) | `parcel`, `building`      | SIG, map styling        |
| `data-props` | Propriétés détaillées au format JSON          | `{"height":"3.5m"}`       | CityJSON `attributes`   |


### data-ref

Doit être unique dans le document (ou au minimum par type).

Peut refléter :
- un identifiant CityJSON / CityGML,
- un identifiant IFC (IfcGloballyUniqueId),
- un identifiant interne de base de données.

### data-class

Valeurs recommandées (extrait des classes CityGML / CityJSON) :

Bâtiment / parties :
- Building
- BuildingPart

Surfaces :
- WallSurface
- RoofSurface
- GroundSurface

InteriorWallSurface
- ClosureSurface

Ouvertures :
- Door
- Window

Autres :
- BuildingInstallation
- Bridge
- Tunnel

LandUse
- TransportationObject

### data-level

Suit la notion de LoD de CityGML :
- LOD0 : emprise au sol (2D)
- LOD1 : bloc volumique simplifié
- LOD2 : toiture / volumes détaillés
- LOD3 : détails architecturaux fins (façades, ouvertures)
- LOD4 : intérieur (espaces, pièces)

Même si le SVG reste 2D, data-level permet de refléter l’origine sémantique.

## Propriétés détaillées : data-props

data-props contient un objet JSON :
- JSON strict (guillemets doubles, pas de commentaires),
- minifié (une seule ligne) pour éviter les problèmes d'édition,
- libre sur le contenu, mais des clés recommandées assurent l'interop.
- Exemples de clés recommandées :

| Clé              | Type   | Signification                                      | Alignement                      |
| ---------------- | ------ | -------------------------------------------------- | ------------------------------- |
| `material`       | string | Matériau principal (en anglais)                    | IFC `IfcMaterial.Name`, Unidata |
| `yearBuilt`      | number | Année de construction                              | CityGML `yearOfConstruction`    |
| `yearRestored`   | number | Dernière année de restauration                     | Patrimoine / CIDOC-CRM          |
| `condition`      | string | État de conservation (`Good`, `Moderate`, `Poor`…) | Patrimoine                      |
| `conditionDate`  | string | Date de relevé de l’état (ISO : `YYYY-MM-DD`)      | Alignable CIDOC-CRM             |
| `height`         | string | Hauteur avec unité, ex : `"3.5m"`                  | CityJSON / IFC                  |
| `thickness`      | string | Épaisseur, ex : `"45cm"`                           | IFC                             |
| `ifcType`        | string | Type IFC, ex : `"IfcWall"`, `"IfcWindow"`          | IFC                             |
| `heritageStatus` | string | Protection (`Protected`, `Listed`, `None`, …)      | Patrimoine                      |
| `source`         | string | Source des données (`Survey2024`, `CAD`, etc.)     | Documentation                   |


Exemple d’utilisation :

<path
  id="wall_north"
  d="M 10 10 L 200 10 L 200 80 L 10 80 Z"
  data-class="WallSurface"
  data-ref="B001-W01"
  data-props='{
    "material":"Stone",
    "height":"3.4m",
    "thickness":"45cm",
    "ifcType":"IfcWall",
    "condition":"Good"
  }'
/>

Remarque : dans la pratique, il est souvent plus simple de minifier le JSON :

data-props='{"material":"Stone","height":"3.4m","thickness":"45cm","ifcType":"IfcWall","condition":"Good"}'


# Données globales <metadata>

La section <metadata> peut contenir du JSON décrivant un dictionnaire de données globales.

## Structure recommandée

Les éléments graphiques référencent ces blocs via data-ref :
- La logique applicative (JavaScript, backend) peut alors :
- lire <metadata> → JSON.parse(...),
- retrouver les infos {SVG_GEO_DATA}[data-ref],
- fusionner ces infos avec data-props “local”.

## Ordre de fusion des informations
Les informations locales remplacent les informations globales de même code.

# Hiérarchie et structuration graphique
## Groupes (<g>)

Les groupes <g> peuvent représenter :
- un objet sémantique complet (un bâtiment, une parcelle, un tronçon),
- un conteneur de surfaces et d’éléments détaillés.

Exemple :

<g id="building_01" data-class="Building" data-ref="B001" data-level="LOD2">
  <path id="wall_north" data-class="WallSurface" ... />
  <path id="wall_south" data-class="WallSurface" ... />
  <rect id="window_01" data-class="Window" ... />
</g>


## Surfaces et éléments
- Les composants (murs, toitures, ouvertures) utilisent data-class spécifique :

<path id="roof_01"
      data-class="RoofSurface"
      data-ref="B001-R01"
      ... />


# Compatibilité et alignement avec les standards
## CityGML / CityJSON

data-class ↔ type / geometryType (CityJSON)
data-ref ↔ id
data-level ↔ LoD
data-props ↔ attributes

## IFC

data-props.ifcType ↔ IfcWall, IfcWindow, etc.
data-ref ↔ IfcGloballyUniqueId (ou identifiant dérivé)
material, thickness, height ↔ propriétés IFC PSet

## Unidata / matériaux

material peut référencer un code Uniclass / Unidata / classification interne.
Option : materialCode pour un identifiant normé.

## Patrimoine / CIDOC-CRM

condition, heritageStatus, yearRestored, source sont alignables avec un graphe RDF CIDOC-CRM, si un export ultérieur est nécessaire.

# Bonnes pratiques

Langue : utiliser l'anglais pour les valeurs techniques (material, condition, class) afin de faciliter les exports internationaux. Pour les contenus localisés (descriptions, noms), ajouter l'attribut **data-lang="fr"** (ou autre code ISO 639-1) sur l'élément concerné.

Édition : conserver les fichiers en “SVG Inkscape” ou vérifier que les optimisations n’éliminent pas les attributs data-*.

Dates : compatible ISO date format (YYYY-MM-DD, ISO-8601)

Versioning : indiquer la version de la convention :
<svg xmlns="http://www.w3.org/2000/svg" data-svg-geo-version="0.1">


Validation : un futur schéma JSON pourra valider la conformité des valeurs clés (à définir).

# Exemple complet SVG_GEO

<svg xmlns="http://www.w3.org/2000/svg"
     version="1.1"
     data-svg-geo-version="0.1">

  <metadata id="SVG_GEO_DATA">
  {
    "B001": {
      "class": "Building",
      "attributes": {
        "name": "Ancienne Mairie",
        "yearOfConstruction": 1850,
        "heritageStatus": "Protected",
        "address": "Rue des Écoles 15, 62300 Lens"
      }
    }
  }
  </metadata>

  <!-- Bâtiment complet -->
  <g id="building_01"
     data-class="Building"
     data-ref="B001"
     data-level="LOD2"
     data-props='{"source":"Survey2024"}'>

    <!-- Mur nord -->
    <path id="wall_north"
          d="M 10 10 L 200 10 L 200 80 L 10 80 Z"
          fill="#c0c0c0"
          data-class="WallSurface"
          data-ref="B001-W01"
          data-props='{"material":"Stone","height":"3.4m","thickness":"45cm","ifcType":"IfcWall","condition":"Good", "conditionDate":"2025-11-27"}' />

    <!-- Fenêtre -->
    <rect id="window_01"
          x="60" y="30" width="40" height="25"
          fill="#88c"
          data-class="Window"
          data-ref="B001-WIN01"
          data-props='{"frameMaterial":"Wood","glassType":"Single","ifcType":"IfcWindow"}' />

  </g>

</svg>

# Data types
## data-class — Typologie sémantique des objets

Cette liste reprend l’arborescence CityGML simplifiée.
Elle sert à catégoriser la nature de l’objet.

Format : Pas d’espace, CamelCase, vocabulaire anglais universel.

Catégories principales
Catégorie	      		Valeurs autorisées						Alignement
Bâtiment			Building, BuildingPart						CityGML.Feature, IFC
Surfaces extérieures		WallSurface, RoofSurface, GroundSurface, ClosureSurface		CityGML ThematicSurface
Surfaces intérieures		InteriorWallSurface, FloorSurface, CeilingSurface		CityGML.Int surfaces
Ouvertures			Window, Door, Opening						IFC: IfcDoor, IfcWindow
Installations techniques	BuildingInstallation, Pipe, Cable, VentilationUnit, HVAC, ElectricalPanel	IFC + CityGML Installations
Infrastructures et sols	LandUse, Transportation, Bridge, Tunnel, Road, Sidewalk, Parcel		CityGML LandUse & Transportation
Objet générique			Furniture, Equipment, Unknown, Other				fallback classification

Langue : anglais universel (pour interopérabilité internationale), sauf si spécifié autrement dans data-lang.

Règle : si un objet est une fenêtre → Window.
Si ambigu → Opening.
Si inconnu → Unknown (jamais inventer).

## condition — État sanitaire / conservation actuel
Inspiré du CIDOC-CRM, ISO 24116, BDU Patrimoine et du vocabulaire UNESCO.
Format : CamelCase, valeurs prédéfinies.

Valeur	Signification
Excellent	Aucun désordre visible, état proche neuf
Good	Bon état général, défauts mineurs
Moderate	Défauts visibles → besoin d’entretien
Poor	Dégradation avancée → intervention impérative
Ruined	Structure instable / vestige
Unknown	État non renseigné
NotApplicable	Non pertinent (ex. : annotation technique)

Option facultative future : 
- graduation 0-5 en complément.
- date d'état : "conditionDate": "2025-11-27"

Pour une gestion historique :
"conditionHistory": [
  { "value":"Good", "date":"2022-05-14" },
  { "value":"Moderate", "date":"2024-09-30" }
]

## heritageStatus — Classement patrimonial

Aligné avec les pratiques : France (MH/ISMH), UNESCO, Wikidata heritage grade, European Heritage Label.
Format : stable, neutralisé pour usage international.

Valeur	Signification / équivalent
None	Aucun statut patrimonial
LocalListed	Inscription locale / régionale
NationalListed	Monument historique / équivalent national
Protected	Niveau réglementaire supérieur (zone de protection, ZPPAUP, site classé, etc.)
WorldHeritage	Inscrit UNESCO
TentativeWorldHeritage	Liste indicative UNESCO
Archaeological	Zone archéologique reconnue
Unknown	Pas d’information

On garde volontairement des niveaux pivots internationaux au lieu de reproduire 53 systèmes nationaux.

# Format JSON officiel (copiable en fichier svg_geo_vocab.json)

{
  "version": "0.1",
  "vocabulary": {
    "data-class": [
      "Building", "BuildingPart",
      "WallSurface", "RoofSurface", "GroundSurface", "ClosureSurface",
      "InteriorWallSurface", "FloorSurface", "CeilingSurface",
      "Window", "Door", "Opening",
      "BuildingInstallation", "Pipe", "Cable", "VentilationUnit", "HVAC", "ElectricalPanel",
      "LandUse", "Transportation", "Bridge", "Tunnel", "Road", "Sidewalk", "Parcel",
      "Furniture", "Equipment", "Other", "Unknown"
    ],
    "condition": [
      "Excellent",
      "Good",
      "Moderate",
      "Poor",
      "Ruined",
      "Unknown",
      "NotApplicable"
    ],
    "conditionDate": {
      "type": "string",
      "format": "date",
      "description": "Date d'observation de l'état de conservation au format ISO-8601 (YYYY-MM-DD)."
   },
    "heritageStatus": [
      "None",
      "LocalListed",
      "NationalListed",
      "Protected",
      "WorldHeritage",
      "TentativeWorldHeritage",
      "Archaeological",
      "Unknown"
    ]
  }
}


# Règles d’usage

Si une valeur ne figure pas dans la liste → utiliser Unknown ou Other.
Aucune traduction locale dans l’attribut (mais un label multilingue peut exister dans metadata si besoin).
Version du vocabulaire associée via :
<svg data-svg-geo-vocab="0.1">

## History
chaque valeur peut avoir un historique
"valueNameHistory": [
  { "value":"Good", "date":"2022-05-14" },
  { "value":"Moderate", "date":"2024-09-30" }
]

## Internationalisation
possibilité de mettre des valeurs en multilingues
{
  "condition": "Moderate",
  "conditionDate": "2025-11-27",
  "conditionLabel": {
    "fr": "État moyen",
    "en": "Moderate",
    "nl": "Matig"
  }
}

## Déclaration globale du fichier SVG_GEO_DOCUMENT
Un fichier conforme peut contenir une section <metadata> dédiée à la déclaration des informations globales du projet.
Cette zone n’est pas liée à un élément graphique unique : elle décrit le contexte documentaire, les standards utilisés, et les paramètres d’interprétation (langue, unités, systèmes de coordonnées…).

La déclaration globale est stockée dans :

```xml
<metadata id="SVG_GEO_DOCUMENT">
{
  "document": { ... },
  "project": { ... },
  "standards": { ... }
}
</metadata>
```

document : Information pour lire le fichier
project : Information sur ce que représente le fichiher (batiment, ville...)
standards : correspondances avec des normes


### Exemple complet avec tous les blocs

```json
{
  "document": {
    "schemaVersion": "0.1",
    "vocabularyVersion": "0.1",
    "created": "2025-11-27",
    "lastModified": "2025-11-27",
    "author": "Bureau d'études XYZ",
    "generator": "Inkscape 1.3 + SVG_GEO Exporter",
    "lang": "fr",
    "defaultUnit": "m",
    "coordinateReferenceSystem": "EPSG:2154",
    "license": "CC-BY-4.0"
  },

  "project": {
    "projectName": "Ancienne Mairie de Lens - Réhabilitation",
    "projectId": "LNS-AM-2025-001",
    "projectCode": "LNS-AM",
    "source": "Survey2024",
    "domain": "Heritage",
    "authority": "Ville de Lens / DRAC Hauts-de-France",
    "startDate": "2024-01-15",
    "endDate": "2026-12-31",
    "status": "InProgress",
    "referenceUG" : "118218"
  },

  "standards": {
    "ifc": {
      "version": "IFC4",
      "schema": "IFC4X3_ADD2",
      "mvd": "Reference View"
    },
    "cityGML": {
      "version": "3.0",
      "modules": ["Building", "Bridge", "LandUse"]
    },
    "cityJSON": {
      "version": "2.0"
    },
    "vocabularies": ["Unidata", "Uniclass", "OmniClass"],
    "materialClassification": "Unidata",
    "heritageStandard": "CIDOC-CRM"
  }
}
```

### Tableau récapitulatif des propriétés

| Champ                       | Type               | Obligatoire          | Signification                                                  |
| --------------------------- | ------------------ | -------------------- | -------------------------------------------------------------- |
| `schemaVersion`             | string             | ✔                    | Version du standard SVG_GEO utilisé                            |
| `vocabularyVersion`         | string             | ✔                    | Version du fichier vocabulaire (`svg_geo_vocab.json`)          |
| `lang`                      | string (ISO-639-1) | ✔                    | Langue par défaut des labels                                   |
| `defaultUnit`               | string             | ✔                    | Unité métier par défaut (ex : `"m"` pour mètres)               |
| `coordinateReferenceSystem` | string (EPSG)      | ✔ si géolocalisation | Référentiel spatial : exemple `EPSG:2154` (RGF93 / Lambert-93) |
| `created`                   | ISO-date           | ✔                    | Date de création du fichier                                    |
| `lastModified`              | ISO-date           | optionnel            | Date de dernière modification                                  |
| `projectName`               | string             | ✔                    | Nom du projet                                                  |
| `projectId`                 | string             | optionnel            | Identifiant projet (SIG/BIM/administratif)                     |
| `source`                    | string             | optionnel            | Origine des données : Survey, Scan3D, IFC, DXF…                |
| `authority`                 | string             | optionnel            | Entité responsable ou garante du document                      |
| `referenceName`             | string             | optionnel            | Référence Interne. Name peut être modifié ex: referenceCadastre|

## Valeurs standardisées pour les champs globaux

### 1. Standards IFC (Industry Foundation Classes)

Le bloc `standards.ifc` indique que les propriétés `ifcType` dans `data-props` suivent le schéma IFC.

**Versions IFC supportées** :

| Version | Année | Description | Usage recommandé |
|---------|-------|-------------|------------------|
| `IFC2X3` | 2006 | Version la plus répandue | Projets existants, compatibilité maximale |
| `IFC4` | 2013 | Version actuelle stabilisée | Nouveaux projets, infrastructures |
| `IFC4X3` | 2024 | Version récente avec extensions | Projets avancés, routes, ponts |

**Schémas IFC** :

| Schéma | Description |
|--------|-------------|
| `IFC4X3_ADD2` | IFC 4.3 Addendum 2 (dernier schéma officiel) |
| `IFC4_ADD2` | IFC 4.0 Addendum 2 |
| `IFC2X3_TC1` | IFC 2x3 Technical Corrigendum 1 |

**Model View Definitions (MVD)** :

| MVD | Description | Usage |
|-----|-------------|-------|
| `Reference View` | Vue de référence (géométrie simple) | Visualisation, coordination |
| `Design Transfer View` | Vue de transfert conception | Édition, modifications |
| `Coordination View` | Vue de coordination | Coordination BIM, clash detection |

**Exemple complet** :

```json
"standards": {
  "ifc": {
    "version": "IFC4",
    "schema": "IFC4X3_ADD2",
    "mvd": "Reference View",
    "exportTool": "Revit 2024",
    "exportDate": "2025-11-27"
  }
}
```

### 2. Standards CityGML

Le bloc `standards.cityGML` indique l'alignement avec le modèle CityGML de l'OGC.

**Versions CityGML** :

| Version | Année | Description |
|---------|-------|-------------|
| `2.0` | 2012 | Version stable la plus utilisée |
| `3.0` | 2021 | Version modernisée avec nouveaux modules |

**Modules CityGML disponibles** :

| Module | Description | Classes principales |
|--------|-------------|---------------------|
| `Building` | Bâtiments et structures | Building, BuildingPart, WallSurface, RoofSurface |
| `Bridge` | Ponts et ouvrages d'art | Bridge, BridgePart, BridgeConstructionElement |
| `Tunnel` | Tunnels | Tunnel, TunnelPart, TunnelInstallation |
| `Transportation` | Réseaux de transport | Road, Railway, Track, TrafficArea |
| `LandUse` | Occupation du sol | LandUse |
| `WaterBody` | Masses d'eau | WaterBody, WaterSurface |
| `Vegetation` | Végétation | SolitaryVegetationObject, PlantCover |
| `CityFurniture` | Mobilier urbain | CityFurniture |
| `Relief` | Relief et terrain | TINRelief, MassPointRelief |

**Exemple** :

```json
"standards": {
  "cityGML": {
    "version": "3.0",
    "modules": ["Building", "Bridge", "LandUse", "Transportation"]
  }
}
```

### 3. Standards CityJSON

Le bloc `standards.cityJSON` indique l'utilisation du format CityJSON (version JSON de CityGML).

**Versions CityJSON** :

| Version | Année | Alignement CityGML | Description |
|---------|-------|-------------------|-------------|
| `1.0` | 2019 | CityGML 2.0 | Version stable |
| `1.1` | 2021 | CityGML 2.0 | Améliorations mineures |
| `2.0` | 2023 | CityGML 3.0 | Alignement avec CityGML 3.0 |

**Exemple** :

```json
"standards": {
  "cityJSON": {
    "version": "2.0",
    "extensions": ["Noise", "Energy"]
  }
}
```

### 4. Vocabulaires de matériaux

Le champ `standards.vocabularies` liste les systèmes de classification utilisés.

**Systèmes de classification supportés** :

| Vocabulaire | Région | Description | Exemple de code |
|-------------|--------|-------------|-----------------|
| `Unidata` | International | Système universel de données matériaux | `SS_25_10` (Pierre naturelle) |
| `Uniclass` | UK | Classification britannique NBS | `Pr_40_10_20` (Murs porteurs) |
| `OmniClass` | USA/Canada | Classification nord-américaine | `23-13 11 00` (Concrete) |
| `CoClass` | Scandinavie | Classification nordique | `AB.21` (Bâtiments) |
| `NL-SfB` | Pays-Bas | Classification néerlandaise | `21` (Murs extérieurs) |
| `Custom` | - | Vocabulaire personnalisé du projet | Défini par le projet |

**Exemple** :

```json
"standards": {
  "vocabularies": ["Unidata", "Uniclass"],
  "materialClassification": "Unidata"
}
```

### 5. Standards patrimoniaux

Le champ `standards.heritageStandard` indique le référentiel patrimonial utilisé.

**Standards supportés** :

| Standard | Description | Usage |
|----------|-------------|-------|
| `CIDOC-CRM` | Conceptual Reference Model (ICOM) | Standard international pour musées et patrimoine |
| `UNESCO` | Référentiel UNESCO | Patrimoine mondial |
| `Wikidata` | Wikidata heritage properties | Données ouvertes patrimoniales |
| `MH-FR` | Monuments Historiques (France) | Base Mérimée / Palissy |
| `EHL` | European Heritage Label | Label du patrimoine européen |
| `INSPIRE` | Infrastructure for Spatial Information in Europe | Directive européenne |

**Exemple** :

```json
"standards": {
  "heritageStandard": "CIDOC-CRM",
  "heritageDatabase": "Base Mérimée",
  "heritageRef": "PA00107738"
}
```

### 6. Système de coordonnées (EPSG)

Le champ `coordinateReferenceSystem` définit le système de référence spatial.

**EPSG recommandés par région** :

| Type de projet                          | Valeur EPSG                            | Description |
| --------------------------------------- | -------------------------------------- | ----------- |
| France métropole                        | `EPSG:2154`                            | Lambert-93 (RGF93) |
| Standard web (plan cadastral simplifié) | `EPSG:3857`                            | Web Mercator (Google Maps, OSM) |
| Global SIG / IoT / web mapping          | `EPSG:4326`                            | WGS84 (GPS standard) |
| Europe - UTM Zone 31N                   | `EPSG:32631`                           | UTM 31N (Europe occidentale) |
| Europe - UTM Zone 32N                   | `EPSG:32632`                           | UTM 32N (Europe centrale) |
| Belgique                                | `EPSG:31370`                           | Lambert Belge 1972 |
| Suisse                                  | `EPSG:2056`                            | CH1903+ / LV95 |
| Luxembourg                              | `EPSG:2169`                            | Luxembourg TM |
| Scan / précision bâtiment <1cm          | `EPSG:7801`, `EPSG:7405`               | GNSS local précis |

Le CRS peut être omis uniquement si le SVG est un plan non géoréférencé (dessin pur).

### 7. Unités de mesure

Le champ `defaultUnit` définit l'unité par défaut pour les mesures sans unité explicite.

**Unités de longueur** :

| Valeur | Description | Usage |
|--------|-------------|-------|
| `m` | Mètre | Standard international (SI) |
| `cm` | Centimètre | Plans d'architecture détaillés |
| `mm` | Millimètre | Détails techniques, menuiserie |
| `ft` | Pied (foot) | Pays anglo-saxons |
| `in` | Pouce (inch) | États-Unis |

**Unités de surface** :

| Valeur | Description |
|--------|-------------|
| `m2` | Mètre carré |
| `ft2` | Pied carré |
| `ha` | Hectare |

**Unités d'angle** :

| Valeur | Description |
|--------|-------------|
| `deg` | Degré (0-360) |
| `rad` | Radian |
| `grad` | Grade (0-400) |

### 8. Licences recommandées

Le champ `document.license` indique la licence d'utilisation du document.

**Licences Creative Commons** :

| Code | Description |
|------|-------------|
| `CC0` | Domaine public |
| `CC-BY-4.0` | Attribution |
| `CC-BY-SA-4.0` | Attribution - Partage dans les mêmes conditions |
| `CC-BY-NC-4.0` | Attribution - Pas d'utilisation commerciale |
| `CC-BY-ND-4.0` | Attribution - Pas de modification |

**Licences open source** :

| Code | Description |
|------|-------------|
| `MIT` | Licence MIT |
| `Apache-2.0` | Licence Apache 2.0 |
| `GPL-3.0` | GNU General Public License v3 |

**Autres** :

| Code | Description |
|------|-------------|
| `Proprietary` | Document propriétaire |
| `ODbL-1.0` | Open Database License (données) |

### 9. Statut de projet

Le champ `project.status` indique l'état d'avancement du projet.

**Valeurs recommandées** :

| Valeur | Description |
|--------|-------------|
| `Draft` | Brouillon, en cours de création |
| `InProgress` | En cours, travaux actifs |
| `Review` | En révision / validation |
| `Approved` | Validé, approuvé |
| `Completed` | Terminé, livré |
| `Archived` | Archivé, non actif |
| `Cancelled` | Annulé |

### Exemple minimal (projet simple)

```xml
<metadata id="SVG_GEO_DOCUMENT">
{
  "document": {
    "schemaVersion": "0.1",
    "created": "2025-11-27",
    "lang": "fr",
    "defaultUnit": "m"
  },
  "project": {
    "projectName": "Plan de masse - Résidence Belle Vue",
    "source": "CAD",
    "reference": "0001-0002-0003",
    "referenceUG": "118218"
  }
}
</metadata>
```

## Unités supportées (defaultUnit)
| Valeur | Signification              | Alignement                                             |
| ------ | -------------------------- | ------------------------------------------------------ |
| `"m"`  | mètres                     | IFC, ISO                                               |
| `"cm"` | centimètres                | CAO, relevés terrain                                   |
| `"mm"` | millimètres                | fabrication, relevés fins                              |
| `"px"` | unités SVG (non métriques) | Web uniquement (déconseillé dans un contexte bâtiment) |

## IFC – Valeurs possibles déclarables en standard (ifcType)

| Domaine                  | IFC                                                   |
| ------------------------ | ----------------------------------------------------- |
| Mur                      | `IfcWall`, `IfcWallStandardCase`                      |
| Ouverture                | `IfcWindow`, `IfcDoor`, `IfcOpeningElement`           |
| Sol / dalle              | `IfcSlab`                                             |
| Toiture                  | `IfcRoof`                                             |
| Structure                | `IfcBeam`, `IfcColumn`, `IfcFooting`                  |
| Réseaux                  | `IfcPipeSegment`, `IfcDuctSegment`, `IfcCableSegment` |
| Bâtiment / étage / pièce | `IfcBuilding`, `IfcBuildingStorey`, `IfcSpace`        |


## Exemple complet conforme
<metadata id="SVG_GEO_DOCUMENT">
{
  "document": {
    "schemaVersion": "0.1",
    "vocabularyVersion": "0.1",
    "created": "2025-11-27",
    "lastModified": "2025-11-27",
    "author": "Franck Lamendin",
    "lang": "fr",
    "defaultUnit": "m",
    "coordinateReferenceSystem": "EPSG:2154"
  },
  "project": {
    "projectName": "Ancienne Mairie de Lens",
    "projectId": "LNS-AM-2025",
    "source": "Survey2024",
    "domain": "Heritage Architecture",
    "authority": "Ville de Lens"
  }
}
</metadata>

# Couches (layers) — Gestion d’affichage côté frontal

Afin de permettre à un frontal (viewer web, application React, etc.) d’afficher ou masquer des groupes d’éléments, SVG_GEO introduit la notion de **couche logique**.

Une couche est :

- déclarée globalement dans la section `<metadata id="SVG_GEO_DOCUMENT">` ;
- référencée localement par les éléments via l’attribut `data-layer`.

L’objectif est de permettre :

- le filtrage fonctionnel (ex. : n’afficher que les bâtiments),
- le contrôle de la transparence (opacité par couche),
- un ordonnancement logique (ordre d’empilement suggéré).

###  Déclaration globale des couches

Les couches sont déclarées dans `SVG_GEO_DOCUMENT.layers` :

<metadata id="SVG_GEO_DATA">
{
  "layers": {
    "background": {
      "label": { "fr": "Fond de plan", "en": "Background" },
      "defaultVisible": true,
      "defaultOpacity": 1.0,
      "order": 0
    },
    "parcels": {
      "label": { "fr": "Parcelles", "en": "Parcels" },
      "defaultVisible": true,
      "defaultOpacity": 0.8,
      "order": 10
    },
    "buildings": {
      "label": { "fr": "Bâtiments", "en": "Buildings" },
      "defaultVisible": true,
      "defaultOpacity": 1.0,
      "order": 20
    },
    "networks": {
      "label": { "fr": "Réseaux", "en": "Networks" },
      "defaultVisible": false,
      "defaultOpacity": 1.0,
      "order": 30
    }
  }
}
</metadata>

### Champs d’une couche
Pour chaque entrée dans layers :
| Champ            | Type               | Obligatoire | Description                                  |
| ---------------- | ------------------ | ----------- | -------------------------------------------- |
| `label`          | objet `{lang:txt}` | ✔           | Libellé multilingue de la couche             |
| `defaultVisible` | bool               | ✔           | Visibilité par défaut (true = affiché)       |
| `defaultOpacity` | number (0.0–1.0)   | ✔           | Opacité par défaut (1.0 = opaque)            |
| `order`          | integer            | ✔           | Ordre logique de la couche (pour le frontal) |

Note : order ne modifie pas directement l’ordre SVG, mais donne un indice au frontal sur la façon de présenter les couches (liste, z-index, etc.).

### Attribution d’une couche aux éléments : data-layer
Chaque élément (ou groupe <g>) peut appartenir à une couche via l’attribut :

data-layer="buildings"

La valeur de data-layer doit correspondre à une clé déclarée dans SVG_GEO_DATA.layers.

Exemple d’usage sur un bâtiment complet
<g id="building_01"
   data-class="Building"
   data-ref="B001"
   data-level="LOD2"
   data-layer="buildings"
   data-props='{"source":"Survey2024"}'>

  <path id="wall_north"
        d="M 10 10 L 200 10 L 200 80 L 10 80 Z"
        fill="#c0c0c0"
        data-class="WallSurface"
        data-ref="B001-W01"
        data-layer="buildings"
        data-props='{
          "material":"Stone",
          "height":"3.4m",
          "thickness":"45cm",
          "ifcType":"IfcWall",
          "condition":"Good",
          "conditionDate":"2025-11-27"
        }' />

  <rect id="window_01"
        x="60" y="30" width="40" height="25"
        fill="#88c"
        data-class="Window"
        data-ref="B001-WIN01"
        data-layer="buildings"
        data-props='{
          "frameMaterial":"Wood",
          "glassType":"Single",
          "ifcType":"IfcWindow"
        }' />
</g>

### Recommandations de nommage des couches

Noms de couches recommandés (non obligatoires, mais utiles comme convention inter-projets) :

- background : fonds de plan, orthophotos stylisées, grilles
- parcels : parcelles cadastrales, limites foncières
- buildings : bâtiments, murs, façades
- interior : espaces et éléments intérieurs (LOD4)
- zone : zonnes nommées
- covering : Revetements
- networks : réseaux (eau, élec, données…)
- annotations : textes, symboles, indications
- temporary : couches de travail / surcharges
