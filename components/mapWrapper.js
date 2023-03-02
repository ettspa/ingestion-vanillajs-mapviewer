let marker;
class MapWrapper {

    static async initMap(baseLayersUrl, overlaysLayerUrl) {

        let mapLimit = L.latLngBounds([-90, -180], [90, 190]);
        const mapOptions = {
            center: new L.LatLng(44.4096, 8.9239),
            minZoom: 2.4,
            zoom: 3.5,
            zoomDelta: 0.5,
            zoomSnap: 0,
            zoomControl: true,
            maxBounds: mapLimit
        };
        map = L.map('map', mapOptions);
        map.zoomControl.setPosition('bottomright');
        const baselayers = await MapWrapper.loadBaseLayers(baseLayersUrl);
        const overlays = await MapWrapper.loadOverlays(overlaysLayerUrl);
        map.on('click', (pos) => MapWrapper.clickInfoDisplay(pos, overlays));
        baselayers['openStreetMap'].addTo(map);
        MapWrapper.createPane(map, 'max', 600);
        MapWrapper.createPane(map, 'mid', 500);
        MapWrapper.createPane(map, 'min', 400);
        L.control.layers(baselayers, overlays).addTo(map);
        return map
    }

    static async loadBaseLayers(baseLayersUrl) {
        return await fetch(baseLayersUrl)
            .then(response => response.json())
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
        }, {});
    }

    static async loadOverlays(overlaysLayerUrl) {
        return await fetch(overlaysLayerUrl)
            .then(response => response.json())
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
        }, {});
    }

    static createGeoJsonLayer(url, params) {
        const geoJSON = L.geoJSON(null, {
            pointToLayer: (f, latlng) => L.circleMarker(latlng, { ...params.pointToLayer, pane: params.pane }),
            onEachFeature: (f, l) => l.on('click', () => {
                const event = new CustomEvent("mapClicked", { detail: { params: params, data: f.properties } });
                document.dispatchEvent(event);
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

    static async clickInfoDisplay(pos) {
        MapWrapper.createMarker(pos.latlng);
        const activeOverlays = MapWrapper.createActiveOverlays();
        activeOverlays.forEach(async overlay => {
            const startLoading = new CustomEvent('startLoading');
            document.dispatchEvent(startLoading);
            const data = await MapWrapper.getData(pos.containerPoint, overlay, map.getBounds(), map.getSize(), map.options.crs);
            const event = new CustomEvent("mapClicked", { detail: { params: overlay.wmsParams, data: data } });
            document.dispatchEvent(event);
            const stopLoading = new CustomEvent('stopLoading');
            document.dispatchEvent(stopLoading);
        });
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

    static getData(point, overlay, bounds, size, crs) {

        const projectionKey = 'srs';

        const nw = crs.project(bounds.getNorthWest());
        const se = crs.project(bounds.getSouthEast());

        let bbox = [nw.x, se.y, se.x, nw.y].join(',');

        const options = {
            width: size.x,
            height: size.y,
            bbox,
            service: 'WMS',
            version: '1.1.1',
            layers: overlay.wmsParams.layers,
            request: 'GetFeatureInfo',
            query_layers: overlay.wmsParams.layers,
            styles: overlay.wmsParams.styles,
            X: Math.round(point.x),
            Y: Math.round(point.y),
            INFO_FORMAT: 'text/plain',
            [projectionKey]: crs.code,
        };

        if (overlay.wmsParams.max) {
            options.max = overlay.wmsParams.max;
            options.min = overlay.wmsParams.min;
            options.palette = overlay.wmsParams.palette;
            options.colorscalerange = overlay.wmsParams.min + ',' + overlay.wmsParams.max;
        };

        return MapWrapper.fetchOfGetFeatureInfo(overlay._url, options);
    }

    static async fetchOfGetFeatureInfo(url, options) {
        const fetchLink = MapWrapper.createGetFeatureInfoLink(url, options);
        return await fetch(fetchLink)
            .then(response => response.text())
            .catch(error => {
                console.error('error in fetch getFeatureInfo: ', error);
            });
    }

    static createGetFeatureInfoLink(url, options) {
        for (const option in options) {
            url = url + option + '=' + options[option] + '&';
        };
        return url;
    }
}