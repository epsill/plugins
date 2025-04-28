(function() {
    const serverProtocol = 'http://'; // Замените на нужный протокол (http или https)
    const iconServerRedirect = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
            <g>
                <path d="M13.4142 20.25 13 20.25V21.75ZM3.17157 19.8284L3.7019 19.2981H3.7019L3.17157 19.8284ZM20.8284 4.17157L20.2981 4.7019V4.7019L20.8284 4.17157ZM21.25 13C21.25 13.4142 21.5858 13.75 22 13.75C22.4142 13.75 22.75 13.4142 22.75 13H21.25ZM10 3.75H14V2.25H10V3.75ZM2.75 13V12H1.25V13H2.75ZM2.75 12V11H1.25V12H2.75ZM13 20.25H10V21.75H13V20.25ZM21.25 11V12H22.75V11H21.25ZM1.25 13C1.25 14.8644 1.24841 16.3382 1.40313 17.489C1.56076 18.6614 1.89288 19.6104 2.64124 20.3588L3.7019 19.2981C3.27869 18.8749 3.02502 18.2952 2.88976 17.2892C2...." fill="currentColor"></path>
                <path d="M13 .5L18 .5" stroke="#ffffff" stroke-width="1" stroke-linecap="round"></path>
                <path d="M6 .5L6 .5" stroke="#ffffff" stroke-width="1" stroke-linecap="round"></path>
                <path d="M6 .5L6 .5" stroke="#ffffff" stroke-width="1" stroke-linecap="round"></path>
                <path d="M9 .5L9 .5" stroke="#ffffff" stroke-width="1" stroke-linecap="round"></path>
                <path d="M9 .5L9 .5" stroke="#ffffff" stroke-width="1" stroke-linecap="round"></path>
                <path d="M15 .5H14V17Z"></path>
                <!-- Добавьте остальные пути вашего SVG здесь -->
            </g>
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
