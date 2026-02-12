(function() {
    'use strict';
    
    // ОЧИЩАЕМ ВСЕ СТАРЫЕ НАСТРОЙКИ
    Lampa.Storage.set('location_server', '');
    Lampa.Storage.set('server_history', '[]');
    Lampa.Storage.set('const_redirect', false);
    
    Lampa.Noty.show('✅ Настройки плагина сброшены!', {timeout: 3000});
    
    // Перезагружаем страницу
    setTimeout(function() {
        location.reload();
    }, 1000);
})();
