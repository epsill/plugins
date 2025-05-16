(function() {
    'use strict';

    Lampa.Platform.tv();
    
    // Список доступных серверов
    var servers = [
        { id: 'server1', name: 'Сервер 1', url: '185.105.117.217:12160' },
        { id: 'server2', name: 'Сервер 2', url: 'my.bylampa.online' },
        { id: 'server3', name: 'Сервер 3', url: 'bylampa.online' }
    ];
    
    var currentSelection = 0; // Текущий выбранный сервер
    var timerInterval;
    var timeLeft = 30; // Таймер 30 секунд
    
    // SVG иконка для кнопки (как в предыдущем коде)
    var icon_server_redirect = '<svg width="256px" height="256px" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">...</svg>';

    // Создаем меню выбора сервера
    function createServerSelectionMenu() {
        var menuHTML = `
            <div id="SERVER_SELECTION" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.9); display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 9999;">
                <div style="color: white; font-size: 24px; margin-bottom: 30px;">
                    Выберите сервер (автовыбор через <span id="SELECTION_TIMER">30</span> сек)
                </div>
        `;
        
        servers.forEach(function(server, index) {
            menuHTML += `
                <button id="${server.id}" 
                        style="margin: 10px; padding: 15px 30px; font-size: 20px; min-width: 300px; 
                               background-color: ${index === 0 ? '#4CAF50' : '#333'}; 
                               color: white; border: none; border-radius: 5px; cursor: pointer;">
                    ${server.name} (${server.url})
                </button>
            `;
        });
        
        menuHTML += `</div>`;
        
        $('body').append(menuHTML);
        
        // Назначаем обработчики для кнопок
        servers.forEach(function(server, index) {
            $('#' + server.id).on('hover:enter hover:click', function() {
                selectServer(index);
            });
        });
        
        // Запускаем таймер
        startSelectionTimer();
        
        // Обработка клавиш
        $(document).on('keydown.serverSelection', function(e) {
            if (e.keyCode === 38 || e.keyCode === 40) { // Вверх/Вниз
                e.preventDefault();
                navigateServers(e.keyCode === 38 ? -1 : 1);
            } else if (e.keyCode === 13) { // Enter
                e.preventDefault();
                selectServer(currentSelection);
            }
        });
    }
    
    // Навигация по серверам
    function navigateServers(direction) {
        // Снимаем выделение с текущего сервера
        $('#' + servers[currentSelection].id).css('background-color', '#333');
        
        currentSelection += direction;
        
        // Проверяем границы
        if (currentSelection < 0) currentSelection = servers.length - 1;
        if (currentSelection >= servers.length) currentSelection = 0;
        
        // Выделяем новый сервер
        $('#' + servers[currentSelection].id).css('background-color', '#4CAF50');
    }
    
    // Выбор сервера
    function selectServer(index) {
        clearInterval(timerInterval);
        var selectedServer = servers[index];
        localStorage.setItem('selectedServer', selectedServer.url);
        window.location.href = location.protocol + '//' + selectedServer.url;
    }
    
    // Таймер автоматического выбора
    function startSelectionTimer() {
        timerInterval = setInterval(function() {
            timeLeft--;
            $('#SELECTION_TIMER').text(timeLeft);
            
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                selectServer(0); // Автоматически выбираем первый сервер
            }
        }, 1000);
    }
    
    // Основная функция инициализации
    function startMe() {
        // Проверяем, был ли уже выбран сервер
        var savedServer = localStorage.getItem('selectedServer');
        
        if (!savedServer) {
            // Если сервер не выбран, показываем меню
            createServerSelectionMenu();
        } else {
            // Иначе добавляем кнопку для смены сервера
            $('#REDIRECT').remove();
            
            var domainBUTT = '<div id="REDIRECT" class="head__action selector redirect-screen">' + icon_server_redirect + '</div>';
            $('#app > div.head > div > div.head__actions').append(domainBUTT);
            $('#REDIRECT').insertAfter('div[class="head__action selector open--settings"]');
            
            $('#REDIRECT').on('hover:enter hover:click hover:touch', function() {
                localStorage.removeItem('selectedServer');
                window.location.reload();
            });
        }
    }
    
    // Запускаем при готовности приложения
    if(window.appready) startMe();
    else {
        Lampa.Listener.follow('app', function(e) {
            if(e.type == 'ready') startMe();
        });
    }
})();
