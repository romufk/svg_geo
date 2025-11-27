/**
 * SVG_GEO Viewer Library
 * Version: 0.2.0
 * Date: 2025-11-27
 * 
 * Bibliothèque JavaScript pour charger, décoder et afficher des fichiers SVG_GEO
 * avec gestion des couches, interactions et modales.
 */

class SVGGeoViewer {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      throw new Error(`Container with id "${containerId}" not found`);
    }

    // Options par défaut
    this.options = {
      showHoverInfo: true,
      enableModal: true,
      modalClass: 'svg-geo-modal',
      hoverInfoClass: 'svg-geo-hover-info',
      locale: 'fr', // Langue par défaut
      translations: null, // Table de traduction personnalisée
      enableZoom: true, // Activer le zoom à la molette
      enablePan: true, // Activer le déplacement par clic gauche
      enableContextMenu: true, // Activer le menu contextuel
      contextMenuItems: [], // Items personnalisés pour le menu contextuel
      modalContainer: null, // Conteneur externe pour la modal (optionnel)
      modalPosition: 'center', // 'center' | 'bottom-right' | 'custom'
      fullscreenModal: 'bottom-right', // Position en mode plein écran
      customCSS: '', // CSS personnalisé pour les exports HTML
      displayFields: null, // Liste des champs à afficher (null = tous)
      excludeFields: [], // Liste des champs à exclure
      ...options
    };

    // État du viewer
    this.zoom = 1;
    this.panX = 0;
    this.panY = 0;
    this.isPanning = false;
    this.hasPanned = false; // Détecte si on a effectué un déplacement
    this.panStartX = 0;
    this.panStartY = 0;
    this.isFullscreen = false;

    // Système d'événements
    this.eventListeners = {};

    // Initialiser le système de traduction
    this._initTranslations();

    // État interne
    this.svgElement = null;
    this.documentMetadata = null;
    this.globalData = null;
    this.layers = {};
    this.currentHover = null;

    // Initialisation
    this._init();
    
    // Enregistrement de l'instance dans le registre global pour les callbacks onclick
    if (!window.svgGeoViewerInstances) {
      window.svgGeoViewerInstances = new Map();
    }
    window.svgGeoViewerInstances.set(this.container.id, this);
  }

  /**
   * Initialisation du système de traduction
   * @private
   */
  _initTranslations() {
    // Dictionnaires de traduction par défaut (en -> fr)
    this.defaultTranslations = {
      // UI Elements
      'Layers': 'Couches',
      'Hover over an element to see information': 'Survolez un élément pour voir ses informations',
      
      // Classes CityGML/IFC
      'Building': 'Bâtiment',
      'BuildingPart': 'Partie de bâtiment',
      'WallSurface': 'Surface de mur',
      'RoofSurface': 'Surface de toit',
      'GroundSurface': 'Surface au sol',
      'ClosureSurface': 'Surface de fermeture',
      'InteriorWallSurface': 'Mur intérieur',
      'FloorSurface': 'Surface de plancher',
      'CeilingSurface': 'Surface de plafond',
      'Window': 'Fenêtre',
      'Door': 'Porte',
      'Opening': 'Ouverture',
      'BuildingInstallation': 'Installation technique',
      'Pipe': 'Conduite',
      'Cable': 'Câble',
      'VentilationUnit': 'Unité de ventilation',
      'HVAC': 'CVC',
      'ElectricalPanel': 'Panneau électrique',
      'LandUse': 'Usage du sol',
      'Transportation': 'Transport',
      'Bridge': 'Pont',
      'Tunnel': 'Tunnel',
      'Road': 'Route',
      'Sidewalk': 'Trottoir',
      'Parcel': 'Parcelle',
      'Furniture': 'Mobilier',
      'Equipment': 'Équipement',
      'Other': 'Autre',
      'Unknown': 'Inconnu',
      
      // Properties
      'ID': 'ID',
      'Reference': 'Référence',
      'Ref': 'Réf',
      'Class': 'Classe',
      'Level': 'Niveau',
      'Layer': 'Couche',
      'Level of detail': 'Niveau de détail',
      'Material': 'Matériau',
      'Year Built': 'Année de construction',
      'Year Restored': 'Année de restauration',
      'Condition': 'État',
      'Condition Date': 'Date de relevé',
      'Height': 'Hauteur',
      'Thickness': 'Épaisseur',
      'Ifc Type': 'Type IFC',
      'Heritage Status': 'Statut patrimonial',
      'Source': 'Source',
      'Frame Material': 'Matériau du cadre',
      'Glass Type': 'Type de vitrage',
      'Door Type': 'Type de porte',
      'Year Installed': 'Année d\'installation',
      'Slope': 'Pente',
      'Cadastral Ref': 'Référence cadastrale',
      'Area': 'Surface',
      'Owner': 'Propriétaire',
      'Type': 'Type',
      'Voltage': 'Tension',
      
      // Conditions
      'Excellent': 'Excellent',
      'Good': 'Bon',
      'Moderate': 'Moyen',
      'Poor': 'Mauvais',
      'Ruined': 'Ruiné',
      'NotApplicable': 'Non applicable',
      
      // Heritage Status
      'None': 'Aucun',
      'LocalListed': 'Inscription locale',
      'NationalListed': 'Monument historique',
      'Protected': 'Protégé',
      'WorldHeritage': 'Patrimoine mondial',
      'TentativeWorldHeritage': 'Liste indicative UNESCO',
      'Archaeological': 'Zone archéologique',
      
      // Materials
      'Stone': 'Pierre',
      'Brick': 'Brique',
      'Concrete': 'Béton',
      'Wood': 'Bois',
      'Steel': 'Acier',
      'Glass': 'Verre',
      'Metal': 'Métal',
      'Tile': 'Tuile',
      'Oak': 'Chêne',
      'PVC': 'PVC',
      'Single': 'Simple',
      'Double': 'Double',
      'Triple': 'Triple',
      
      // Modal
      'Global data': 'Données globales',
      'Properties': 'Propriétés',
      'Element': 'Élément',
      
      // Menu contextuel
      'Reset View': 'Vue complète',
      'Fullscreen': 'Plein écran',
      'Exit Fullscreen': 'Quitter plein écran',
      'Save as SVG': 'Enregistrer en SVG',
      'Copy to Clipboard': 'Copier dans le presse-papier',
      'Copy as Image': 'Copier comme image',
      'Elements under cursor': 'Éléments sous le curseur',
      'SVG copied to clipboard!': 'SVG copié dans le presse-papier !',
      'Compatible with Word, PowerPoint, etc.': 'Compatible avec Word, PowerPoint, etc.',
      'Image copied to clipboard!': 'Image copiée dans le presse-papier !',
      'Optimized for Word/PowerPoint': 'Optimisé pour Word/PowerPoint',
      'Failed to copy to clipboard': 'Échec de la copie dans le presse-papier',
      'Failed to copy image': 'Échec de la copie de l\'image',
      'Copy Data': 'Copier les données',
      'Copy All Data': 'Copier toutes les données',
      'Data copied to clipboard!': 'Données copiées dans le presse-papier !',
      'Paste in Word with formatting': 'Collez dans Word avec mise en forme',
      'Failed to copy data': 'Échec de la copie des données',
      'Basic Information': 'Informations de base',
      'All Elements Data': 'Données de tous les éléments',
      'elements': 'éléments',
      'elements copied to clipboard!': 'éléments copiés dans le presse-papier !',
      'No data to copy': 'Aucune donnée à copier',
      'Drag': 'Glisser',
      'Pan anywhere': 'Déplacer partout'
    };

    // Utiliser les traductions personnalisées si fournies
    if (this.options.translations) {
      this.translations = { ...this.defaultTranslations, ...this.options.translations };
    } else {
      this.translations = this.defaultTranslations;
    }
  }

  /**
   * Traduit une clé selon la langue configurée
   * @param {string} key - Clé à traduire
   * @returns {string} - Traduction ou clé originale
   */
  t(key) {
    if (this.options.locale === 'en') {
      return key;
    }
    return this.translations[key] || key;
  }

  /**
   * Définit la langue de l'interface
   * @param {string} locale - Code de langue ('en', 'fr')
   */
  setLocale(locale) {
    this.options.locale = locale;
  }

  /**
   * Définit une table de traduction personnalisée
   * @param {Object} translations - Dictionnaire de traductions
   */
  setTranslations(translations) {
    this.translations = { ...this.defaultTranslations, ...translations };
  }

  /**
   * Initialisation du conteneur
   * @private
   */
  _init() {
    this.container.classList.add('svg-geo-viewer');
    
    // Créer la structure HTML
    this.container.innerHTML = `
      <div class="svg-geo-content">
        <div class="svg-geo-svg-container"></div>
        ${this.options.showHoverInfo ? '<div class="svg-geo-hover-info"></div>' : ''}
      </div>
      ${this.options.enableModal && !this.options.modalContainer ? '<div class="svg-geo-modal" style="display:none;"></div>' : ''}
      ${this.options.enableContextMenu ? '<div class="svg-geo-context-menu"></div>' : ''}
    `;

    this.svgContainer = this.container.querySelector('.svg-geo-svg-container');
    this.hoverInfo = this.container.querySelector('.svg-geo-hover-info');
    this.modal = this.options.modalContainer 
      ? document.querySelector(this.options.modalContainer) 
      : this.container.querySelector('.svg-geo-modal');
    this.contextMenu = this.container.querySelector('.svg-geo-context-menu');

    // Définir le placeholder traduit
    if (this.hoverInfo) {
      this.hoverInfo.setAttribute('data-placeholder', this.t('Hover over an element to see information'));
    }

    // Ajouter les styles par défaut
    this._injectStyles();

    // Initialiser les interactions
    this._initInteractions();
  }

  /**
   * Initialise les interactions (zoom, pan, menu contextuel)
   * @private
   */
  _initInteractions() {
    if (!this.svgContainer) return;

    // Zoom à la molette
    if (this.options.enableZoom) {
      this.svgContainer.addEventListener('wheel', (e) => this._onWheel(e), { passive: false });
    }

    // Pan (déplacement)
    if (this.options.enablePan) {
      this.svgContainer.classList.add('pannable');
      this.svgContainer.addEventListener('mousedown', (e) => this._onPanStart(e));
      document.addEventListener('mousemove', (e) => this._onPanMove(e));
      document.addEventListener('mouseup', (e) => this._onPanEnd(e));
    }

    // Menu contextuel
    if (this.options.enableContextMenu) {
      this.svgContainer.addEventListener('contextmenu', (e) => this._onContextMenu(e));
      document.addEventListener('click', () => this._hideContextMenu());
    }

    // Plein écran - Touche Échap
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isFullscreen) {
        this.exitFullscreen();
      }
    });
  }

  /**
   * Injection des styles CSS
   * @private
   */
  _injectStyles() {
    if (document.getElementById('svg-geo-styles')) return;

    const style = document.createElement('style');
    style.id = 'svg-geo-styles';
    style.textContent = `
      .svg-geo-viewer {
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      .svg-geo-content {
        flex: 1;
        position: relative;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }

      .svg-geo-svg-container {
        flex: 1;
        width: 100%;
        overflow: hidden;
        position: relative;
      }

      .svg-geo-svg-container svg {
        max-width: 100%;
        height: auto;
        display: block;
      }

      /* Hover Info */
      .svg-geo-hover-info {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(8px);
        border-top: 1px solid #e0e0e0;
        padding: 6px 12px;
        font-size: 0.8rem;
        color: #333;
        min-height: 32px;
        display: flex;
        align-items: center;
        box-shadow: 0 -2px 8px rgba(0,0,0,0.1);
        flex-shrink: 0;
      }

      .svg-geo-hover-info:empty::before {
        content: attr(data-placeholder);
        color: #999;
        font-style: italic;
      }

      /* Notification Toast */
      .svg-geo-notification {
        position: absolute;
        bottom: 50px;
        left: 50%;
        transform: translateX(-50%) translateY(100px);
        background: rgba(33, 150, 243, 0.95);
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 0.9rem;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        pointer-events: none;
        opacity: 0;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        max-width: 80%;
        text-align: center;
        backdrop-filter: blur(10px);
      }

      .svg-geo-notification.show {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }

      .svg-geo-notification.success {
        background: rgba(76, 175, 80, 0.95);
      }

      .svg-geo-notification.error {
        background: rgba(244, 67, 54, 0.95);
      }

      .svg-geo-notification.info {
        background: rgba(33, 150, 243, 0.95);
      }

      /* Modal */
      .svg-geo-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
      }

      .svg-geo-modal-content {
        background: white;
        border-radius: 6px;
        max-width: 600px;
        max-height: 70vh;
        width: 90%;
        overflow: hidden;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        display: flex;
        flex-direction: column;
      }

      .svg-geo-modal-header {
        padding: 10px 14px;
        border-bottom: 1px solid #e0e0e0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #f8f9fa;
      }

      .svg-geo-modal-title {
        font-size: 1rem;
        font-weight: 600;
        color: #333;
        margin: 0;
      }

      .svg-geo-modal-close {
        background: none;
        border: none;
        font-size: 1.25rem;
        cursor: pointer;
        color: #666;
        width: 26px;
        height: 26px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 3px;
        transition: all 0.2s;
      }

      .svg-geo-modal-close:hover {
        background: #e0e0e0;
        color: #333;
      }

      .svg-geo-modal-copy-btn {
        background: transparent;
        border: 1px solid #ddd;
        font-size: 1rem;
        cursor: pointer;
        color: #333;
        width: 32px;
        height: 26px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 3px;
        transition: all 0.2s;
      }

      .svg-geo-modal-copy-btn:hover {
        background: #f5f5f5;
        border-color: #999;
        transform: scale(1.05);
      }

      .svg-geo-modal-body {
        padding: 12px 14px;
        overflow-y: auto;
        flex: 1;
      }

      .svg-geo-property {
        margin-bottom: 8px;
        padding-bottom: 8px;
        border-bottom: 1px solid #f0f0f0;
      }

      .svg-geo-property:last-child {
        border-bottom: none;
        margin-bottom: 0;
        padding-bottom: 0;
      }

      .svg-geo-property-label {
        font-weight: 600;
        color: #666;
        font-size: 0.7rem;
        text-transform: uppercase;
        letter-spacing: 0.3px;
        margin-bottom: 2px;
      }

      .svg-geo-property-value {
        color: #333;
        font-size: 0.85rem;
      }

      .svg-geo-badge {
        display: inline-block;
        padding: 2px 6px;
        border-radius: 3px;
        font-size: 0.7rem;
        font-weight: 500;
      }

      .svg-geo-badge-excellent { background: #d4edda; color: #155724; }
      .svg-geo-badge-good { background: #d1ecf1; color: #0c5460; }
      .svg-geo-badge-moderate { background: #fff3cd; color: #856404; }
      .svg-geo-badge-poor { background: #f8d7da; color: #721c24; }
      .svg-geo-badge-ruined { background: #6c757d; color: white; }
      .svg-geo-badge-unknown { background: #e2e3e5; color: #383d41; }

      /* Élément SVG interactif */
      [data-class]:hover {
        filter: brightness(1.2);
        cursor: pointer;
      }

      [data-class] {
        transition: filter 0.2s;
      }

      /* Menu contextuel */
      .svg-geo-context-menu {
        position: fixed;
        background: white;
        border: 1px solid #ccc;
        border-radius: 4px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        min-width: 200px;
        max-width: 300px;
        max-height: 80vh;
        padding: 4px 0;
        display: none;
        overflow-y: auto;
        overflow-x: hidden;
      }

      .svg-geo-context-menu-item {
        padding: 6px 14px;
        cursor: pointer;
        font-size: 0.85rem;
        color: #333;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: background 0.1s;
        line-height: 1.3;
      }

      .svg-geo-context-menu-item:hover {
        background: #f0f0f0;
      }

      .svg-geo-context-menu-separator {
        height: 1px;
        background: #e0e0e0;
        margin: 3px 0;
      }

      .svg-geo-context-menu-submenu {
        padding: 3px 0;
        margin-left: 8px;
        border-left: 2px solid #e0e0e0;
      }

      .svg-geo-context-menu-checkbox {
        margin-right: 8px;
      }

      /* Mode plein écran */
      .svg-geo-viewer.fullscreen {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 9998;
        background: white;
        width: 100vw !important;
        height: 100vh !important;
      }

      .svg-geo-viewer.fullscreen .svg-geo-modal {
        z-index: 9999;
      }

      .svg-geo-viewer.fullscreen .svg-geo-modal.bottom-right .svg-geo-modal-content {
        position: fixed;
        bottom: 20px;
        right: 20px;
        top: auto;
        left: auto;
        margin: 0;
        max-width: 400px;
        max-height: 60vh;
      }

      /* Pan & Zoom */
      .svg-geo-svg-container.panning {
        cursor: grabbing !important;
      }

      .svg-geo-svg-container.pannable {
        cursor: grab;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Charge un fichier SVG_GEO
   * @param {string} url - URL du fichier SVG
   * @returns {Promise<void>}
   */
  async loadSVG(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to load SVG: ${response.status} ${response.statusText}`);
      }

      const svgText = await response.text();
      await this.loadSVGFromString(svgText);
    } catch (error) {
      console.error('Error loading SVG:', error);
      throw error;
    }
  }

  /**
   * Charge un SVG_GEO depuis une chaîne
   * @param {string} svgText - Contenu SVG
   * @returns {Promise<void>}
   */
  async loadSVGFromString(svgText) {
    // Parser le SVG
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgText, 'image/svg+xml');
    
    // Vérifier les erreurs de parsing
    const parserError = doc.querySelector('parsererror');
    if (parserError) {
      throw new Error('Invalid SVG format');
    }

    this.svgElement = doc.documentElement;

    // Vérifier la version SVG_GEO
    const version = this.svgElement.getAttribute('data-svg-geo-version');
    if (!version) {
      console.warn('SVG_GEO version not specified');
    }

    // Extraire les métadonnées
    this._extractMetadata();

    // Injecter le SVG dans le conteneur
    this.svgContainer.innerHTML = '';
    this.svgContainer.appendChild(this.svgElement);

    // Attacher les événements
    this._attachEvents();

    // Centrer et ajuster le SVG au chargement
    // Utiliser requestAnimationFrame pour s'assurer que le rendu est complet
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this._fitToView();
      });
    });

    // Émettre événement de chargement
    this.emit('loaded', { metadata: this.documentMetadata, globalData: this.globalData });
  }

  /**
   * Extrait les métadonnées du SVG
   * @private
   */
  _extractMetadata() {
    // Métadonnées du document
    const docMetadataElement = this.svgElement.querySelector('metadata#SVG_GEO_DOCUMENT');
    if (docMetadataElement) {
      try {
        this.documentMetadata = JSON.parse(docMetadataElement.textContent.trim());
      } catch (e) {
        console.error('Failed to parse SVG_GEO_DOCUMENT metadata:', e);
      }
    }

    // Données globales
    const globalDataElement = this.svgElement.querySelector('metadata#SVG_GEO_DATA');
    if (globalDataElement) {
      try {
        this.globalData = JSON.parse(globalDataElement.textContent.trim());
        
        // Extraire les couches si présentes
        if (this.globalData.layers) {
          this.layers = this.globalData.layers;
        }
      } catch (e) {
        console.error('Failed to parse SVG_GEO_DATA metadata:', e);
      }
    }
  }

  /**
   * Attache les événements aux éléments SVG
   * @private
   */
  _attachEvents() {
    const interactiveElements = this.svgElement.querySelectorAll('[data-class]');

    interactiveElements.forEach(element => {
      // Hover
      if (this.options.showHoverInfo) {
        element.addEventListener('mouseenter', (e) => this._onElementHover(e, element));
        element.addEventListener('mouseleave', () => this._onElementLeave());
      }

      // Click pour modal
      if (this.options.enableModal) {
        element.addEventListener('click', (e) => this._onElementClick(e, element));
      }
    });
  }

  /**
   * Gestion du survol d'un élément
   * @private
   */
  _onElementHover(event, element) {
    this.currentHover = element;
    
    const dataClass = element.getAttribute('data-class');
    const dataRef = element.getAttribute('data-ref');
    const id = element.getAttribute('id');

    let info = `<strong>${this.t(dataClass || 'Element')}</strong>`;
    if (dataRef) info += ` - ${this.t('Ref')}: ${dataRef}`;
    if (id) info += ` - ${this.t('ID')}: ${id}`;

    // Ajouter des infos rapides depuis data-props (filtrées)
    const propsStr = element.getAttribute('data-props');
    if (propsStr) {
      try {
        const props = this._filterFields(JSON.parse(propsStr));
        if (props.material) info += ` - ${this.t('Material')}: ${this.t(props.material)}`;
        if (props.condition) info += ` - ${this.t('Condition')}: ${this.t(props.condition)}`;
      } catch (e) {
        // Ignore parsing errors
      }
    }

    this.hoverInfo.innerHTML = info;
  }

  /**
   * Gestion de la sortie du survol
   * @private
   */
  _onElementLeave() {
    this.currentHover = null;
    this.hoverInfo.innerHTML = '';
  }

  /**
   * Gestion du clic sur un élément
   * @private
   */
  _onElementClick(event, element) {
    event.stopPropagation();
    // Ne pas afficher la modal si on a panné (déplacement)
    if (this.hasPanned) return;
    this._showModal(element);
  }

  /**
   * Affiche la modal avec les données d'un élément
   * @private
   */
  _showModal(element) {
    const data = this._extractElementData(element);
    
    const modalContent = `
      <div class="svg-geo-modal-content">
        <div class="svg-geo-modal-header">
          <h3 class="svg-geo-modal-title">${data.title}</h3>
          <div style="display: flex; gap: 8px; align-items: center;">
            <button class="svg-geo-modal-copy-btn" onclick="window.svgGeoViewerInstances?.get('${this.container.id}')?.copyCurrentElementData()" title="${this.t('Copy Data')}">📋</button>
            <button class="svg-geo-modal-close" onclick="this.closest('.svg-geo-modal').style.display='none'">&times;</button>
          </div>
        </div>
        <div class="svg-geo-modal-body">
          ${this._renderElementData(data)}
        </div>
      </div>
    `;

    // Stocker l'élément courant pour la copie
    this.currentModalElement = element;

    this.modal.innerHTML = modalContent;
    this.modal.style.display = 'flex';

    // Fermeture au clic sur le fond
    this.modal.onclick = (e) => {
      if (e.target === this.modal) {
        this.modal.style.display = 'none';
      }
    };
  }

  /**
   * Filtre les champs selon displayFields et excludeFields
   * @private
   */
  _filterFields(fields) {
    if (!fields || typeof fields !== 'object') return fields;
    
    const filtered = {};
    
    for (const [key, value] of Object.entries(fields)) {
      // Si displayFields est défini, n'afficher que ces champs
      if (this.options.displayFields && Array.isArray(this.options.displayFields)) {
        if (!this.options.displayFields.includes(key)) continue;
      }
      
      // Exclure les champs dans excludeFields
      if (this.options.excludeFields && Array.isArray(this.options.excludeFields)) {
        if (this.options.excludeFields.includes(key)) continue;
      }
      
      filtered[key] = value;
    }
    
    return filtered;
  }

  /**
   * Extrait les données d'un élément
   * @private
   */
  _extractElementData(element) {
    const dataClass = element.getAttribute('data-class');
    const data = {
      title: this.t(dataClass || 'Element'),
      id: element.getAttribute('id'),
      ref: element.getAttribute('data-ref'),
      class: dataClass,
      level: element.getAttribute('data-level'),
      layer: element.getAttribute('data-layer'),
      props: {},
      globalData: null
    };

    // Parser data-props et filtrer
    const propsStr = element.getAttribute('data-props');
    if (propsStr) {
      try {
        data.props = this._filterFields(JSON.parse(propsStr));
      } catch (e) {
        console.error('Failed to parse data-props:', e);
      }
    }

    // Récupérer les données globales si disponibles (filtrées)
    if (data.ref && this.globalData && this.globalData[data.ref]) {
      data.globalData = this._filterFields(this.globalData[data.ref]);
    }

    return data;
  }

  /**
   * Rendu HTML des données d'un élément
   * @private
   */
  _renderElementData(data) {
    let html = '';

    // Informations de base
    html += '<div style="margin-bottom: 12px;">';
    if (data.id) html += this._renderProperty(this.t('ID'), data.id);
    if (data.ref) html += this._renderProperty(this.t('Reference'), data.ref);
    if (data.class) html += this._renderProperty(this.t('Class'), this.t(data.class));
    if (data.level) html += this._renderProperty(this.t('Level of detail'), data.level);
    if (data.layer) html += this._renderProperty(this.t('Layer'), data.layer);
    html += '</div>';

    // Données globales
    if (data.globalData) {
      html += `<h4 style="margin-top: 12px; margin-bottom: 8px; color: #666; font-size: 0.85rem;">${this.t('Global data')}</h4>`;
      html += this._renderObjectProperties(data.globalData);
    }

    // Propriétés locales
    if (Object.keys(data.props).length > 0) {
      html += `<h4 style="margin-top: 12px; margin-bottom: 8px; color: #666; font-size: 0.85rem;">${this.t('Properties')}</h4>`;
      html += this._renderObjectProperties(data.props);
    }

    return html;
  }

  /**
   * Rendu d'une propriété
   * @private
   */
  _renderProperty(label, value) {
    let displayValue = value;

    // Traduire la valeur si c'est une chaîne
    if (typeof value === 'string') {
      displayValue = this.t(value);
    }

    // Formatage spécial pour certains types de valeurs
    if (label.toLowerCase().includes('condition') || label.toLowerCase().includes('état')) {
      displayValue = this._renderConditionBadge(value);
    } else if (label.toLowerCase().includes('status') || label.toLowerCase().includes('statut')) {
      displayValue = `<span class="svg-geo-badge">${this.t(value)}</span>`;
    } else if (value && typeof value === 'object') {
      displayValue = `<pre style="background: #f5f5f5; padding: 6px; border-radius: 3px; font-size: 0.75rem; overflow-x: auto; margin: 0;">${JSON.stringify(value, null, 2)}</pre>`;
    }

    return `
      <div class="svg-geo-property">
        <div class="svg-geo-property-label">${label}</div>
        <div class="svg-geo-property-value">${displayValue}</div>
      </div>
    `;
  }

  /**
   * Rendu des propriétés d'un objet
   * @private
   */
  _renderObjectProperties(obj) {
    let html = '';
    for (const [key, value] of Object.entries(obj)) {
      if (value !== null && value !== undefined) {
        // Convertir camelCase en espaces et capitaliser
        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        // Traduire le label
        const translatedLabel = this.t(label);
        html += this._renderProperty(translatedLabel, value);
      }
    }
    return html;
  }

  /**
   * Rendu d'un badge de condition
   * @private
   */
  _renderConditionBadge(condition) {
    const badgeClass = `svg-geo-badge-${condition.toLowerCase()}`;
    return `<span class="svg-geo-badge ${badgeClass}">${this.t(condition)}</span>`;
  }



  /**
   * Active/désactive une couche
   * @param {string} layerKey - Clé de la couche
   * @param {boolean} visible - Visibilité (optionnel, si absent = toggle auto)
   */
  toggleLayer(layerKey, visible) {
    const elements = this.svgElement.querySelectorAll(`[data-layer="${layerKey}"]`);
    
    // Si visible n'est pas défini, détecter l'état actuel et inverser
    if (visible === undefined) {
      const firstElement = elements[0];
      if (firstElement) {
        const currentlyVisible = firstElement.style.display !== 'none';
        visible = !currentlyVisible;
      } else {
        visible = true; // Par défaut, rendre visible
      }
    }
    
    elements.forEach(element => {
      element.style.display = visible ? '' : 'none';
    });
    
    // Masquer le menu contextuel après toggle
    this._hideContextMenu();
  }

  /**
   * Définit l'opacité d'une couche
   * @param {string} layerKey - Clé de la couche
   * @param {number} opacity - Opacité (0-1)
   */
  setLayerOpacity(layerKey, opacity) {
    const elements = this.svgElement.querySelectorAll(`[data-layer="${layerKey}"]`);
    elements.forEach(element => {
      element.style.opacity = opacity;
    });
  }

  /**
   * Obtient les métadonnées du document
   * @returns {Object|null}
   */
  getDocumentMetadata() {
    return this.documentMetadata;
  }

  /**
   * Obtient les données globales
   * @returns {Object|null}
   */
  getGlobalData() {
    return this.globalData;
  }

  /**
   * Obtient les informations d'un élément par sa référence
   * @param {string} ref - Référence de l'élément
   * @returns {Object|null}
   */
  getElementByRef(ref) {
    const element = this.svgElement.querySelector(`[data-ref="${ref}"]`);
    if (element) {
      return this._extractElementData(element);
    }
    return null;
  }

  /**
   * Obtient tous les éléments d'une classe
   * @param {string} className - Nom de la classe
   * @returns {Array}
   */
  getElementsByClass(className) {
    const elements = this.svgElement.querySelectorAll(`[data-class="${className}"]`);
    return Array.from(elements).map(el => this._extractElementData(el));
  }

  /**
   * Gestion du zoom à la molette
   * @private
   */
  _onWheel(event) {
    event.preventDefault();
    
    const delta = event.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(10, this.zoom * delta));
    
    this.setZoom(newZoom);
    this.emit('zoom', { zoom: this.zoom });
  }

  /**
   * Début du pan (clic gauche)
   * @private
   */
  _onPanStart(event) {
    if (event.button !== 0) return; // Seulement clic gauche
    
    // Autoriser le pan partout, même sur les éléments
    this.isPanning = true;
    this.hasPanned = false; // Réinitialiser au début du clic
    this.panStartX = event.clientX - this.panX;
    this.panStartY = event.clientY - this.panY;
    this.svgContainer.classList.add('panning');
    event.preventDefault();
  }

  /**
   * Déplacement du pan
   * @private
   */
  _onPanMove(event) {
    if (!this.isPanning) return;
    
    const newPanX = event.clientX - this.panStartX;
    const newPanY = event.clientY - this.panStartY;
    
    // Détecter un déplacement significatif (plus de 3 pixels)
    const deltaX = Math.abs(newPanX - this.panX);
    const deltaY = Math.abs(newPanY - this.panY);
    
    if (deltaX > 3 || deltaY > 3) {
      this.hasPanned = true;
    }
    
    this.panX = newPanX;
    this.panY = newPanY;
    
    this._applyTransform();
  }

  /**
   * Fin du pan
   * @private
   */
  _onPanEnd(event) {
    if (!this.isPanning) return;
    
    this.isPanning = false;
    this.svgContainer.classList.remove('panning');
    this.emit('pan', { x: this.panX, y: this.panY });
    
    // Réinitialiser hasPanned après un délai SEULEMENT si on a effectué un déplacement
    if (this.hasPanned) {
      setTimeout(() => {
        this.hasPanned = false;
      }, 300);
    }
  }

  /**
   * Applique la transformation (zoom + pan) au SVG
   * @private
   */
  _applyTransform() {
    if (!this.svgElement) return;
    
    this.svgElement.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.zoom})`;
    this.svgElement.style.transformOrigin = 'top left';
  }

  /**
   * Définit le niveau de zoom
   * @param {number} zoom - Niveau de zoom (0.1 à 10)
   */
  setZoom(zoom) {
    this.zoom = Math.max(0.1, Math.min(10, zoom));
    this._applyTransform();
  }

  /**
   * Réinitialise le zoom et le pan (vue complète)
   */
  resetView() {
    this._fitToView();
    this._hideContextMenu();
    this.emit('reset');
  }

  /**
   * Centre et ajuste le SVG pour qu'il soit visible dans le conteneur
   * @private
   */
  _fitToView() {
    if (!this.svgElement || !this.svgContainer) return;
    
    try {
      // Obtenir les dimensions du conteneur
      const containerRect = this.svgContainer.getBoundingClientRect();
      const containerWidth = containerRect.width;
      const containerHeight = containerRect.height;
      
      // Vérifier que le conteneur a des dimensions valides
      if (containerWidth === 0 || containerHeight === 0) {
        console.warn('Conteneur sans dimensions, _fitToView() réessayera dans 100ms');
        setTimeout(() => this._fitToView(), 100);
        return;
      }
      
      let svgWidth, svgHeight, svgX = 0, svgY = 0;
      
      // Utiliser le viewBox s'il existe, sinon calculer le BBox de tous les éléments
      const viewBox = this.svgElement.getAttribute('viewBox');
      if (viewBox) {
        const parts = viewBox.split(/\s+/).map(parseFloat);
        svgX = parts[0];
        svgY = parts[1];
        svgWidth = parts[2];
        svgHeight = parts[3];
      } else {
        // Calculer le BBox global de tous les éléments
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        const allElements = this.svgElement.querySelectorAll('*');
        
        for (const el of allElements) {
          if (el.getBBox && typeof el.getBBox === 'function') {
            try {
              const bbox = el.getBBox();
              if (bbox.width > 0 && bbox.height > 0) {
                minX = Math.min(minX, bbox.x);
                minY = Math.min(minY, bbox.y);
                maxX = Math.max(maxX, bbox.x + bbox.width);
                maxY = Math.max(maxY, bbox.y + bbox.height);
              }
            } catch (e) {}
          }
        }
        
        if (isFinite(minX)) {
          svgX = minX;
          svgY = minY;
          svgWidth = maxX - minX;
          svgHeight = maxY - minY;
        } else {
          // Fallback si aucun élément trouvé
          svgX = 0;
          svgY = 0;
          svgWidth = parseFloat(this.svgElement.getAttribute('width')) || 800;
          svgHeight = parseFloat(this.svgElement.getAttribute('height')) || 600;
        }
      }
      
      // Calculer le zoom pour que le SVG tienne dans le conteneur avec marges
      const margin = 40; // Marge de 40px
      const scaleX = (containerWidth - margin * 2) / svgWidth;
      const scaleY = (containerHeight - margin * 2) / svgHeight;
      this.zoom = Math.min(scaleX, scaleY, 1); // Ne pas zoomer au-delà de 100%
      
      // Centrer le SVG en tenant compte de l'offset
      const scaledWidth = svgWidth * this.zoom;
      const scaledHeight = svgHeight * this.zoom;
      const offsetX = svgX * this.zoom;
      const offsetY = svgY * this.zoom;
      
      this.panX = (containerWidth - scaledWidth) / 2 - offsetX;
      this.panY = (containerHeight - scaledHeight) / 2 - offsetY;
      
      this._applyTransform();
    } catch (error) {
      console.warn('Impossible de centrer le SVG:', error);
      // Fallback: zoom à 1, centré
      this.zoom = 1;
      this.panX = 0;
      this.panY = 0;
      this._applyTransform();
    }
  }

  /**
   * Affiche le menu contextuel
   * @private
   */
  _onContextMenu(event) {
    event.preventDefault();
    
    if (!this.contextMenu) return;

    // Construire le menu
    const menuItems = this._buildContextMenu(event);
    this.contextMenu.innerHTML = menuItems;
    
    // Obtenir les dimensions de la fenêtre
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    // Position initiale au curseur
    let left = event.clientX;
    let top = event.clientY;
    
    // Positionner le menu à la position initiale pour mesurer
    this.contextMenu.style.left = left + 'px';
    this.contextMenu.style.top = top + 'px';
    this.contextMenu.style.display = 'block';
    
    // Obtenir les dimensions réelles du menu après rendu
    const menuWidth = this.contextMenu.offsetWidth;
    const menuHeight = this.contextMenu.offsetHeight;
    
    // Ajuster si le menu dépasse à droite
    if (left + menuWidth > windowWidth) {
      left = Math.max(5, event.clientX - menuWidth);
    }
    
    // Ajuster si le menu dépasse en bas
    if (top + menuHeight > windowHeight) {
      top = Math.max(5, event.clientY - menuHeight);
    }
    
    // S'assurer des marges minimales
    left = Math.max(5, Math.min(left, windowWidth - menuWidth - 5));
    top = Math.max(5, Math.min(top, windowHeight - menuHeight - 5));
    
    // Appliquer la position finale
    this.contextMenu.style.left = left + 'px';
    this.contextMenu.style.top = top + 'px';
  }

  /**
   * Cache le menu contextuel
   * @private
   */
  _hideContextMenu() {
    if (this.contextMenu) {
      this.contextMenu.style.display = 'none';
    }
  }

  /**
   * Construit le HTML du menu contextuel
   * @private
   */
  _buildContextMenu(event) {
    let html = '';

    // Zoom complet
    html += `<div class="svg-geo-context-menu-item" onclick="window.svgGeoViewerInstances?.get('${this.container.id}')?.resetView()">
      📐 ${this.t('Reset View')}
    </div>`;

    // Plein écran
    html += `<div class="svg-geo-context-menu-item" onclick="window.svgGeoViewerInstances?.get('${this.container.id}')?.toggleFullscreen()">
      ${this.isFullscreen ? '🗗' : '⛶'} ${this.isFullscreen ? this.t('Exit Fullscreen') : this.t('Fullscreen')}
    </div>`;

    html += '<div class="svg-geo-context-menu-separator"></div>';

    // Couches (submenu)
    if (Object.keys(this.layers).length > 0) {
      html += `<div class="svg-geo-context-menu-item">
        📋 ${this.t('Layers')}
      </div>`;
      html += '<div class="svg-geo-context-menu-submenu">';
      
      const sortedLayers = Object.entries(this.layers).sort(([, a], [, b]) => (a.order || 0) - (b.order || 0));
      sortedLayers.forEach(([layerKey, layer]) => {
        const lang = this.documentMetadata?.document?.lang || this.options.locale;
        const label = layer.label?.[lang] || layer.label?.en || layerKey;
        const visible = this.svgElement.querySelector(`[data-layer="${layerKey}"]`)?.style.display !== 'none';
        
        html += `<div class="svg-geo-context-menu-item" onclick="event.stopPropagation(); window.svgGeoViewerInstances?.get('${this.container.id}')?.toggleLayer('${layerKey}')">
          <input type="checkbox" class="svg-geo-context-menu-checkbox" ${visible ? 'checked' : ''} style="pointer-events: none;">
          ${label}
        </div>`;
      });
      
      html += '</div>';
      html += '<div class="svg-geo-context-menu-separator"></div>';
    }

    // Enregistrer en SVG
    html += `<div class="svg-geo-context-menu-item" onclick="window.svgGeoViewerInstances?.get('${this.container.id}')?.downloadSVG()">
      💾 ${this.t('Save as SVG')}
    </div>`;

    // Copier dans le presse-papier
    html += `<div class="svg-geo-context-menu-item" onclick="window.svgGeoViewerInstances?.get('${this.container.id}')?.copyToClipboard()">
      📋 ${this.t('Copy to Clipboard')} (SVG)
    </div>`;

    // Copier comme PNG (optimal pour Word)
    html += `<div class="svg-geo-context-menu-item" onclick="window.svgGeoViewerInstances?.get('${this.container.id}')?.copyAsPNG()">
      🖼️ ${this.t('Copy as Image')} (PNG)
    </div>`;
    
    // Copier toutes les données en HTML
    html += `<div class="svg-geo-context-menu-item" onclick="window.svgGeoViewerInstances?.get('${this.container.id}')?.copyAllDataAsRTF()">
      📄 ${this.t('Copy All Data')} (HTML)
    </div>`;

    html += '<div class="svg-geo-context-menu-separator"></div>';

    // Propriétés des éléments sous le curseur
    const elementsUnderCursor = this._getElementsUnderCursor(event);
    if (elementsUnderCursor.length > 0) {
      html += `<div class="svg-geo-context-menu-item">
        🔍 ${this.t('Elements under cursor')}
      </div>`;
      html += '<div class="svg-geo-context-menu-submenu">';
      
      elementsUnderCursor.forEach((el) => {
        const dataClass = el.getAttribute('data-class');
        const dataRef = el.getAttribute('data-ref') || el.getAttribute('id');
        const elId = el.getAttribute('id') || dataRef;
        
        html += `<div class="svg-geo-context-menu-item" onclick="event.stopPropagation(); window.svgGeoViewerInstances?.get('${this.container.id}')?.showElementModalAndCloseMenu('${elId}')">
          ${this.t(dataClass || 'Element')} ${dataRef ? '- ' + dataRef : ''}
        </div>`;
      });
      
      html += '</div>';
    }

    // Items personnalisés
    if (this.options.contextMenuItems.length > 0) {
      html += '<div class="svg-geo-context-menu-separator"></div>';
      this.options.contextMenuItems.forEach((item, index) => {
        html += `<div class="svg-geo-context-menu-item" onclick="event.stopPropagation(); window.svgGeoViewerInstances?.get('${this.container.id}')?.emit('contextMenuItem', { index: ${index}, item: ${JSON.stringify(item).replace(/"/g, '&quot;')} })">
          ${item.icon || '•'} ${item.label}
        </div>`;
      });
    }

    return html;
  }

  /**
   * Récupère les éléments sous le curseur
   * @private
   */
  _getElementsUnderCursor(event) {
    const elements = document.elementsFromPoint(event.clientX, event.clientY);
    return elements.filter(el => el.hasAttribute('data-class'));
  }

  /**
   * Affiche la modal d'un élément par sa référence
   * @param {string} ref - Référence de l'élément
   */
  showElementModal(ref) {
    const element = this.svgElement.querySelector(`[data-ref="${ref}"], #${ref}`);
    if (element) {
      this._showModal(element);
    }
  }

  /**
   * Affiche la modal et ferme le menu contextuel
   * @param {string} ref - Référence de l'élément
   */
  showElementModalAndCloseMenu(ref) {
    // Fermer le menu contextuel
    if (this.contextMenu) {
      this.contextMenu.style.display = 'none';
    }
    // Afficher la modal
    this.showElementModal(ref);
  }

  /**
   * Copie les données d'un élément par sa référence
   * @param {string} ref - Référence de l'élément
   */
  async copyElementData(ref) {
    const element = this.svgElement.querySelector(`[data-ref="${ref}"], #${ref}`);
    if (element) {
      await this.copyDataAsRTF(element);
    }
  }

  /**
   * Active/désactive le mode plein écran
   */
  toggleFullscreen() {
    if (!document.fullscreenElement) {
      this.enterFullscreen();
    } else {
      this.exitFullscreen();
    }
    this._hideContextMenu();
  }

  /**
   * Entre en mode plein écran
   */
  enterFullscreen() {
    if (this.container.requestFullscreen) {
      this.container.requestFullscreen();
    } else if (this.container.webkitRequestFullscreen) {
      this.container.webkitRequestFullscreen();
    } else if (this.container.msRequestFullscreen) {
      this.container.msRequestFullscreen();
    }
    
    this.isFullscreen = true;
    this.container.classList.add('fullscreen');
    
    // Ajuster la position de la modal si configuré
    if (this.modal && this.options.fullscreenModal === 'bottom-right') {
      this.modal.classList.add('bottom-right');
    }
    
    this.emit('fullscreen', { fullscreen: true });
  }

  /**
   * Sort du mode plein écran
   */
  exitFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
    
    this.isFullscreen = false;
    this.container.classList.remove('fullscreen');
    
    if (this.modal) {
      this.modal.classList.remove('bottom-right');
    }
    
    this.emit('fullscreen', { fullscreen: false });
  }

  /**
   * Télécharge le SVG en tant que fichier
   */
  downloadSVG() {
    if (!this.svgElement) return;
    
    const svgData = new XMLSerializer().serializeToString(this.svgElement);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'svg-geo-export.svg';
    a.click();
    
    URL.revokeObjectURL(url);
    this.emit('download', { format: 'svg' });
  }

  /**
   * Copie le SVG dans le presse-papier (compatible Word, PowerPoint, etc.)
   */
  async copyToClipboard() {
    if (!this.svgElement) return;
    
    try {
      const svgData = new XMLSerializer().serializeToString(this.svgElement);
      
      // Pour une compatibilité maximale avec Word/PowerPoint, on utilise ClipboardItem
      // avec plusieurs formats (texte SVG + HTML)
      if (navigator.clipboard && window.ClipboardItem) {
        // Créer une version HTML avec le SVG embarqué (meilleur rendu dans Word)
        const htmlData = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body>
  ${svgData}
</body>
</html>`;

        // Créer un ClipboardItem avec plusieurs types MIME
        const blobSvg = new Blob([svgData], { type: 'image/svg+xml' });
        const blobHtml = new Blob([htmlData], { type: 'text/html' });
        const blobText = new Blob([svgData], { type: 'text/plain' });

        const clipboardItem = new ClipboardItem({
          'image/svg+xml': blobSvg,
          'text/html': blobHtml,
          'text/plain': blobText
        });

        await navigator.clipboard.write([clipboardItem]);
        this.emit('copy', { success: true, format: 'multi' });
        this.showNotification(this.t('SVG copied to clipboard!') + ' • ' + this.t('Compatible with Word, PowerPoint, etc.'), 'success');
      } else {
        // Fallback pour les navigateurs plus anciens
        await navigator.clipboard.writeText(svgData);
        this.emit('copy', { success: true, format: 'text' });
        this.showNotification(this.t('SVG copied to clipboard!'), 'success');
      }
    } catch (err) {
      console.error('Failed to copy:', err);
      
      // Fallback ultime : créer un textarea temporaire
      try {
        const svgData = new XMLSerializer().serializeToString(this.svgElement);
        const textarea = document.createElement('textarea');
        textarea.value = svgData;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        
        this.emit('copy', { success: true, format: 'fallback' });
        this.showNotification(this.t('SVG copied to clipboard!'), 'success');
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr);
        this.emit('copy', { success: false, error: fallbackErr });
        this.showNotification(this.t('Failed to copy to clipboard'), 'error');
      }
    }
  }

  /**
   * Copie les données de l'élément actuellement affiché dans la modal
   */
  async copyCurrentElementData() {
    if (!this.currentModalElement) {
      console.warn('Aucun élément modal actif');
      return;
    }
    await this.copyDataAsRTF(this.currentModalElement);
  }

  /**
   * Copie toutes les données de tous les éléments en RTF
   */
  async copyAllDataAsRTF() {
    if (!this.svgElement) return;
    
    try {
      // Récupérer tous les éléments avec data-class
      const allElements = this.svgElement.querySelectorAll('[data-class]');
      
      if (allElements.length === 0) {
        this.showNotification(this.t('No data to copy'), 'error');
        return;
      }
      
      // Collecter toutes les données
      const allData = [];
      allElements.forEach(element => {
        allData.push(this._extractElementData(element));
      });
      
      // Générer le HTML avec toutes les données (compatible Word)
      const html = this._generateHTMLAll(allData);
      const text = this._generateTextAll(allData);
      
      // Copier dans le presse-papier (HTML uniquement, compatible Word)
      if (navigator.clipboard && window.ClipboardItem) {
        const blobHtml = new Blob([html], { type: 'text/html' });
        const blobText = new Blob([text], { type: 'text/plain' });
        
        const clipboardItem = new ClipboardItem({
          'text/html': blobHtml,
          'text/plain': blobText
        });
        
        await navigator.clipboard.write([clipboardItem]);
        this.emit('copyAllData', { success: true, count: allData.length });
        this.showNotification(`${allData.length} ${this.t('elements copied to clipboard!')} • ${this.t('Paste in Word with formatting')}`, 'success');
      } else {
        await navigator.clipboard.writeText(html);
        this.emit('copyAllData', { success: true, count: allData.length });
        this.showNotification(`${allData.length} ${this.t('elements copied to clipboard!')}`, 'success');
      }
    } catch (err) {
      console.error('Failed to copy all data:', err);
      this.emit('copyAllData', { success: false, error: err });
      this.showNotification(this.t('Failed to copy data'), 'error');
    }
  }

  /**
   * Copie les données d'un élément en RTF (compatible Word)
   * @param {HTMLElement} element - Élément SVG
   */
  async copyDataAsRTF(element) {
    if (!element) return;
    
    try {
      const data = this._extractElementData(element);
      
      // Générer le HTML avec mise en forme (compatible Word)
      const html = this._generateHTMLForCopy(data);
      
      // Générer une version texte simple
      const text = this._generateTextForCopy(data);
      
      // Créer un ClipboardItem avec HTML et texte (RTF non supporté par clipboard API)
      if (navigator.clipboard && window.ClipboardItem) {
        const blobHtml = new Blob([html], { type: 'text/html' });
        const blobText = new Blob([text], { type: 'text/plain' });
        
        const clipboardItem = new ClipboardItem({
          'text/html': blobHtml,
          'text/plain': blobText
        });
        
        await navigator.clipboard.write([clipboardItem]);
        this.emit('copyData', { success: true, format: 'html', element: data });
        this.showNotification(this.t('Data copied to clipboard!') + ' • ' + this.t('Paste in Word with formatting'), 'success');
      } else {
        // Fallback : copier en HTML
        await navigator.clipboard.writeText(html);
        this.emit('copyData', { success: true, format: 'html', element: data });
        this.showNotification(this.t('Data copied to clipboard!'), 'success');
      }
    } catch (err) {
      console.error('Failed to copy data:', err);
      this.emit('copyData', { success: false, error: err });
      this.showNotification(this.t('Failed to copy data'), 'error');
    }
  }

  /**
   * Génère du RTF formaté pour les données d'un élément
   * @private
   */
  _generateRTF(data) {
    // En-tête RTF
    let rtf = '{\\rtf1\\ansi\\deff0\n';
    
    // Définition des couleurs
    rtf += '{\\colortbl;\\red0\\green0\\blue0;\\red51\\green51\\blue51;\\red102\\green102\\blue102;\\red33\\green150\\blue243;\\red76\\green175\\blue80;\\red255\\green152\\blue0;\\red244\\green67\\blue54;}\n';
    
    // Définition des polices
    rtf += '{\\fonttbl{\\f0\\fswiss\\fcharset0 Arial;}{\\f1\\fmodern\\fcharset0 Courier New;}}\n';
    
    // Titre principal
    rtf += '\\pard\\sb200\\sa200\\b\\fs32\\cf4 ' + this._escapeRTF(data.title) + '\\b0\\fs24\\par\n';
    
    // Ligne de séparation
    rtf += '\\pard\\brdrt\\brdrs\\brdrw10\\brsp20\\par\n';
    
    // Informations de base
    rtf += '\\pard\\sb100\\sa50\\b\\fs24\\cf1 ' + this._escapeRTF(this.t('Basic Information')) + '\\b0\\par\n';
    
    if (data.id) {
      rtf += '\\pard\\sb50\\sa50\\li200\\b\\fs20\\cf2 ' + this._escapeRTF(this.t('ID')) + ':\\b0  ' + this._escapeRTF(data.id) + '\\par\n';
    }
    if (data.ref) {
      rtf += '\\pard\\sb50\\sa50\\li200\\b\\fs20\\cf2 ' + this._escapeRTF(this.t('Reference')) + ':\\b0  ' + this._escapeRTF(data.ref) + '\\par\n';
    }
    if (data.class) {
      rtf += '\\pard\\sb50\\sa50\\li200\\b\\fs20\\cf2 ' + this._escapeRTF(this.t('Class')) + ':\\b0  ' + this._escapeRTF(this.t(data.class)) + '\\par\n';
    }
    if (data.level) {
      rtf += '\\pard\\sb50\\sa50\\li200\\b\\fs20\\cf2 ' + this._escapeRTF(this.t('Level of detail')) + ':\\b0  ' + this._escapeRTF(data.level) + '\\par\n';
    }
    if (data.layer) {
      rtf += '\\pard\\sb50\\sa50\\li200\\b\\fs20\\cf2 ' + this._escapeRTF(this.t('Layer')) + ':\\b0  ' + this._escapeRTF(data.layer) + '\\par\n';
    }
    
    // Données globales
    if (data.globalData) {
      rtf += '\\pard\\sb200\\sa50\\b\\fs24\\cf1 ' + this._escapeRTF(this.t('Global data')) + '\\b0\\par\n';
      rtf += this._generateRTFProperties(data.globalData);
    }
    
    // Propriétés locales
    if (data.props && Object.keys(data.props).length > 0) {
      rtf += '\\pard\\sb200\\sa50\\b\\fs24\\cf1 ' + this._escapeRTF(this.t('Properties')) + '\\b0\\par\n';
      rtf += this._generateRTFProperties(data.props);
    }
    
    rtf += '}';
    return rtf;
  }

  /**
   * Génère les propriétés en RTF
   * @private
   * @param {Object} obj - Objet contenant les propriétés
   * @param {number} indent - Indentation en twips (optionnel, défaut 200)
   */
  _generateRTFProperties(obj, indent = 200) {
    let rtf = '';
    
    for (const [key, value] of Object.entries(obj)) {
      if (value !== null && value !== undefined) {
        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        const translatedLabel = this.t(label);
        
        if (typeof value === 'object') {
          rtf += `\\pard\\sb50\\sa50\\li${indent}\\b\\fs20\\cf2 ` + this._escapeRTF(translatedLabel) + ':\\b0\\par\n';
          rtf += `\\pard\\sb20\\sa20\\li${indent + 200}\\f1\\fs18\\cf3 ` + this._escapeRTF(JSON.stringify(value, null, 2)) + '\\f0\\fs20\\par\n';
        } else {
          const translatedValue = typeof value === 'string' ? this.t(value) : String(value);
          
          // Coloration selon le type de valeur
          let color = '\\cf0';
          if (key.toLowerCase().includes('condition')) {
            if (value === 'Good' || value === 'Excellent') color = '\\cf5';
            else if (value === 'Moderate') color = '\\cf6';
            else if (value === 'Poor' || value === 'Ruined') color = '\\cf7';
          }
          
          rtf += `\\pard\\sb50\\sa50\\li${indent}\\b\\fs20\\cf2 ` + this._escapeRTF(translatedLabel) + ':\\b0  ' + color + this._escapeRTF(translatedValue) + '\\cf0\\par\n';
        }
      }
    }
    
    return rtf;
  }

  /**
   * Échappe les caractères spéciaux pour RTF
   * @private
   */
  _escapeRTF(text) {
    if (!text) return '';
    
    return String(text)
      .replace(/\\/g, '\\\\')
      .replace(/{/g, '\\{')
      .replace(/}/g, '\\}')
      .replace(/\n/g, '\\par\n')
      .split('')
      .map(char => {
        const code = char.charCodeAt(0);
        // Convertir les caractères accentués en Unicode RTF
        if (code > 127) {
          return '\\u' + code + '?';
        }
        return char;
      })
      .join('');
  }

  /**
   * Génère du HTML formaté pour copier (optimisé Microsoft Word)
   * @private
   */
  _generateHTMLForCopy(data) {
    let html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">';
    html += '<head><meta charset="utf-8"><meta name="Generator" content="SVG_GEO Viewer">';
    html += '<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View></w:WordDocument></xml><![endif]-->';
    html += '<style>';
    html += 'body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; line-height: 1.5; margin: 20px; }';
    html += 'h1 { font-size: 18pt; font-weight: bold; color: #2E75B6; margin: 16pt 0 12pt 0; border-bottom: 2pt solid #2E75B6; padding-bottom: 4pt; }';
    html += 'h2 { font-size: 14pt; font-weight: bold; color: #1F4E78; margin: 12pt 0 8pt 0; }';
    html += 'h3 { font-size: 12pt; font-weight: bold; color: #2E75B6; margin: 10pt 0 6pt 0; }';
    html += 'table { border-collapse: collapse; width: 100%; margin: 8pt 0; }';
    html += 'td { padding: 4pt 8pt; vertical-align: top; }';
    html += 'td.label { font-weight: bold; color: #555; width: 35%; background-color: #F2F2F2; }';
    html += 'td.value { color: #333; width: 65%; }';
    html += '.badge { padding: 2pt 6pt; border-radius: 3pt; font-size: 9pt; font-weight: bold; white-space: nowrap; }';
    html += '.badge-excellent { background-color: #4CAF50; color: white; }';
    html += '.badge-good { background-color: #8BC34A; color: white; }';
    html += '.badge-fair { background-color: #FFC107; color: #333; }';
    html += '.badge-poor { background-color: #FF9800; color: white; }';
    html += '.badge-bad { background-color: #F44336; color: white; }';
    html += 'pre { background: #F8F8F8; padding: 8pt; border: 1pt solid #DDD; border-radius: 3pt; font-family: Consolas, monospace; font-size: 9pt; }';
    
    // Ajouter le CSS personnalisé si défini
    if (this.options.customCSS) {
      html += this.options.customCSS;
    }
    
    html += '</style></head><body>';
    
    // Titre
    html += '<h1>' + this._escapeHTML(data.title) + '</h1>';
    
    // Informations de base
    html += '<h2>' + this.t('Basic Information') + '</h2><table>';
    if (data.id) html += `<tr><td class="label">${this.t('ID')}:</td><td class="value">${this._escapeHTML(data.id)}</td></tr>`;
    if (data.ref) html += `<tr><td class="label">${this.t('Reference')}:</td><td class="value">${this._escapeHTML(data.ref)}</td></tr>`;
    if (data.class) html += `<tr><td class="label">${this.t('Class')}:</td><td class="value">${this._escapeHTML(this.t(data.class))}</td></tr>`;
    if (data.level) html += `<tr><td class="label">${this.t('Level of detail')}:</td><td class="value">${this._escapeHTML(data.level)}</td></tr>`;
    if (data.layer) html += `<tr><td class="label">${this.t('Layer')}:</td><td class="value">${this._escapeHTML(data.layer)}</td></tr>`;
    html += '</table>';

    // Données globales
    if (data.globalData) {
      html += '<h2>' + this.t('Global data') + '</h2>';
      html += this._generateHTMLProperties(data.globalData);
    }

    // Propriétés
    if (data.props && Object.keys(data.props).length > 0) {
      html += '<h2>' + this.t('Properties') + '</h2>';
      html += this._generateHTMLProperties(data.props);
    }

    html += '</body></html>';
    return html;
  }

  /**
   * Génère les propriétés en HTML avec tableau
   * @private
   */
  _generateHTMLProperties(obj) {
    let html = '<table>';
    
    for (const [key, value] of Object.entries(obj)) {
      if (value !== null && value !== undefined) {
        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        const translatedLabel = this.t(label);
        
        if (typeof value === 'object') {
          html += `<tr><td class="label" colspan="2">${translatedLabel}:</td></tr>`;
          html += `<tr><td colspan="2"><pre>${JSON.stringify(value, null, 2)}</pre></td></tr>`;
        } else {
          const translatedValue = typeof value === 'string' ? this.t(value) : String(value);
          
          // Badge pour les conditions
          if (key.toLowerCase().includes('condition')) {
            const badgeClass = 'badge-' + value.toLowerCase();
            html += `<tr><td class="label">${translatedLabel}:</td><td class="value"><span class="badge ${badgeClass}">${this._escapeHTML(translatedValue)}</span></td></tr>`;
          } else {
            html += `<tr><td class="label">${translatedLabel}:</td><td class="value">${this._escapeHTML(translatedValue)}</td></tr>`;
          }
        }
      }
    }
    
    html += '</table>';
    return html;
  }
  
  /**
   * Échappe les caractères HTML spéciaux
   * @private
   */
  _escapeHTML(str) {
    if (typeof str !== 'string') return str;
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /**
   * Génère du texte simple pour copier
   * @private
   */
  _generateTextForCopy(data) {
    let text = data.title + '\n';
    text += '='.repeat(data.title.length) + '\n\n';
    
    // Informations de base
    text += this.t('Basic Information') + ':\n';
    text += '-'.repeat(30) + '\n';
    if (data.id) text += this.t('ID') + ': ' + data.id + '\n';
    if (data.ref) text += this.t('Reference') + ': ' + data.ref + '\n';
    if (data.class) text += this.t('Class') + ': ' + this.t(data.class) + '\n';
    if (data.level) text += this.t('Level of detail') + ': ' + data.level + '\n';
    if (data.layer) text += this.t('Layer') + ': ' + data.layer + '\n';
    
    // Données globales
    if (data.globalData) {
      text += '\n' + this.t('Global data') + ':\n';
      text += '-'.repeat(30) + '\n';
      text += this._generateTextProperties(data.globalData);
    }
    
    // Propriétés
    if (Object.keys(data.props).length > 0) {
      text += '\n' + this.t('Properties') + ':\n';
      text += '-'.repeat(30) + '\n';
      text += this._generateTextProperties(data.props);
    }
    
    return text;
  }

  /**
   * Génère les propriétés en texte
   * @private
   */
  _generateTextProperties(obj) {
    let text = '';
    
    for (const [key, value] of Object.entries(obj)) {
      if (value !== null && value !== undefined) {
        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        const translatedLabel = this.t(label);
        
        if (typeof value === 'object') {
          text += translatedLabel + ':\n' + JSON.stringify(value, null, 2) + '\n';
        } else {
          const translatedValue = typeof value === 'string' ? this.t(value) : String(value);
          text += translatedLabel + ': ' + translatedValue + '\n';
        }
      }
    }
    
    return text;
  }

  /**
   * Génère du RTF pour toutes les données
   * @private
   */
  _generateRTFAll(allData) {
    let rtf = '{\\rtf1\\ansi\\deff0\n';
    rtf += '{\\colortbl;\\red0\\green0\\blue0;\\red51\\green51\\blue51;\\red102\\green102\\blue102;\\red33\\green150\\blue243;\\red76\\green175\\blue80;\\red255\\green152\\blue0;\\red244\\green67\\blue54;}\n';
    rtf += '{\\fonttbl{\\f0\\fswiss\\fcharset0 Arial;}{\\f1\\fmodern\\fcharset0 Courier New;}}\n';
    
    rtf += '\\pard\\sb200\\sa200\\b\\fs32\\cf4 ' + this._escapeRTF(this.t('All Elements Data')) + '\\b0\\fs24\\par\n';
    rtf += '\\pard\\sb100\\sa100\\fs20\\cf2 ' + this._escapeRTF(`${allData.length} ${this.t('elements')}`) + '\\par\n';
    rtf += '\\pard\\brdrt\\brdrs\\brdrw10\\brsp20\\par\n';
    
    allData.forEach((data, index) => {
      if (index > 0) rtf += '\\pard\\brdrt\\brdrs\\brdrw5\\brsp10\\par\n';
      rtf += '\\pard\\sb150\\sa50\\b\\fs24\\cf4 ' + this._escapeRTF(`${index + 1}. ${data.title}`) + '\\b0\\par\n';
      
      if (data.ref) rtf += '\\pard\\sb50\\sa50\\li200\\b\\fs20\\cf2 ' + this._escapeRTF(this.t('Reference')) + ':\\b0  ' + this._escapeRTF(data.ref) + '\\par\n';
      if (data.class) rtf += '\\pard\\sb50\\sa50\\li200\\b\\fs20\\cf2 ' + this._escapeRTF(this.t('Class')) + ':\\b0  ' + this._escapeRTF(this.t(data.class)) + '\\par\n';
      
      if (data.props && Object.keys(data.props).length > 0) {
        rtf += '\\pard\\sb100\\sa50\\li200\\b\\fs20\\cf1 ' + this._escapeRTF(this.t('Properties')) + ':\\b0\\par\n';
        rtf += this._generateRTFProperties(data.props, 400);
      }
    });
    
    rtf += '}';
    return rtf;
  }

  /**
   * Génère du HTML pour toutes les données (optimisé Microsoft Word)
   * @private
   */
  _generateHTMLAll(allData) {
    let html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">';
    html += '<head><meta charset="utf-8"><meta name="Generator" content="SVG_GEO Viewer">';
    html += '<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View></w:WordDocument></xml><![endif]-->';
    html += '<style>';
    html += 'body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; line-height: 1.5; margin: 20px; }';
    html += 'h1 { font-size: 20pt; font-weight: bold; color: #2E75B6; text-align: center; margin: 16pt 0; border-bottom: 3pt solid #2E75B6; padding-bottom: 8pt; }';
    html += 'h2 { font-size: 14pt; font-weight: bold; color: #2E75B6; margin: 16pt 0 10pt 0; border-bottom: 1pt solid #2E75B6; padding-bottom: 4pt; }';
    html += 'h3 { font-size: 12pt; font-weight: bold; color: #1F4E78; margin: 10pt 0 6pt 0; }';
    html += 'p.center { text-align: center; color: #666; font-size: 10pt; margin: 8pt 0; }';
    html += 'hr { border: none; border-top: 1pt dashed #CCC; margin: 16pt 0; }';
    html += 'hr.thick { border-top: 2pt solid #2E75B6; margin: 20pt 0; }';
    html += 'table { border-collapse: collapse; width: 100%; margin: 8pt 0; }';
    html += 'td { padding: 4pt 8pt; vertical-align: top; }';
    html += 'td.label { font-weight: bold; color: #555; width: 35%; background-color: #F2F2F2; }';
    html += 'td.value { color: #333; width: 65%; }';
    html += '.badge { padding: 2pt 6pt; border-radius: 3pt; font-size: 9pt; font-weight: bold; white-space: nowrap; }';
    html += '.badge-excellent { background-color: #4CAF50; color: white; }';
    html += '.badge-good { background-color: #8BC34A; color: white; }';
    html += '.badge-fair { background-color: #FFC107; color: #333; }';
    html += '.badge-poor { background-color: #FF9800; color: white; }';
    html += '.badge-bad { background-color: #F44336; color: white; }';
    html += 'pre { background: #F8F8F8; padding: 8pt; border: 1pt solid #DDD; border-radius: 3pt; font-family: Consolas, monospace; font-size: 9pt; }';
    
    // Ajouter le CSS personnalisé si défini
    if (this.options.customCSS) {
      html += this.options.customCSS;
    }
    
    html += '</style></head><body>';
    
    html += `<h1>${this.t('All Elements Data')}</h1>`;
    html += `<p class="center">${allData.length} ${this.t('elements')}</p>`;
    html += '<hr class="thick">';
    
    allData.forEach((data, index) => {
      if (index > 0) html += '<hr>';
      
      html += `<h2>${index + 1}. ${this._escapeHTML(data.title)}</h2>`;
      
      if (data.ref || data.class) {
        html += '<table>';
        if (data.ref) html += `<tr><td class="label">${this.t('Reference')}:</td><td class="value">${this._escapeHTML(data.ref)}</td></tr>`;
        if (data.class) html += `<tr><td class="label">${this.t('Class')}:</td><td class="value">${this._escapeHTML(this.t(data.class))}</td></tr>`;
        html += '</table>';
      }
      
      if (data.props && Object.keys(data.props).length > 0) {
        html += `<h3>${this.t('Properties')}:</h3>`;
        html += this._generateHTMLProperties(data.props);
      }
    });
    
    html += '</body></html>';
    return html;
  }

  /**
   * Génère du texte pour toutes les données
   * @private
   */
  _generateTextAll(allData) {
    let text = `${this.t('All Elements Data')}\n`;
    text += `${allData.length} ${this.t('elements')}\n`;
    text += '='.repeat(60) + '\n\n';
    
    allData.forEach((data, index) => {
      if (index > 0) text += '\n' + '-'.repeat(60) + '\n\n';
      text += `${index + 1}. ${data.title}\n`;
      if (data.ref) text += `${this.t('Reference')}: ${data.ref}\n`;
      if (data.class) text += `${this.t('Class')}: ${this.t(data.class)}\n`;
      
      if (data.props && Object.keys(data.props).length > 0) {
        text += `\n${this.t('Properties')}:\n`;
        text += this._generateTextProperties(data.props);
      }
    });
    
    return text;
  }

  /**
   * Copie le SVG comme image PNG dans le presse-papier (optimal pour Word)
   * Crée un div temporaire avec le SVG aux bonnes proportions
   */
  async copyAsPNG() {
    if (!this.svgElement) return;
    
    try {
      // Récupérer les dimensions du viewBox ou du SVG
      let contentWidth, contentHeight;
      const viewBox = this.svgElement.getAttribute('viewBox');
      
      if (viewBox) {
        const parts = viewBox.split(/\s+/).map(parseFloat);
        contentWidth = parts[2];
        contentHeight = parts[3];
      } else {
        contentWidth = parseFloat(this.svgElement.getAttribute('width')) || 800;
        contentHeight = parseFloat(this.svgElement.getAttribute('height')) || 600;
      }
      
      // Calculer les dimensions finales (minimum 2000px sur le plus grand côté)
      const minDimension = 2000;
      const maxContentDimension = Math.max(contentWidth, contentHeight);
      const scale = Math.max(minDimension / maxContentDimension, 1);
      
      const finalWidth = Math.round(contentWidth * scale);
      const finalHeight = Math.round(contentHeight * scale);
      
      // Créer un div temporaire aux bonnes dimensions
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'fixed';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      tempDiv.style.width = finalWidth + 'px';
      tempDiv.style.height = finalHeight + 'px';
      tempDiv.style.background = 'white';
      tempDiv.style.overflow = 'hidden';
      document.body.appendChild(tempDiv);
      
      // Cloner le SVG et l'insérer dans le div temporaire
      const svgClone = this.svgElement.cloneNode(true);
      svgClone.style.width = '100%';
      svgClone.style.height = '100%';
      svgClone.style.display = 'block';
      tempDiv.appendChild(svgClone);
      
      // Créer le canvas
      const canvas = document.createElement('canvas');
      canvas.width = finalWidth;
      canvas.height = finalHeight;
      const ctx = canvas.getContext('2d');
      
      // Sérialiser le SVG
      const svgData = new XMLSerializer().serializeToString(svgClone);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      
      // Charger l'image
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = url;
      });
      
      // Dessiner sur le canvas avec fond blanc
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, finalWidth, finalHeight);
      ctx.drawImage(img, 0, 0, finalWidth, finalHeight);
      
      // Nettoyer
      URL.revokeObjectURL(url);
      document.body.removeChild(tempDiv);
      
      // Convertir en PNG et copier
      const pngBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png', 1.0));
      
      if (navigator.clipboard && window.ClipboardItem) {
        const clipboardItem = new ClipboardItem({ 'image/png': pngBlob });
        await navigator.clipboard.write([clipboardItem]);
        this.emit('copy', { success: true, format: 'png' });
        this.showNotification(this.t('Image copied to clipboard!') + ' • ' + this.t('Optimized for Word/PowerPoint'), 'success');
      } else {
        throw new Error('Clipboard API not supported');
      }
    } catch (err) {
      console.error('Failed to copy as PNG:', err);
      this.emit('copy', { success: false, error: err, format: 'png' });
      this.showNotification(this.t('Failed to copy image'), 'error');
    }
  }

  /**
   * Affiche une notification élégante en bas de l'image
   * @param {string} message - Message à afficher
   * @param {string} type - Type: 'success', 'error', 'info' (défaut: 'info')
   * @param {number} duration - Durée en ms (défaut: 4000)
   */
  showNotification(message, type = 'info', duration = 4000) {
    if (!this.notification) return;
    
    // Annuler le timeout précédent
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
    }
    
    // Définir le message et le type
    this.notification.textContent = message;
    this.notification.className = `svg-geo-notification ${type}`;
    
    // Afficher avec animation
    setTimeout(() => this.notification.classList.add('show'), 10);
    
    // Masquer après la durée
    this.notificationTimeout = setTimeout(() => {
      this.notification.classList.remove('show');
    }, duration);
  }

  /**
   * Système d'événements - Écouter un événement
   * @param {string} event - Nom de l'événement
   * @param {function} callback - Fonction de callback
   */
  on(event, callback) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  }

  /**
   * Système d'événements - Se désabonner d'un événement
   * @param {string} event - Nom de l'événement
   * @param {function} callback - Fonction de callback à retirer
   */
  off(event, callback) {
    if (!this.eventListeners[event]) return;
    this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
  }

  /**
   * Système d'événements - Émettre un événement
   * @param {string} event - Nom de l'événement
   * @param {*} data - Données de l'événement
   */
  emit(event, data) {
    if (!this.eventListeners[event]) return;
    this.eventListeners[event].forEach(callback => {
      try {
        callback(data);
      } catch (err) {
        console.error(`Error in event listener for "${event}":`, err);
      }
    });
  }

  /**
   * Ajoute un item personnalisé au menu contextuel
   * @param {Object} item - { label: string, icon?: string }
   */
  addContextMenuItem(item) {
    this.options.contextMenuItems.push(item);
  }

  /**
   * Affiche une description d'élément dans un conteneur externe
   * @param {HTMLElement} element - Élément SVG
   * @param {HTMLElement} container - Conteneur DOM cible
   */
  renderElementDescription(element, container) {
    const data = this._extractElementData(element);
    const html = this._renderElementData(data);
    container.innerHTML = html;
  }

  /**
   * Détruit le viewer et nettoie les ressources
   */
  destroy() {
    // Nettoyer les événements
    if (this.svgContainer) {
      this.svgContainer.removeEventListener('wheel', this._onWheel);
      this.svgContainer.removeEventListener('mousedown', this._onPanStart);
      this.svgContainer.removeEventListener('contextmenu', this._onContextMenu);
    }

    // Sortir du plein écran
    if (this.isFullscreen) {
      this.exitFullscreen();
    }

    if (window.svgGeoViewerInstances) {
      window.svgGeoViewerInstances.delete(this.container.id);
    }
    
    this.container.innerHTML = '';
    this.eventListeners = {};
  }
}

// Export pour utilisation en module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SVGGeoViewer;
}
