(function () {
    function initializeSVGGeoViewers(root) {
        const scope = root || document;
        const hosts = scope.querySelectorAll('[data-svg-geo-viewer="1"]');

        hosts.forEach((host) => {
            if (host.dataset.svgGeoViewerInitialized === '1') {
                return;
            }

            if (typeof window.SVGGeoViewer === 'undefined') {
                console.error('SVGGeoViewer non disponible pour', host.id);
                host.innerHTML = '<div class="alert alert-danger mb-0">La librairie de visualisation SVG n\'est pas chargée.</div>';
                return;
            }

            const svgUrl = host.dataset.svgUrl;
            if (!svgUrl) {
                host.innerHTML = '<div class="alert alert-danger mb-0">URL SVG manquante.</div>';
                return;
            }

            host.dataset.svgGeoViewerInitialized = '1';

            try {
                const viewer = new window.SVGGeoViewer(host.id, {
                    locale: 'fr',
                    enableModal: true,
                    enableContextMenu: true,
                    enableZoom: true,
                    enablePan: true,
                    showHoverInfo: true,
                });

                viewer.loadSVG(svgUrl).catch((error) => {
                    console.error('Erreur chargement SVG', error);
                    host.innerHTML = '<div class="alert alert-danger mb-0">Impossible de charger le SVG.</div>';
                    delete host.dataset.svgGeoViewerInitialized;
                });
            } catch (error) {
                console.error('Erreur initialisation SVGGeoViewer', error);
                host.innerHTML = '<div class="alert alert-danger mb-0">Impossible d\'initialiser le viewer SVG.</div>';
                delete host.dataset.svgGeoViewerInitialized;
            }
        });
    }

    window.initializeSVGGeoViewers = initializeSVGGeoViewers;

    document.addEventListener('DOMContentLoaded', function () {
        initializeSVGGeoViewers(document);
    });
})();