class ChartManager {
    
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

    static destroyChart(chart){
        chart.destroy();
    }

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