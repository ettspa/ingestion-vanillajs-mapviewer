class Loader {

   // The "displayLoader" method retrieves the HTML element with an ID of "loader-container" and sets its "display" style to "flex", 
   // effectively displaying the loader on the page.
   static displayLoader(){
    const loader = document.getElementById('loader-container');
    loader.style.display = 'flex';
   }

   //The "hideLoader" method retrieves the same HTML element and sets its "display" style to "none", effectively hiding the loader on the page.
   static hideLoader(){
    const loader = document.getElementById('loader-container');
    loader.style.display = 'none';
   }
}