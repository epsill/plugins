(function() {
    'use strict';

    // Инициализация TV-режима
    if (typeof Lampa !== 'undefined' && Lampa.Platform) {
        Lampa.Platform.tv();
    }

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

    // Глобальные переменные
    var currentSelection = 0;
    var timerInterval;
    var timeLeft = 30;
    var downKeyPressed = false;
    var downKeyTimer;
    var menuActive = false;
    var selectedServer = null;

    // Универсальное хранилище (работает на любом домене)
    function getStorage() {
        return {
            set: function(key, value) {
                localStorage.setItem('lampa_redirect_' + key, JSON.stringify(value));
            },
            get: function(key) {
                var value = localStorage.getItem('lampa_redirect_' + key);
                return value ? JSON.parse(value) : null;
            }
        };
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

    // Показать/скрыть меню
    function toggleServerMenu(show) {
        if (show === undefined) show = !menuActive;
        
        if (show && !menuActive) {
            createServerSelectionMenu();
            menuActive = true;
        } else if (!show && menuActive) {
            $('#SERVER_SELECTION').remove();
            $(document).off('keydown.serverSelection');
            menuActive = false;
        }
    }

    // Создание меню выбора
    function createServerSelectionMenu() {
        $('#SERVER_SELECTION').remove();
        clearInterval(timerInterval);
        timeLeft = 30;
        
        var menuHTML = `
            <div id="SERVER_SELECTION" style="position:fixed;top:0;left:0;width:100%;height:100%;
                background:rgba(0,0,0,0.9);display:flex;flex-direction:column;
                justify-content:center;align-items:center;z-index:9999;">
                <div style="color:white;font-size:24px;margin-bottom:30px;">
                    Выберите сервер (автовыбор через <span id="SELECTION_TIMER">30</span> сек)
                </div>
                <div id="SERVER_STATUS" style="color:#ff9800;margin-bottom:20px;"></div>
        `;
        
        servers.forEach(function(server, index) {
            menuHTML += `
                <button id="${server.id}" style="margin:10px;padding:15px 30px;font-size:20px;
                    min-width:300px;background:${index===0?'#4CAF50':'#333'};color:white;
                    border:none;border-radius:5px;cursor:pointer;position:relative;">
                    ${server.name} (${server.url.replace(/^https?:\/\//, '')})
                    <span id="status_${server.id}" style="position:absolute;right:10px;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" fill="#777"/>
                        </svg>
                    </span>
                </button>
            `;
        });
        
        menuHTML += `</div>`;
        $('body').append(menuHTML);
        
        // Проверка доступности серверов
        servers.forEach(function(server) {
            checkServerAvailability(server.testUrl, function(isAvailable) {
                $('#status_' + server.id + ' svg circle').attr('fill', isAvailable ? '#4CAF50' : '#f44336');
                if (!isAvailable) $('#' + server.id).css('opacity', '0.6');
            });
        });
        
        // Обработчики кнопок
        servers.forEach(function(server, index) {
            $('#' + server.id).on('hover:enter hover:click', function() {
                if ($('#' + server.id).css('opacity') !== '0.6') {
                    selectServer(index);
                } else {
                    $('#SERVER_STATUS').text('Сервер недоступен, выберите другой').delay(2000).fadeOut();
                }
            });
        });
        
        startSelectionTimer();
        
        // Навигация по меню
        $(document).on('keydown.serverSelection', function(e) {
            if (e.keyCode === 38 || e.keyCode === 40) { // Вверх/Вниз
                e.preventDefault();
                navigateServers(e.keyCode === 38 ? -1 : 1);
            } else if (e.keyCode === 13) { // Enter
                e.preventDefault();
                if ($('#' + servers[currentSelection].id).css('opacity') !== '0.6') {
                    selectServer(currentSelection);
                }
            } else if (e.keyCode === 27) { // Escape
                e.preventDefault();
                toggleServerMenu(false);
            }
        });
    }
    
    // Навигация по серверам
    function navigateServers(direction) {
        $('#' + servers[currentSelection].id).css('background-color', '#333');
        currentSelection = (currentSelection + direction + servers.length) % servers.length;
        $('#' + servers[currentSelection].id).css('background-color', '#4CAF50');
    }
    
    // Выбор сервера
    function selectServer(index) {
        clearInterval(timerInterval);
        selectedServer = servers[index];
        getStorage().set('selectedServer', selectedServer);
        
        if (navigator.userAgent.match(/WebOS/i)) {
            var iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = selectedServer.url;
            document.body.appendChild(iframe);
            setTimeout(function() {
                window.location.href = selectedServer.url;
            }, 3000);
        } else {
            window.location.href = selectedServer.url;
        }
    }
    
    // Таймер автовыбора
    function startSelectionTimer() {
        timerInterval = setInterval(function() {
            timeLeft--;
            $('#SELECTION_TIMER').text(timeLeft);
            
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                for (var i = 0; i < servers.length; i++) {
                    if ($('#' + servers[i].id).css('opacity') !== '0.6') {
                        selectServer(i);
                        break;
                    }
                }
            }
        }, 1000);
    }
    
    // Обработчики клавиш
    function handleKeyDown(e) {
        if (e.keyCode === 40 || e.code === 'ArrowDown') {
            if (!downKeyPressed) {
                downKeyPressed = true;
                downKeyTimer = setTimeout(function() {
                    toggleServerMenu(true);
                }, 2000);
            }
        }
    }

    function handleKeyUp(e) {
        if (e.keyCode === 40 || e.code === 'ArrowDown') {
            downKeyPressed = false;
            clearTimeout(downKeyTimer);
        }
    }

    // Добавление кнопки в интерфейс
    function addServerSwitchButton() {
        $('#REDIRECT').remove();
        var btn = $('<div id="REDIRECT" class="head__action selector redirect-screen">⚙️</div>');
        $('#app > div.head > div > div.head__actions').append(btn);
        btn.insertAfter('div[class="head__action selector open--settings"]');
        btn.on('hover:enter hover:click hover:touch', function() {
            toggleServerMenu(true);
        });
    }
    
    // Инициализация
    function init() {
        // Глобальные обработчики клавиш
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);
        
        // Кнопка в интерфейсе
        if ($('#app').length) {
            addServerSwitchButton();
        } else {
            setTimeout(init, 100);
            return;
        }
        
        // Проверка сохраненного сервера
        selectedServer = getStorage().get('selectedServer');
        if (selectedServer) {
            checkServerAvailability(selectedServer.testUrl || (selectedServer.url + 'test'), function(isAvailable) {
                if (!isAvailable) {
                    toggleServerMenu(true);
                } else {
                    window.location.href = selectedServer.url;
                }
            });
        } else {
            toggleServerMenu(true);
        }
    }

    // Запуск
    if (typeof window.appready !== 'undefined' && window.appready) {
        init();
    } else {
        var listener = setInterval(function() {
            if (typeof Lampa !== 'undefined' && Lampa.Listener) {
                clearInterval(listener);
                Lampa.Listener.follow('app', function(e) {
                    if (e.type == 'ready') init();
                });
            }
        }, 100);
    }
})();
        
