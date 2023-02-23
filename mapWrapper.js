let marker;
class MapWrapper {

    static async initMap() {
        const mapOptions = {
            center: new L.LatLng(44.4096, 8.9239),
            minZoom: 2.4,
            zoom: 3.5,
            zoomDelta: 0.5,
            zoomSnap: 0,
            zoomControl: true
        };
        map = L.map('map', mapOptions);
        map.zoomControl.setPosition('bottomright');
        const baselayers = await MapWrapper.loadBaseLayers();
        const overlays = await MapWrapper.loadOverlays();
        map.on('click', (pos) => MapWrapper.clickInfoDisplay(pos, overlays));
        baselayers['openStreetMap'].addTo(map);
        MapWrapper.createPane(map, 'max', 600);
        MapWrapper.createPane(map, 'mid', 500);
        MapWrapper.createPane(map, 'min', 400);
        L.control.layers(baselayers, overlays).addTo(map);
    }

    static async loadBaseLayers() {
        return await fetch('base-map.json')
            .then(featureArrayponse => featureArrayponse.json())
            .then(data => MapWrapper.createBaseLayerObj(data))
            .catch(error => {
                console.error('error in fetch base layer:', error);
            });
    }

    static createBaseLayerObj(data) {
        return data.reduce((p, c) => {
            p[c.name] = L.tileLayer(c.url, {
                attribution: c.attribution
            });
            return p;
        }, {})
    }

    static async loadOverlays() {
        return await fetch('overlays.json')
            .then(featureArrayponse => featureArrayponse.json())
            .then(data => MapWrapper.createOverlayObj(data))
            .catch(error => {
                console.error('error in fetch overlay:', error);
            });
    }

    static createOverlayObj(data) {
        return data.reduce((p, c) => {
            if (c.params.type === 'wms') {
                p[c.name] = L.tileLayer.wms(c.url, c.params);
            } else if (c.params.type === 'geoJson') {
                p[c.name] = MapWrapper.createGeoJsonLayer(c.url, c.params);
            };
            return p;
        }, {})
    }

    static createGeoJsonLayer(url, params) {
        const geoJSON = L.geoJSON(null, {
            pointToLayer: (f, latlng) => L.circleMarker(latlng, { ...params.pointToLayer, pane: params.pane }),
            onEachFeature: (f, l) => l.on('click', () => {
                isOpen = false;
                Sidenav.toggleSidenav();
                Sidenav.displayInfoFromGetFeature(f.properties);
            }),
        });
        geoJSON.on('add', () => {
            fetch(url)
                .then(res => res.json())
                .then(data => geoJSON.addData(data))
                .catch(error => {
                    console.error('error in add geoJSON data:', error);
                });
        });
        return geoJSON;
    }

    static createPane(map, name, zindex) {
        map.createPane(name);
        map.getPane(name).style.zIndex = zindex;
    }

    static clickInfoDisplay(pos) {
        MapWrapper.createMarker(pos.latlng);
        const activeOverlays = MapWrapper.createActiveOverlays();
        GetFeatureInfo.getFeatureInfo(pos.containerPoint, activeOverlays);
    }

    static createMarker(latlng) {
        const markerOptions = {
            radius: 8,
            color: '#fff',
            weight: 2,
            fillColor: '#fff',
            fillOpacity: 0.5,
            pane: 'max',
        };
        if (marker) {
            map.removeLayer(marker);
            marker = L.circleMarker(latlng, markerOptions).addTo(map);
        } else {
            marker = L.circleMarker(latlng, markerOptions).addTo(map);
        };
    }

    static createActiveOverlays() {
        const temp = [];
        map.eachLayer(l => {
            if (l.options.type === 'wms') {
                temp.push(l);
            };
        });
        return temp;
    }
}