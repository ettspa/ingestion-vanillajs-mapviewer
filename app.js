
let map;

let chart; // Declare a variable named "chart" without assigning any value to it.

// Call the "initMap" method of the "MapWrapper" object, passing in the URLs of the base map and overlays as arguments.
// The "await" keyword is used to wait for the "initMap" method to finish before proceeding.
async function initApp() {
    map = await MapWrapper.initMap('./assets/layers/base-map.json', './assets/layers/overlays.json');
}


// Add an event listener for when the map is clicked.
// When the event occurs, extract the relevant data from the event object ("e").
// Use the "DataManager.elaborate" method to parse and process the data, then display it using the "Sidenav.displayData" method.
document.addEventListener('mapClicked', e => {
    const detail = e.detail;
    const parsedData = DataManager.elaborate(detail.params.dataParser)(detail.data);
    Sidenav.displayData(parsedData, detail.params.dataUrl, detail.params.type);

});


// Add an event listener for when the sidenav is opened.
// When the event occurs, resize the map using the "map.invalidateSize" method.
document.addEventListener('openSidenav', e => {
    map.invalidateSize()
})

// Add an event listener for when the sidenav is closed.
// When the event occurs, resize the map using the "map.invalidateSize" method.
document.addEventListener('closeSidenav', e => {
    map.invalidateSize()

})

// Add an event listener for when both the chart and sidenav are closed.
// When the event occurs, close the chart using the "ChartManager.closeChartDisplayer" method.
// Close the sidenav using the "Sidenav.closeSidenav" method.
// Resize the map using the "map.invalidateSize" method.
document.addEventListener('closeChartAndSidenav', e => {
    ChartManager.closeChartDisplayer('main-chart-container');
    Sidenav.closeSidenav();
    map.invalidateSize()

})

// Add an event listener for when the chart is opened.
// When the event occurs, adjust the position of the sidenav toggle button using the "tooglebuttonSidenav.style.bottom" property.
// Resize the map using the "map.invalidateSize" method.
document.addEventListener('openChart', e => {
    const tooglebuttonSidenav = document.getElementById('toggle-button');
    tooglebuttonSidenav.style.bottom = '312px';
    map.invalidateSize()
})

// Add an event listener for when the chart is closed.
// When the event occurs, adjust the position of the sidenav toggle button using the "tooglebuttonSidenav.style.bottom" property.
// Resize the map using the "map.invalidateSize" method.
document.addEventListener('closeChart', e => {
    const tooglebuttonSidenav = document.getElementById('toggle-button');
    tooglebuttonSidenav.style.bottom = '12px';
    map.invalidateSize()

})

// Add an event listener for when the plot button is clicked.
// When the event occurs, extract the relevant data from the event object ("e").
// Use the "DataManager.getTimeSeriesData" method to retrieve the time series data.
document.addEventListener('plotButtonClicked', e => {
    const detail = e.detail;
    DataManager.getTimeSeriesData(detail.url, detail.type);

})


// This event listener listens for a 'createChartEvent' event and executes the callback function when the event is triggered. 
//The function retrieves the detail object from the event object, and checks if the chart variable is truthy. 
//If so, it calls the destroyChart method of the ChartManager object to destroy the current chart, and sets the chart variable to null. 
//Then, it calls the initChart method of the ChartManager object to initialize a new chart with the specified detail object and assigns it to 
//the chart variable.
document.addEventListener('createChartEvent', e => {
    const detail = e.detail;
    if (chart) {
        ChartManager.destroyChart(chart);
        chart = null;
    }
    chart = ChartManager.initChart('chart', detail);
})

// This event listener listens for a 'startLoading' event and executes the callback function when the event is triggered. 
//The function calls the displayLoader method of the Loader object to display the loading indicator.
document.addEventListener('startLoading', e => {
    Loader.displayLoader();
});


//This event listener listens for a 'stopLoading' event and executes the callback function when the event is triggered. 
//The function calls the hideLoader method of the Loader object to hide the loading indicator.
document.addEventListener('stopLoading', e => {
    Loader.hideLoader();
});


//This asynchronous function initializes the map variable by calling the initMap method of the MapWrapper object with two arguments: 
//the path to the base map JSON file and the path to the overlays JSON file. It is called when the script is loaded.
initApp()