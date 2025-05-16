(function() {
    'use strict';

    Lampa.Platform.tv();
    
    // Список доступных серверов с полными URL
    var servers = [
        { 
            id: 'server1', 
            name: 'Сервер 1', 
            url: 'http://185.105.117.217:12160/',
            testUrl: 'http://185.105.117.217:12160/test' // URL для проверки доступности
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

    // Функция проверки доступности сервера
    function checkServerAvailability(url, callback) {
        var xhr = new XMLHttpRequest();
        xhr.timeout = 3000; // Таймаут 3 секунды
        xhr.open('GET', url, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                callback(xhr.status === 200 || xhr.status === 404); // 404 тоже считаем успехом (сервер отвечает)
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

    // Создаем меню выбора сервера с проверкой доступности
    function createServerSelectionMenu() {
        var menuHTML = `
            <div id="SERVER_SELECTION" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                background-color: rgba(0,0,0,0.9); display: flex; flex-direction: column; 
                justify-content: center; align-items: center; z-index: 9999;">
                <div style="color: white; font-size: 24px; margin-bottom: 30px;">
                    Выберите сервер (автовыбор через <span id="SELECTION_TIMER">30</span> сек)
                </div>
                <div id="SERVER_STATUS" style="color: #ff9800; margin-bottom: 20px;"></div>
        `;
        
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
        
        startSelectionTimer();
        
        $(document).on('keydown.serverSelection', function(e) {
            if (e.keyCode === 38 || e.keyCode === 40) {
                e.preventDefault();
                navigateServers(e.keyCode === 38 ? -1 : 1);
            } else if (e.keyCode === 13) {
                e.preventDefault();
                if (!$('#' + servers[currentSelection].id).css('opacity') || 
                    $('#' + servers[currentSelection].id).css('opacity') !== '0.6') {
                    selectServer(currentSelection);
                }
            }
        });
    }
    
    function navigateServers(direction) {
        $('#' + servers[currentSelection].id).css('background-color', '#333');
        
        currentSelection += direction;
        if (currentSelection < 0) currentSelection = servers.length - 1;
        if (currentSelection >= servers.length) currentSelection = 0;
        
        $('#' + servers[currentSelection].id).css('background-color', '#4CAF50');
    }
    
    // Модифицированная функция выбора сервера для WebOS
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
    
    function startSelectionTimer() {
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
    
    function startMe() {
        var savedServer = localStorage.getItem('selectedServer');
        
        if (!savedServer) {
            createServerSelectionMenu();
        } else {
            try {
                var server = JSON.parse(savedServer);
                // Проверяем доступность сохраненного сервера
                checkServerAvailability(server.testUrl || (server.url + 'test'), function(isAvailable) {
                    if (isAvailable) {
                        window.location.href = server.url;
                    } else {
                        createServerSelectionMenu();
                    }
                });
            } catch(e) {
                createServerSelectionMenu();
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
