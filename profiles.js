(function() {
    'use strict';

    Lampa.Platform.tv();
    
    var server_protocol = location.protocol === "https:" ? 'https://' : 'http://';
    
    // Крупная SVG-иконка с "70%" (размер увеличен на 30%)
    var icon_server_redirect = '<svg width="332" height="332" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" stroke-width="1.5"/>' +
        '<text x="12" y="16" font-family="Arial" font-size="10" font-weight="bold" text-anchor="middle" fill="currentColor">70%</text>' +
        '</svg>';

    function startMe() {
        $('#REDIRECT').remove();
        
        var domainBUTT = '<div id="REDIRECT" class="head__action selector redirect-screen" ' +
                         'style="width: 38px; height: 38px; transition: all 0.2s ease;">' +
                            icon_server_redirect +
                         '</div>';
        
        $('#app > div.head > div > div.head__actions').append(domainBUTT);
        $('#REDIRECT').insertAfter('div[class="head__action selector open--settings"]');
           
        if(!Lampa.Storage.get('location_server')) {
            setTimeout(function() {
                $('#REDIRECT').remove();
            }, 10);
        }
        
        // Увеличение при фокусе (для TV)
        $('#REDIRECT')
            .on('hover:enter', function() {
                $(this).css({
                    'transform': 'scale(1.3)',
                    'filter': 'drop-shadow(0 0 6px rgba(0, 150, 255, 0.7))'
                });
            })
            .on('hover:leave', function() {
                $(this).css({
                    'transform': 'scale(1)',
                    'filter': 'none'
                });
            })
            .on('hover:click hover:touch', function() {
                window.location.href = server_protocol + Lampa.Storage.get('location_server');
            });
     
        // Настройки
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
                default: ''
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

        Lampa.Keypad.listener.follow("keydown", function(e) {
            if (e.code === 40 || e.code === 29461) {
                Lampa.Storage.set('const_redirect', false);
            } 
        });

        setTimeout(function() {
            if (Lampa.Storage.field('const_redirect') === true) {
                window.location.href = server_protocol + Lampa.Storage.get('location_server');
            }
        }, 300);
    }
    
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
