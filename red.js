(function() {
    'use strict';

    Lampa.Platform.tv();
    
    // Список серверов
    var servers = [
        { 
            id: 'server1', 
            name: 'Сервер 1', 
            url: 'http://185.105.117.217:12160/',
            testUrl: 'http://185.105.117.217:12160/test'
        },
        { 
            id: 'server2', 
            name: 'Сервер 2', 
            url: 'http://my.bylampa.online/',
            testUrl: 'http://my.bylampa.online/test'
        },
        { 
            id: 'server3', 
            name: 'Сервер 3', 
            url: 'http://bylampa.online/',
            testUrl: 'http://bylampa.online/test'
        }
    ];
    
    var currentSelection = 0;
    var timerInterval;
    var timeLeft = 30;
    var downKeyPressed = false;
    var downKeyTimer;

    // Обработчик нажатия клавиш
    function handleKeyDown(e) {
        // Кнопка Down
        if (e.keyCode === 40 || e.code === 'ArrowDown') {
            if (!downKeyPressed) {
                downKeyPressed = true;
                // Запускаем таймер удержания (2 секунды)
                downKeyTimer = setTimeout(function() {
                    showServerSelectionMenu();
                }, 2000);
            }
        }
    }

    // Обработчик отпускания клавиш
    function handleKeyUp(e) {
        if (e.keyCode === 40 || e.code === 'ArrowDown') {
            downKeyPressed = false;
            clearTimeout(downKeyTimer);
        }
    }

    // Показать меню выбора серверов
    function showServerSelectionMenu() {
        // Отключаем таймер автовыбора, если он был
        clearTimeout(downKeyTimer);
        downKeyPressed = false;
        
        // Удаляем предыдущее меню, если есть
        $('#SERVER_SELECTION').remove();
        
        // Создаем HTML для меню
        var menuHTML = `
            <div id="SERVER_SELECTION" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                background-color: rgba(0,0,0,0.9); display: flex; flex-direction: column; 
                justify-content: center; align-items: center; z-index: 9999;">
                <div style="color: white; font-size: 24px; margin-bottom: 30px;">
                    Выберите сервер (автовыбор через <span id="SELECTION_TIMER">30</span> сек)
                </div>
                <div id="SERVER_STATUS" style="color: #ff9800; margin-bottom: 20px;"></div>
        `;
        
        // Добавляем кнопки для каждого сервера
        servers.forEach(function(server, index) {
            menuHTML += `
                <button id="${server.id}" 
                        style="margin: 10px; padding: 15px 30px; font-size: 20px; min-width: 300px; 
                               background-color: ${index === 0 ? '#4CAF50' : '#333'}; 
                               color: white; border: none; border-radius: 5px; cursor: pointer;
                               position: relative;">
                    ${server.name} (${server.url.replace(/^https?:\/\//, '')})
                    <span id="status_${server.id}" style="position: absolute; right: 10px;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" fill="#777"/>
                        </svg>
                    </span>
                </button>
            `;
        });
        
        menuHTML += `</div>`;
        
        $('body').append(menuHTML);
        
        // Проверяем доступность серверов
        servers.forEach(function(server) {
            checkServerAvailability(server.testUrl, function(isAvailable) {
                var statusElement = $('#status_' + server.id + ' svg');
                statusElement.find('circle').attr('fill', isAvailable ? '#4CAF50' : '#f44336');
                
                if (!isAvailable) {
                    $('#' + server.id).css('opacity', '0.6');
                }
            });
        });
        
        // Назначаем обработчики для кнопок
        servers.forEach(function(server, index) {
            $('#' + server.id).on('hover:enter hover:click', function() {
                if (!$('#' + server.id).css('opacity') || $('#' + server.id).css('opacity') !== '0.6') {
                    selectServer(index);
                } else {
                    $('#SERVER_STATUS').text('Сервер недоступен, выберите другой');
                    setTimeout(function() {
                        $('#SERVER_STATUS').text('');
                    }, 2000);
                }
            });
        });
        
        // Запускаем таймер автоматического выбора
        startSelectionTimer();
        
        // Обработка клавиш в меню
        $(document).on('keydown.serverSelection', function(e) {
            if (e.keyCode === 38 || e.keyCode === 40) { // Вверх/Вниз
                e.preventDefault();
                navigateServers(e.keyCode === 38 ? -1 : 1);
            } else if (e.keyCode === 13) { // Enter
                e.preventDefault();
                if (!$('#' + servers[currentSelection].id).css('opacity') || 
                    $('#' + servers[currentSelection].id).css('opacity') !== '0.6') {
                    selectServer(currentSelection);
                }
            } else if (e.keyCode === 27) { // Escape
                e.preventDefault();
                $('#SERVER_SELECTION').remove();
                $(document).off('keydown.serverSelection');
            }
        });
    }

    // Проверка доступности сервера
    function checkServerAvailability(url, callback) {
        var xhr = new XMLHttpRequest();
        xhr.timeout = 3000;
        xhr.open('GET', url, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                callback(xhr.status === 200 || xhr.status === 404);
            }
        };
        xhr.onerror = function() {
            callback(false);
        };
        try {
            xhr.send();
        } catch(e) {
            callback(false);
        }
    }

    // Навигация по серверам
    function navigateServers(direction) {
        $('#' + servers[currentSelection].id).css('background-color', '#333');
        
        currentSelection += direction;
        if (currentSelection < 0) currentSelection = servers.length - 1;
        if (currentSelection >= servers.length) currentSelection = 0;
        
        $('#' + servers[currentSelection].id).css('background-color', '#4CAF50');
    }

    // Выбор сервера
    function selectServer(index) {
        clearInterval(timerInterval);
        var selectedServer = servers[index];
        
        // Для WebOS используем специальный метод загрузки
        if (navigator.userAgent.match(/WebOS/i)) {
            $('#SERVER_STATUS').text('Загрузка...');
            
            // Создаем iframe для обхода ограничений
            var iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = selectedServer.url;
            document.body.appendChild(iframe);
            
            // Дополнительная проверка через 3 секунды
            setTimeout(function() {
                window.location.href = selectedServer.url;
            }, 3000);
        } else {
            window.location.href = selectedServer.url;
        }
        
        localStorage.setItem('selectedServer', JSON.stringify(selectedServer));
    }

    // Таймер автоматического выбора
    function startSelectionTimer() {
        timeLeft = 30;
        $('#SELECTION_TIMER').text(timeLeft);
        
        timerInterval = setInterval(function() {
            timeLeft--;
            $('#SELECTION_TIMER').text(timeLeft);
            
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                // Выбираем первый доступный сервер
                for (var i = 0; i < servers.length; i++) {
                    if (!$('#' + servers[i].id).css('opacity') || $('#' + servers[i].id).css('opacity') !== '0.6') {
                        selectServer(i);
                        break;
                    }
                }
            }
        }, 1000);
    }

    // Основная функция инициализации
    function startMe() {
        // Добавляем обработчики клавиш
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);
        
        var savedServer = localStorage.getItem('selectedServer');
        
        if (!savedServer) {
            showServerSelectionMenu();
        } else {
            try {
                var server = JSON.parse(savedServer);
                // Проверяем доступность сохраненного сервера
                checkServerAvailability(server.testUrl || (server.url + 'test'), function(isAvailable) {
                    if (isAvailable) {
                        window.location.href = server.url;
                    } else {
                        showServerSelectionMenu();
                    }
                });
            } catch(e) {
                showServerSelectionMenu();
            }
        }
    }
    
    // Инициализация
    if(window.appready) startMe();
    else {
        Lampa.Listener.follow('app', function(e) {
            if(e.type == 'ready') startMe();
        });
    }
})();
