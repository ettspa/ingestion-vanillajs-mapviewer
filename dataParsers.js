class DataParser {
    static getParser(type) {
        const parsers = {
            platformParser: PlatformParser.parsePlatform,
            modelParser: ModelParser.parseModel
        };
        return parsers[type];
    }
    static parseData (data) {
        console.log('data',data);
        if (data.Layer) {
           return {
            layer: data.Layer,
            ID: data.ID,
            longitude: data.Longitude,
            latitude: data.Latitude,
            value: data.Value
        } 
        } else if (data.platformcode) {
            return{
                platformid: data.platformid,
                platformcode: data.platformcode,
                edmocode: data.edmocode,
                dataowner: data.dataownerdescr,
                time: data.time
            }
        }
        
    }
}