(function() {
    'use strict';
    
    // 1. Получаем текущий список плагинов
    var plugins = Lampa.Storage.get('plugins', '[]');
    
    // 2. Проверяем, не добавлен ли уже этот плагин
    if (!plugins.includes('lnum')) {
        // 3. Создаем и загружаем скрипт плагина
        var script = document.createElement('script');
        script.src = 'https://levende.github.io/lampa-plugins/lnum.js';
        
        script.onload = function() {
            // 4. После загрузки добавляем плагин в список
            plugins.push('lnum');
            Lampa.Storage.set('plugins', plugins);
            
            console.log('Плагин lnum успешно загружен и зарегистрирован!');
            
            // 5. Опционально: перезагружаем страницу для применения плагина
            // Lampa.App.reload();
        };
        
        script.onerror = function() {
            console.error('Ошибка загрузки плагина lnum!');
        };
        
        document.head.appendChild(script);
    } else {
        console.log('Плагин lnum уже зарегистрирован');
    }
})();
