(function() {
    'use strict';

    const TARGET_SERVER = Lampa.Storage.get('location_server') || 'my.bylampa.online';
    
    // 1. Перехват fetch
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
        url = String(url).replace(/bylampa\.online|my\.bylampa\.online/g, TARGET_SERVER);
        return originalFetch.call(this, url, options);
    };
    
    // 2. Перехват XHR
    const XHR = XMLHttpRequest.prototype;
    const originalOpen = XHR.open;
    XHR.open = function(method, url) {
        url = String(url).replace(/bylampa\.online|my\.bylampa\.online/g, TARGET_SERVER);
        return originalOpen.call(this, method, url);
    };
    
    // 3. Перехват DOM элементов
    new MutationObserver((mutations) => {
        mutations.forEach(m => {
            m.addedNodes.forEach(node => {
                if (node.src) node.src = String(node.src).replace(/bylampa\.online|my\.bylampa\.online/g, TARGET_SERVER);
                if (node.href) node.href = String(node.href).replace(/bylampa\.online|my\.bylampa\.online/g, TARGET_SERVER);
            });
        });
    }).observe(document, {childList: true, subtree: true});
    
    // 4. Кнопка смены сервера
    function addButton() {
        $('#SERVER_SWITCHER').remove();
        $('.head__actions').append('<div id="SERVER_SWITCHER" class="head__action selector">🌐</div>');
        
        $('#SERVER_SWITCHER').on('click', function() {
            const newServer = TARGET_SERVER === 'my.bylampa.online' ? 'bylampa.online' : 'my.bylampa.online';
            Lampa.Storage.set('location_server', newServer);
            Lampa.Noty.show('Сервер изменен на: ' + newServer);
            location.reload();
        });
    }
    
    Lampa.Listener.follow('app', addButton);
    
})();
