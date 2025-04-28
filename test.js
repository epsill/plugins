function startMe() {
    $('#REDIRECT').remove();

    var domainSVG = icon_server_redirect;
    var domainBUTT = '<div id="REDIRECT" class="head__action selector redirect-screen">' + domainSVG + '</div>';

    $('#app > div.head > div > div.head__actions').append(domainBUTT);
    $('#REDIRECT').insertAfter('div[class="head__action selector open--settings"]');

    // Установите адрес сервера по умолчанию
    var defaultServer = 'http://my.bylampa.online';
    
    // Если значение location_server не установлено, используйте адрес по умолчанию
    if (!Lampa.Storage.get('location_server')) {
        Lampa.Storage.set('location_server', defaultServer);
    }

    $('#REDIRECT').on('hover:enter hover:click hover:touch', function() {
        window.location.href = server_protocol + Lampa.Storage.get('location_server');
    });
}

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
        placeholder: 'Например: lampa.surge.sh',
        default: defaultServer // Установите значение по умолчанию
    },
    field: {
        name: 'Адрес сервера',
        description: 'Нажмите для ввода, смену сервера можно будет сделать кнопкой в верхнем баре'
    },
    onChange: function(value) {
        if (value == '') {
            $('#REDIRECT').remove();
        }
        if (value !== '') {
            startMe();
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
        description: 'Внимание!!! Если вы включите этот параметр, вернуться на старый сервер сможете только сбросом плагинов или отключением этого плагина через CUB'
    },
});

if (Lampa.Storage.field('const_redirect') == true) {
   window.location.href = server_protocol + Lampa.Storage.get('location_server');
}

// Автоматическое перенаправление на адрес по умолчанию
window.location.href = server_protocol + Lampa.Storage.get('location_server');

if (window.appready) startMe();
else {
   Lampa.Listener.follow('app', function(e) {
       if (e.type == 'ready') {
           startMe();
       }
   });
}