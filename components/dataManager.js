class DataManager {

    // This method takes a type parameter and returns a parsing function based on that type.
    // The types are platformParser and modelParser, and the parsing functions are parsePlatform and parseModel, respectively. 
    // It returns the appropriate parsing function based on the type.
    static elaborate(type) {
        const parsers = {
            platformParser: PlatformParser.parsePlatform,
            modelParser: ModelParser.parseModel
        };
        return parsers[type];
    }

    //This method takes a fetchUrl and type parameter, and it calls fetchGetTimeSeries method with these parameters.
    static getTimeSeriesData(fetchUrl,type) {
        DataManager.fetchGetTimeSeries(fetchUrl,type);
    }

    // This method fetches data from the given url and processes it based on the type parameter.
    // If the type is geoJson, it creates a dataset for chart from geojson data using createDataFromGeoJsonForChart method, 
    // and if the type is not geoJson, it creates a dataset for chart from WMS data using createDataFromWmsForChart method. 
    // After creating the dataset, it dispatches a custom event createChartEvent with the dataset as a detail.
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

    // This method takes an array of rows and creates a dataset for chart from them. 
    // It loops through the rows and adds each data point (if it has a value) to an arrayForData.
    // Then it creates and returns a data object with that arrayForData.
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

    // This method takes an array of rows and creates a dataset for chart from them. 
    // It loops through the rows and adds each data point (if it has a value) to an arrayForData.
    // Then it creates and returns a data object with that arrayForData.
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

// This class contains a static method parsePlatform that takes in an object data as input and returns a 
// new object with a subset of the properties from the input object. 
// The properties included in the output object are platformid, platformcode, edmocode, dataowner, and time.
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

    // This method takes the raw data as an input and converts it into an object with the desired properties.
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

    // This method removes any empty strings from the array and returns a new array without any empty strings.
    static removeEmptyElementFromArrayOfString(array) {
        return array.filter(s => s.trim() !== '');
    }

    // This method removes the first element of the array and returns a new array without the first element.
    static removeFirstElementFromArray(array) {
        return array.filter((e, i) => i !== 0);
    }

    // This method converts the array of strings into an object with specific fields and values.
    static convertArrayOfStringInFieldsAndValueForModelObj(array) {
        return array.reduce((p, c) => {
            const keyValue = c.split(':');
            p[keyValue[0].trim()] = keyValue[1].trim();
            return p;
        }, {})
    }
}