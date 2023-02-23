let isOpen = false;
let infoToDisplay = [];

class Sidenav {

static toggleSidenav() {
    const div = document.getElementById('sidenav-container');
    const toggleButton = document.getElementById('toggle-button');
    isOpen = !isOpen;
    if (isOpen) {
        Sidenav.removeChildFromSidenav(div);
        div.classList.remove('sidenav-container-closed');
        div.classList.add('sidenav-container-open');
        toggleButton.classList.remove('button-toggle-sidenav-closed');
        toggleButton.classList.add('button-toggle-sidenav-open');
    } else {
        Sidenav.removeChildFromSidenav(div);
        infoToDisplay = [];
        div.classList.remove('sidenav-container-open');
        div.classList.add('sidenav-container-closed');
        toggleButton.classList.remove('button-toggle-sidenav-open');
        toggleButton.classList.add('button-toggle-sidenav-closed');
    };
}

// static displayInfoFromGetFeature(data) {
//     if (data) {
//         const container = document.createElement('div');
//         container.classList.add('div-info-container');
//         infoToDisplay = data;
//         for (const info in infoToDisplay) {
//             const span = document.createElement('span');
//             span.classList.add('span-margin');
//             const textNode = document.createTextNode(info + ': ' + infoToDisplay[info]);
//             span.appendChild(textNode);
//             container.appendChild(span);
//         };
//         const div = document.getElementById('sidenav-container').appendChild(container);
//         console.log('data', infoToDisplay);
//     };
// }

static displayInfoFromGetFeature(data) {
    if (data) {
       const parsedData =  DataParser.parseData(data);
        const container = document.createElement('div');
        container.classList.add('card-container');
        // infoToDisplay = [];  
        // infoToDisplay.push(parsedData);  
        if (parsedData.Value) {
            infoToDisplay = infoToDisplay.filter((e) => e.Value !== parsedData.Value);
            infoToDisplay.push(parsedData);
        } else if (data.platformid) {
            infoToDisplay = infoToDisplay.filter((e) => e.platformid !== parsedData.platformid);
            infoToDisplay.push(parsedData); 
        } else{
            infoToDisplay.push(parsedData);  
        }

        infoToDisplay.forEach(element => {
            const container = document.createElement('div');
                container.classList.add('card-container');
            for (const el in element) {
                const titleContainer = document.createElement('div');
                titleContainer.classList.add('title');
                const title = document.createTextNode(el);
                titleContainer.appendChild(title);

                const valueContainer = document.createElement('div');
                valueContainer.classList.add('value');
                const value = document.createTextNode(element[el]);
                valueContainer.appendChild(value);

                container.appendChild(titleContainer);
                container.appendChild(valueContainer);
            };
            const div = document.getElementById('sidenav-container').appendChild(container);
        });

        console.log('data', infoToDisplay);
    };
}

static removeChildFromSidenav(div) {
    while (div.hasChildNodes()) {
        div.removeChild(div.firstChild);
    }
}
}