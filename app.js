let baselayers = []
let map;
let marker;

async function initMap() {
    const mapOptions = {
        center: new L.LatLng(44.4096, 8.9239),
        minZoom: 2.4,
        zoom: 3.5,
        zoomDelta: 0.5,
        zoomSnap: 0,
    }
    map = L.map('map', mapOptions);
    const baselayers = await loadBaseLayers();
    const overlays = await loadOverlays();
    map.on('click', (pos) => clickInfoDisplay(pos, overlays))
    baselayers['openStreetMap'].addTo(map);
    createPane(map, 'max', 600);
    createPane(map, 'mid', 500);
    createPane(map, 'min', 400);
    L.control.layers(baselayers, overlays).addTo(map);

}

async function loadBaseLayers() {
    return await fetch('base-map.json')
        .then(response => response.json())
        .then(data => createBaseLayerObj(data))
        .catch(error => {
            console.error('error in fetch base layer:', error);
        });
}

function createBaseLayerObj(data) {
    return data.reduce((p, c) => {
        p[c.name] = L.tileLayer(c.url, {
            attribution: c.attribution
        });
        return p;
    }, {})
}

async function loadOverlays() {
    return await fetch('overlays.json')
        .then(response => response.json())
        .then(data => createOverlayObj(data))
        .catch(error => {
            console.error('error in fetch overlay:', error);
        });
}

function createOverlayObj(data) {
    return data.reduce((p, c) => {
        p[c.name] = L.tileLayer.wms(c.url, c.params);
        return p;
    }, {})
}

function createPane(map, name, zindex) {
    map.createPane(name);
    map.getPane(name).style.zIndex = zindex;
}

function clickInfoDisplay(pos, overlays) {
    createMarker(pos.latlng);
    console.log('map',map);
    const activeOverlays = createActiveOverlays(overlays)
    console.log(activeOverlays);
    getFeatureInfo(pos.containerPoint,activeOverlays)
}

function createMarker(latlng) {
    const markerOptions = {
        radius: 8,
        color: '#fff',
        weight: 2,
        fillColor: '#fff',
        fillOpacity: 0.5,
    };

    if (marker) {
        map.removeLayer(marker);
        marker = L.circleMarker(latlng, markerOptions).addTo(map);
    } else {
        marker = L.circleMarker(latlng, markerOptions).addTo(map);
    };
}

function createActiveOverlays(overlays) {
    const tempArray = [];
    for (const overlay in overlays) {
        if (Object.hasOwnProperty.call(overlays, overlay)) {
            const element = overlays[overlay];
            if (element._mapToAdd) {
                tempArray.push(element);
            }
        }
    }
    return tempArray;
}

function getFeatureInfo(point, activeOverlays) {

    const featureArray = [];

    activeOverlays.forEach(layer => {   
        console.log('layers',layer);
        const bounds = map.getBounds();
      const size = map.getSize();
      const wmsVersion = 1.1;
      const crs = map.options.crs;
      const projectionKey = wmsVersion >= 1.3 ? 'crs' : 'srs';
      const nw = crs.project(bounds.getNorthWest());

      const se = crs.project(bounds.getSouthEast());
      let bbox;

      if (wmsVersion >= 1.3 && crs === L.CRS.EPSG4326) {
        bbox = [se.y, nw.x, nw.y, se.x].join(',');
      } else {
        bbox = [nw.x, se.y, se.x, nw.y].join(',');
      };

     const options = {
        width: size.x,
        height: size.y,
        bbox,
        service: 'WMS',
        version: '1.1.1',
        layers: layer.wmsParams.layers,
        request: 'GetFeatureInfo',
        query_layers: layer.wmsParams.layers,
        styles: layer.wmsParams.styles,
        X: Math.round(point.x),
        Y: Math.round(point.y),
        INFO_FORMAT: 'text/plain',
        
        [projectionKey]: crs.code,
      };

      if (layer.wmsParams.max) {
        options.max = layer.wmsParams.max;
        options.min = layer.wmsParams.min;
        options.palette = layer.wmsParams.palette;
        options.colorscalerange= layer.wmsParams.min + ',' + layer.wmsParams.max;
      }

      featureArray.push({url:layer._url, options});
    });
    console.log(featureArray);
    fetchOfGetFeatureInfo(featureArray);
}

async function fetchOfGetFeatureInfo(featureArray) {
    featureArray.forEach(async fa => {
        const fetchLink = createGetFeatureInfoLink(fa.url,fa.options);
        return await fetch(fetchLink)
        .then(response => response.text())
        .then(data => console.log('data',data))
        .catch(error => {
            console.error('error in fetch overlay:', error);
        });
    });
}
 
function createGetFeatureInfoLink(url, options) {
    for (const option in options) {
        if (Object.hasOwnProperty.call(options, option)) {
            const element = options[option];
            url = url + option + '=' + element + '&';
        }
    }
    console.log(url);
    return url;
}

initMap();