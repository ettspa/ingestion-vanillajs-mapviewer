class GetFeatureInfo{
    static getFeatureInfo(point, activeOverlays) {

        const featureArray = [];
    
        activeOverlays.forEach(layer => {
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
                options.colorscalerange = layer.wmsParams.min + ',' + layer.wmsParams.max;
            };
    
            featureArray.push({ url: layer._url, options, parser: layer.options.dataParser });
        });
        GetFeatureInfo.fetchOfGetFeatureInfo(featureArray);
    }
    
    static async  fetchOfGetFeatureInfo(featureArray) { 
        featureArray.forEach(async fa => {
            const fetchLink = GetFeatureInfo.createGetFeatureInfoLink(fa.url, fa.options);
            return await fetch(fetchLink)
                .then(response => response.text())
                .then(data => {
                    const parsedData = DataParser.getParser(fa.parser)(data);
                    isOpen = false;
                    Sidenav.toggleSidenav();
                    Sidenav.displayInfoFromGetFeature(parsedData);
                })
                .catch(error => {
                    console.error('error in fetch getFeatureInfo: ', error);
                });
        });
    }
    
    static createGetFeatureInfoLink(url, options) {
        for (const option in options) {
            url = url + option + '=' + options[option] + '&';
        };
        return url;
    }
}