let chart;
let map;

async function initApp() {
    map = await MapWrapper.initMap('./assets/layers/base-map.json','./assets/layers/overlays.json');
}

document.addEventListener('mapClicked', e => {
    const detail = e.detail
    const parsedData = DataManager.elaborate(detail.params.dataParser)(detail.data);
    Sidenav.displayData(parsedData, detail.params.dataUrl, detail.params.type);
});

document.addEventListener('openSidenav', e => {
    map.invalidateSize()
})

document.addEventListener('closeSidenav', e => {
    map.invalidateSize()
})

document.addEventListener('closeChartAndSidenav', e => {
    ChartManager.closeChartDisplayer('main-chart-container');
    Sidenav.closeSidenav();
    map.invalidateSize()
})

document.addEventListener('openChart', e => {
    const tooglebuttonSidenav = document.getElementById('toggle-button');
    tooglebuttonSidenav.style.bottom = '312px';
    map.invalidateSize()
})

document.addEventListener('closeChart', e => {
    const tooglebuttonSidenav = document.getElementById('toggle-button');
    tooglebuttonSidenav.style.bottom = '12px';
    map.invalidateSize()
})

document.addEventListener('plotButtonClicked', e => {
    const detail = e.detail;
    DataManager.getTimeSeriesData(detail.url,detail.type);
});

document.addEventListener('createChartEvent', e => {
    const detail = e.detail;
    if (chart) {
        ChartManager.destroyChart(chart);
        chart = null;
    }
    chart = ChartManager.initChart('chart',detail);
})

document.addEventListener('startLoading', e => {
    Loader.displayLoader();
});

document.addEventListener('stopLoading', e => {
    Loader.hideLoader();
});

initApp()