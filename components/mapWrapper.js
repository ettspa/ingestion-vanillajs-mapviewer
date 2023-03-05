let marker; // A variable called marker is declared with undefined as a value

// Creates a class called MapWrapper
class MapWrapper {

    // The initMap() method is the main method that initializes the map object and sets its properties, including the center, zoom level, minimum zoom, 
    // and maximum bounds. It also loads and creates the base and overlay layers using the loadBaseLayers() and loadOverlays() methods. 
    // Finally, it adds a click event listener on the map object that displays information about the clicked location using the clickInfoDisplay() method.

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
    // The loadBaseLayers() method fetch data from the provided URLs and return promises that resolve to the base and overlay layers objects. 
    // These methods call the createBaseLayerObj() method, which process the fetched data and create an object containing the configured tile layers.

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

    // The loadOverlays() method fetch data from the provided URLs and return promises that resolve to the base and overlay layers objects. 
    // These methods call the createOverlayObj() method, which process the fetched data and create an object containing the configured tile layers.
    static async loadOverlays(overlaysLayerUrl) {
        return await fetch(overlaysLayerUrl)
            .then(response => response.json())
            .then(data => MapWrapper.createOverlayObj(data))
            .catch(error => {
                console.error('error in fetch overlay:', error);
            });
    }

    // The createOverlayObj() method checks the type of each overlay layer and creates either a WMS layer or a GeoJSON layer. 
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

    // The createGeoJsonLayer() method creates a GeoJSON layer with custom point markers and click event listeners for displaying information about the clicked
    // feature.
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

    // The createPane() method creates custom panes for the tile layers based on their z-index.
    static createPane(map, name, zindex) {
        map.createPane(name);
        map.getPane(name).style.zIndex = zindex;
    }

    // The clickInfoDisplay() method creates a marker at the clicked location using the createMarker() method and calls the getData() method 
    // to retrieve information about the clicked location from the active overlay layers. 
    // This method loops through all the active overlay layers and sends a custom event to start the loading animation. 
    // It then retrieves the data using the getData() method and sends another custom event with the retrieved data. 
    // Finally, it sends a custom event to stop the loading animation.
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

    // the createMarker() method creates a marker at the clicked location
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

    // The createActiveOverlays() method retrieves all the active overlay layers from the map object and returns an array of these layers. 
    static createActiveOverlays() {
        const temp = [];
        map.eachLayer(l => {
            if (l.options.type === 'wms') {
                temp.push(l);
            };
        });
        return temp;
    }

        // The getData() method constructs a URL and sends a GET request to retrieve information about the clicked location from the active overlay layer 
    // using the WMS protocol. It then processes the retrieved data and returns it.
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


    // fetchOfGetFeatureInfo sends a HTTP GET request to a given URL with query parameters specified in options. 
    // It first calls MapWrapper.createGetFeatureInfoLink to construct the complete URL with the query parameters, 
    // and then uses the fetch API to send the request. The response from the server is then converted to text using the .text() method, 
    // and the resulting promise is returned. If an error occurs during the fetch operation, the error message is logged to the console using console.error.
    static async fetchOfGetFeatureInfo(url, options) {
        const fetchLink = MapWrapper.createGetFeatureInfoLink(url, options);
        return await fetch(fetchLink)
            .then(response => response.text())
            .catch(error => {
                console.error('error in fetch getFeatureInfo: ', error);
            });
    }

    // createGetFeatureInfoLink takes a URL and an object options as input, and returns the URL with the query parameters specified in options appended to it.
    // The query parameters are constructed by iterating through the key-value pairs in options and concatenating them with = and & characters to form the query string. The resulting URL is then returned.
    static createGetFeatureInfoLink(url, options) {
        for (const option in options) {
            url = url + option + '=' + options[option] + '&';
        };
        return url;
    }
}