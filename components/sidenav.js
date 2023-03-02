class Sidenav {

    static toggleSidenav() {
        const div = document.getElementById('sidenav-container');
        if (div.style.display === 'none' || !div.style.display) {
            Sidenav.openSidenav();
        } else {
            Sidenav.closeSidenav();
        };
    }

    static openSidenav() {
        const openSidenavEvent = new CustomEvent('openSidenav');
        document.dispatchEvent(openSidenavEvent);
        const div = document.getElementById('sidenav-container');
        const toggleButton = document.getElementById('toggle-button');
        div.style.display = 'flex';
        toggleButton.classList.remove('button-toggle-sidenav-closed');
        toggleButton.classList.add('button-toggle-sidenav-open');
        
    }

    static closeSidenav() {
        const closeSidenavEvent = new CustomEvent('closeSidenav');
        document.dispatchEvent(closeSidenavEvent);
        const div = document.getElementById('sidenav-container');
        const toggleButton = document.getElementById('toggle-button');
        div.style.display = 'none';
        toggleButton.classList.remove('button-toggle-sidenav-open');
        toggleButton.classList.add('button-toggle-sidenav-closed');
    }

    static displayData(data, dataUrl, type) {
        const div = document.getElementById('data-container');
        Sidenav.openSidenav();
        const cardContainer = document.createElement('div');
        cardContainer.classList.add('card-container');
        cardContainer.innerHTML = Sidenav.createDataHTML(data);
        const button = Sidenav.createPlotButton();
        const finalDataUrl = Sidenav.selectorCreateUrl(dataUrl, data);
        button.addEventListener('click', () => {
            const event = new CustomEvent('plotButtonClicked',{detail: {url: finalDataUrl, type: type}});
            document.dispatchEvent(event);
            const startLoading = new CustomEvent('startLoading');
            document.dispatchEvent(startLoading);
        });
        cardContainer.appendChild(button);
        div.appendChild(cardContainer) ;
    }

    static createDataHTML(data) {
        return Object.keys(data).map(k => `<div class='title'>${k}</div><div class='value'>${data[k]}</div>`).join('');
    }

    static createPlotButton(){
        const plotButton = document.createElement('button');
        const textButton = document.createTextNode('Open Plot');
        plotButton.classList.add('sidenav-button');
        plotButton.appendChild(textButton);
        return plotButton;
    }

    static clearData(){
        const div = document.getElementById('data-container');
        const closeChartevent = new CustomEvent('closeChart');
        const closeSidenavevent = new CustomEvent('closeChartAndSidenav');
        document.dispatchEvent(closeChartevent);
        document.dispatchEvent(closeSidenavevent);
        div.innerHTML = '';
    }

    static selectorCreateUrl(dataUrl,data){
        if (dataUrl.includes('(LAT)')) {
           return Sidenav.createDataUrlForWms(dataUrl, data);
        } else{
           return Sidenav.createDataUrlForGeoJson(dataUrl, data);
        }
    }

    static createDataUrlForWms(dataUrl, data){
        const replaceLat = dataUrl.replaceAll('LAT',data.latitude);
        const finalUrl = replaceLat.replaceAll('LNG', data.longitude)
        return finalUrl
    }

    static createDataUrlForGeoJson(dataUrl, data){
        dataUrl = dataUrl + '"' + data.platformid + '"&time>=2023-01-26T09:10:00Z&depth=1&distinct()';
        return dataUrl
    }
}