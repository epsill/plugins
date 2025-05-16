(function() {
    'use strict';

    Lampa.Platform.tv();
    
    var server_protocol = location.protocol === "https:" ? 'https://' : 'http://';
    
    // Стильная SVG-иконка для редиректа (ES5-совместимый синтаксис)
    var icon_server_redirect = '<svg width="256" height="256" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M18 12L12 6M18 12L12 18M18 12H6" ' +
              'stroke="currentColor" ' +
              'stroke-width="1.8" ' +
              'stroke-linecap="round" ' +
              'stroke-linejoin="round"/>' +
        '<circle cx="12" cy="12" r="3.5" ' +
                'stroke="currentColor" ' +
                'stroke-width="1.3" ' +
                'fill="none"/>' +
        '<circle cx="12" cy="9.5" r="1" fill="currentColor"/>' +
        '<circle cx="12" cy="12.5" r="1" fill="currentColor"/>' +
        '<circle cx="12" cy="15.5" r="1" fill="currentColor"/>' +
    '</svg>';

    function startMe() {
        $('#REDIRECT').remove();
        
        var domainBUTT = '<div id="REDIRECT" class="head__action selector redirect-screen" ' +
                         'style="transition: all 0.25s ease; opacity: 0.9;">' +
                            icon_server_redirect +
                         '</div>';
        
        $('#app > div.head > div > div.head__actions').append(domainBUTT);
        $('#REDIRECT').insertAfter('div[class="head__action selector open--settings"]');
           
        if(!Lampa.Storage.get('location_server')) {
            setTimeout(function() {
                $('#REDIRECT').remove();
            }, 10);
        }
        
        // Плавные hover-эффекты
        $('#REDIRECT')
            .on('mouseenter', function() {
                $(this).css({
                    'transform': 'scale(1.15)',
                    'opacity': '1',
                    'filter': 'drop-shadow(0 0 8px rgba(100, 149, 237, 0.8))'
                });
            })
            .on('mouseleave', function() {
                $(this).css({
                    'transform': 'scale(1)',
                    'opacity': '0.9',
                    'filter': 'none'
                });
            })
            .on('hover:enter hover:click hover:touch', function() {
                var $this = $(this);
                $this.css('transform', 'scale(0.95)');
                setTimeout(function() {
                    window.location.href = server_protocol + Lampa.Storage.get('location_server');
                }, 200);
            });
     
        // Настройки в интерфейсе
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
                values: '',
                placeholder: 'Например: bylampa.online',
                default: 'my.bylampa.online'
            },
            field: {
                name: 'Адрес сервера',
                description: 'Нажмите для ввода, смену сервера можно сделать кнопкой в верхнем баре'
            },
            onChange: function(value) {
                if (value === '') {
                    $('#REDIRECT').remove();
                } else {
                    if (!$('#REDIRECT').length) startMe();
                }
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
                name: 'Постоянный редирект',
                description: 'Чтобы отключить, зажмите клавишу ВНИЗ при загрузке' 
            }
        });

        // Отключение постоянного редиректа
        Lampa.Keypad.listener.follow("keydown", function(e) {
            if (e.code === 40 || e.code === 29461) {
                Lampa.Storage.set('const_redirect', false);
            } 
        });

        // Автоматический редирект если включен
        setTimeout(function() {
            if (Lampa.Storage.field('const_redirect') === true) {
                window.location.href = server_protocol + Lampa.Storage.get('location_server');
            }
        }, 300);
    }
    
    // Запуск
    if (window.appready) {
        startMe();
    } else {
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') {
                startMe();
            }
        });
    }
})();
