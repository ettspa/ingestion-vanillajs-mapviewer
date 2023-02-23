class PlatformParser {
    static parsePlatform(data) {
        const splicerMinus = '--------------------------------------------';
        const splittingOnMinus = data.split(splicerMinus);
        const arrayWithoutEmptyString = PlatformParser.removeEmptyElementFromArrayOfString(splittingOnMinus);
        const arrayWithoutFirstElement = PlatformParser.removeFirstElementFromArray(arrayWithoutEmptyString);
        const finalPlatformObj = PlatformParser.convertArrayOfStringInFieldsAndValueForPlatformObj(arrayWithoutFirstElement);
        return finalPlatformObj;
    }

    static removeEmptyElementFromArrayOfString(array) {
        return array.filter(s => s.trim() !== '');
    }

    static removeFirstElementFromArray(array) {
        return array.filter((e, i) => i !== 0);
    }

    static convertArrayOfStringInFieldsAndValueForPlatformObj(array) {
        return array.map(el => {
            const elementSplittedOnNewLine = el.split('\n');
            const elementWithoutEmptyStrings = PlatformParser.removeEmptyElementFromArrayOfString(elementSplittedOnNewLine);
            const platformObjFromElement = elementWithoutEmptyStrings.reduce((p, c) => {
                const keyValue = c.split('=');
                p[keyValue[0]] = keyValue[1];
                return p;
            }, {});
            return platformObjFromElement;
        });
    }
}