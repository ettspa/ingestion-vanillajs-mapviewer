class DataManager {
    static elaborate(type) {
        const parsers = {
            platformParser: PlatformParser.parsePlatform,
            modelParser: ModelParser.parseModel
        };
        return parsers[type];
    }

    static getTimeSeriesData(fetchUrl,type) {
        DataManager.fetchGetTimeSeries(fetchUrl,type);
    }

    static async fetchGetTimeSeries(url,type) {
        return await fetch(url)
            .then(response => response.json())
            .then(async data => {
                if (type === 'geoJson') {
                   const dataset = await DataManager.createDataFromGeoJsonForChart(data.table.rows);
                   const event = new CustomEvent('createChartEvent',{detail: dataset});
                   document.dispatchEvent(event); 
                } else {
                    const dataset = await DataManager.createDataFromWmsForChart(data.table.rows);
                    const event = new CustomEvent('createChartEvent',{detail: dataset});
                    document.dispatchEvent(event);
                }
            })
            .catch(error => {
                console.error('error in fetch getTimeSeries: ', error);
            });
    }

    static async createDataFromGeoJsonForChart(rows) {
        const arrayForData = [];
        rows.forEach(el => {
            if (el[1]) {
                arrayForData.push({ x: new Date(el[0]).getTime(), y: el[1] });
            }
        });
        const data = {
            datasets: [{
                label: 'all data',
                data: arrayForData,
                fill: false,
                borderColor: '#000',
              }]
        }
        return data;
    }

    static async createDataFromWmsForChart(rows) {
        const arrayForData = [];
        rows.forEach(el => {
            if (el[4]) {
                arrayForData.push({ x: new Date(el[0]).getTime(), y: el[4] });
            }
        });
        const data = {
            datasets: [{
                label: 'all data',
                data: arrayForData,
                fill: false,
                borderColor: '#000',
              }]
        }
        return data;
    }
}

class PlatformParser {
    static parsePlatform(data) {
        return {
            platformid: data.platformid,
            platformcode: data.platformcode,
            edmocode: data.edmocode,
            dataowner: data.dataownerdescr,
            time: data.time
        }
    }
}

class ModelParser {
    static parseModel(data) {
        const splittingOnNewLine = data.split('\n');
        const arrayWithoutEmptyString = ModelParser.removeEmptyElementFromArrayOfString(splittingOnNewLine);
        const arrayWithoutFirstElement = ModelParser.removeFirstElementFromArray(arrayWithoutEmptyString);
        const finalModelObj = ModelParser.convertArrayOfStringInFieldsAndValueForModelObj(arrayWithoutFirstElement);
        return {
            layer: finalModelObj.Layer,
            ID: finalModelObj.ID,
            longitude: finalModelObj.Longitude,
            latitude: finalModelObj.Latitude,
            value: finalModelObj.Value
        } 
    }

    static removeEmptyElementFromArrayOfString(array) {
        return array.filter(s => s.trim() !== '');
    }

    static removeFirstElementFromArray(array) {
        return array.filter((e, i) => i !== 0);
    }

    static convertArrayOfStringInFieldsAndValueForModelObj(array) {
        return array.reduce((p, c) => {
            const keyValue = c.split(':');
            p[keyValue[0].trim()] = keyValue[1].trim();
            return p;
        }, {})
    }
}