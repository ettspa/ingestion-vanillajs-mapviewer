class Loader {
   static displayLoader(){
    const loader = document.getElementById('loader-container');
    loader.style.display = 'flex';
   }

   static hideLoader(){
    const loader = document.getElementById('loader-container');
    loader.style.display = 'none';
   }
}