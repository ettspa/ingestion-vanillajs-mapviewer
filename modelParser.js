class ModelParser {
    static parseModel(data) {
        const splittingOnNewLine = data.split('\n');
        const arrayWithoutEmptyString = ModelParser.removeEmptyElementFromArrayOfString(splittingOnNewLine);
        const arrayWithoutFirstElement = ModelParser.removeFirstElementFromArray(arrayWithoutEmptyString);
        const finalModelObj = ModelParser.convertArrayOfStringInFieldsAndValueForModelObj(arrayWithoutFirstElement);
        return finalModelObj;
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