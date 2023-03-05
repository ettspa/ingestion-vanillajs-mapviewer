class ChartManager {
    
    // This method takes a chart container element and a data object as parameters.
    // It creates a configuration object for the Chart.js library with the provided data, 
    // and initializes a new chart object using the provided container and configuration.
    // It also dispatches an event signaling that the chart has been opened and stops the loading spinner
    static initChart(chartContainer,data) {
        let container = chartContainer;
        let otherContainer;
        if (typeof container === "string") {
            container = document.getElementById(chartContainer);
            otherContainer = document.getElementById('main-chart-container');
        }
        let config = {};
        let chart;
        config = {
            type: 'line',
            data: data,
            default: {
                backgroundColor: '#ffffff'
            },
            options: {
                plugins: {
                    // decimation: {
                    //     enable: true,
                    //     algorithm: 'lttb',
                    //     samples: 500,
                    // }
                    legend:{
                        display:true,
                        position: 'bottom'
                    },
                    title: {
                        display: true,
                        text: 'all data in °C'
                    }
                },
                scales: {
                    x: {
                        title:true,
                        text:'date',
                        type: 'time',
                        ticks: {
                            source: 'auto',
                            // Disabled rotation for performance
                            maxRotation: 0,
                            autoSkip: true,
                        }
                    },
                    y:{
                        title:true,
                        text:'°C'
                    }
                }
            }
        };
        container.style.display = 'flex';
        otherContainer.style.display = 'flex'
        const openChartEvent = new CustomEvent('openChart');
        document.dispatchEvent(openChartEvent);
        chart = new Chart(container, config);
        const stopLoading= new CustomEvent('stopLoading');
        document.dispatchEvent(stopLoading);
        chart.canvas.parentNode.style.height = '300px';
        chart.canvas.parentNode.style.width = '100%';
        return chart;
    }

    // This method simply calls the destroy method on the provided chart object.
    static destroyChart(chart){
        chart.destroy();
    }

    // This method hides the provided chart container element and dispatches an event signaling that the chart has been closed.
    static closeChartDisplayer(chartContainer){
        let container = chartContainer;
        if (typeof container === "string") {
            container = document.getElementById(chartContainer);
            container.style.display = 'none'; 
            const closeChartevent = new CustomEvent('closeChart');
            document.dispatchEvent(closeChartevent);
        }
    }
}