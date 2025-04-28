(function() {
    const serverProtocol = 'http://'; // Замените на нужный протокол (http или https)
    const iconServerRedirect = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm1-13h-2v6h2V7zm0 8h-2v2h2v-2z" fill="currentColor"/>
        </svg>`;
    
    function startMe() {
        $('#REDIRECT').remove();

        const domainButton = `
            <div id="REDIRECT" class="head__action selector redirect-screen">
                ${iconServerRedirect}
            </div>`;
        
        $('#app > div.head > div > div.head__actions').append(domainButton);
        $('#REDIRECT').insertAfter('div[class="head__action selector open--settings"]');

        if (!Lampa.Storage.get('location_server')) {
            setTimeout(() => {
                $('#REDIRECT').remove();
            }, 10);
        }

        $('#REDIRECT').on('hover:enter hover:click hover:touch', function() {
            const serverLocation = Lampa.Storage.get('location_server');
            if (serverLocation) {
                window.location.href = serverProtocol + serverLocation;
            } else {
                alert('Сервер не указан! Пожалуйста, введите адрес сервера в настройках.');
            }
        });

        Lampa.SettingsApi.addComponent({
            component: 'location_redirect',
            name: 'Смена сервера',
            icon: iconServerRedirect
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
                description: 'Нажмите для ввода, смену сервера можно будет сделать кнопкой в верхнем баре'
            },
            onChange: function(value) {
                if (value === '') {
                    $('#REDIRECT').remove();
                    alert('Адрес сервера удален.');
                } else {
                    startMe();
                    alert('Адрес сервера обновлен.');
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
                description: 'Чтобы отключить постоянный редирект зажмите клавишу ВНИЗ при загрузке приложения'
            }
        });

        Lampa.Keypad.listener.follow("keydown", function(e) {
            if (e.code === 40 || e.code === 29461) { // Код клавиши "вниз"
                Lampa.Storage.set('const_redirect', false);
                alert('Постоянный редирект отключен.');
            }
        });

        setTimeout(() => {
            if (Lampa.Storage.field('const_redirect') === true) {
                const serverLocation = Lampa.Storage.get('location_server');
                if (serverLocation) {
                    window.location.href = serverProtocol + serverLocation;
                } else {
                    alert('Не удалось выполнить редирект! Сервер не указан.');
                }
            }
        }, 300);
    }

    if (window.appready) startMe();
    else {
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') {
                startMe();
            }
        });
    }
})();
