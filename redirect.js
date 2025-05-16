(function() {
    'use strict';

    Lampa.Platform.tv();
    
    var server_protocol = location.protocol === "https:" ? 'https://' : 'http://';
    
    // Увеличенная SVG-иконка (видимый размер)
    var icon_server_redirect = '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M18 12L12 6M18 12L12 18M18 12H6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
        '<circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.5" fill="none"/>' +
        '<circle cx="12" cy="9" r="1" fill="currentColor"/>' +
        '<circle cx="12" cy="12" r="1" fill="currentColor"/>' +
        '<circle cx="12" cy="15" r="1" fill="currentColor"/>' +
        '</svg>';

    function startMe() {
        $('#REDIRECT').remove();
        
        // Контейнер с увеличенными размерами
        var domainBUTT = '<div id="REDIRECT" class="head__action selector redirect-screen" style="width: 36px; height: 36px; margin: 0 5px;">' + 
                         icon_server_redirect + '</div>';
        
        $('.head__actions').append(domainBUTT);
        $('#REDIRECT').insertAfter('.open--settings');
        
        if(!Lampa.Storage.get('location_server')) {
            $('#REDIRECT').remove();
            return;
        }
        
        // Редирект при взаимодействии
        $('#REDIRECT').on('hover:enter hover:click hover:touch', function() {
            window.location.href = server_protocol + Lampa.Storage.get('location_server');
        });
        
        // Остальной код без изменений...
        Lampa.SettingsApi.addComponent({
            component: 'location_redirect',
            name: 'Смена сервера',
            icon: icon_server_redirect
        });
        
        Lampa.SettingsApi.addParam({
            component: 'location_redirect',
            param: {
                name: 'location_server',
                type: 'input',
                placeholder: 'bylampa.online',
                default: ''
            },
            field: {
                name: 'Адрес сервера',
                description: 'Используйте кнопку вверху для перехода'
            },
            onChange: function(value) {
                value ? startMe() : $('#REDIRECT').remove();
            }
        });
        
        Lampa.SettingsApi.addParam({
            component: 'location_redirect',
            param: {
                name: 'const_redirect',
                type: 'trigger',
                default: false
            },
            field: {
                name: 'Авторедирект',
                description: 'Зажмите ВНИЗ при загрузке для отмены'
            }
        });

        if(Lampa.Storage.field('const_redirect')) {
            setTimeout(function() {
                window.location.href = server_protocol + Lampa.Storage.get('location_server');
            }, 300);
        }
    }

    if(window.appready) startMe();
    else Lampa.Listener.follow('app', function(e) {
        if(e.type == 'ready') startMe();
    });
})();
