(function () {
    'use strict';
    
    // Получаем список плагинов из хранилища Lampa
    var plugins = Lampa.Storage.get('plugins', '[]');
    
    // Перебираем все плагины
    plugins.forEach(function(plug) {
        if (plug.url && typeof plug.url === 'string') {
            // Заменяем старые версии URL на новый
            plug.url = plug.url
                .replace('http://old-site.example.com/lnum.js', 'https://levende.github.io/lampa-plugins/lnum.js')
                .replace('https://old-site.example.com/lnum.js', 'https://levende.github.io/lampa-plugins/lnum.js');
        }
    });
    
    // Сохраняем обновлённый список плагинов
    Lampa.Storage.set('plugins', plugins);
    
    // Опционально: загружаем новый скрипт (если нужно)
    // $.getScript('https://levende.github.io/lampa-plugins/lnum.js');
})();
