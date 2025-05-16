(function() {
    'use strict';
    
    // Создаём тег <script> и загружаем удалённый JS
    var script = document.createElement('script');
    script.src = 'https://levende.github.io/lampa-plugins/lnum.js';
    document.head.appendChild(script);
    
    console.log('Плагин lnum.js загружен и выполнен!');
})();
