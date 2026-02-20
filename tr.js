(function() {
    'use strict';

    if (!Lampa.Platform.tv()) {
        console.log('Torr: Платформа не TV, выход');
        return;
    }

    // --- Конфигурация ---
    const SERVER_URL = 'http://localhost:8090';
    const SERVER_APP_ID = 'torrserv.matrix.app';
    const CHECK_TIMEOUT = 3000;
    const MAX_RETRIES = 5;
    const RETRY_DELAY = 2000;

    function log(...args) {
        console.log.apply(console, ["[Torr Serv Helper]"].concat(args));
    }

    // --- Функция остановки TorrServer ---
    function stopTorrServer() {
        log('🛑 Остановка TorrServer...');
        
        if (typeof webOS === 'undefined' || !webOS.service) {
            log('webOS API не доступен');
            return;
        }
        
        webOS.service.request('luna://com.webos.applicationManager', {
            method: 'close',
            parameters: { 
                id: SERVER_APP_ID 
            },
            onSuccess: function() {
                log('✅ TorrServer успешно остановлен');
            },
            onFailure: function(error) {
                log('❌ Ошибка остановки:', error.errorText);
                
                // Пробуем HTTP как запасной вариант
                const xhr = new XMLHttpRequest();
                xhr.open('GET', SERVER_URL + '/shutdown', true);
                xhr.timeout = 2000;
                xhr.send();
            }
        });
    }

    // --- Проверка статуса сервера ---
    function checkServerStatus(url, timeout, callbackSuccess, callbackFail) {
        const xhr = new XMLHttpRequest();
        xhr.timeout = timeout;
        xhr.open('GET', url, true);

        xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304) {
                log('Сервер отвечает, статус:', xhr.status);
                callbackSuccess();
            } else {
                log('Ошибка HTTP:', xhr.status);
                callbackFail();
            }
        };

        xhr.onerror = function() {
            log('Сервер не доступен');
            callbackFail();
        };

        xhr.ontimeout = function() {
            log('Таймаут запроса');
            callbackFail();
        };

        xhr.send();
    }

    // --- Запуск приложения ---
    function launchServerApp() {
        log('🚀 Запуск TorrServer...');

        if (typeof webOS === 'undefined' || !webOS.service) {
            log('Ошибка: webOS API не найден');
            return;
        }

        webOS.service.request('luna://com.webos.applicationManager', {
            method: 'launch',
            parameters: {
                id: SERVER_APP_ID
            },
            onSuccess: function(response) {
                log('✅ TorrServer запущен');
            },
            onFailure: function(error) {
                log('❌ Ошибка запуска:', error.errorText);
            }
        });
    }

    // --- Основная логика проверки ---
    function performChecks(attempt = 1) {
        log(`Проверка сервера (попытка ${attempt}/${MAX_RETRIES})...`);

        checkServerStatus(SERVER_URL, CHECK_TIMEOUT,
            function() {
                log('Сервер уже запущен');
            },
            function() {
                if (attempt < MAX_RETRIES) {
                    log(`Повтор через ${RETRY_DELAY/1000}с...`);
                    setTimeout(() => performChecks(attempt + 1), RETRY_DELAY);
                } else {
                    log('Сервер не запущен, запускаем');
                    launchServerApp();
                }
            }
        );
    }

    // --- ИСПРАВЛЕННЫЙ обработчик закрытия ---
    function setupCloseHandler() {
        log('Настраиваем обработчик закрытия...');

        // Вариант 1: Перехватываем нажатие на кнопку выхода
        $(document).on('hover:enter', '[data-action="exit_r"]', function() {
            log('🔴 Нажата кнопка выхода');
            stopTorrServer();
            
            // Даем время на остановку сервера (200мс)
            setTimeout(function() {
                // Продолжаем стандартный выход
                Lampa.Activity.out();
                if (Lampa.Platform.is('webos')) window.close();
            }, 200);
        });

        // Вариант 2: Следим за событием выхода (как в плагине exit)
        Lampa.Listener.follow('app', function(event) {
            if (event.type === 'exit' || event.type === 'stop') {
                log('🔴 Получено событие выхода');
                stopTorrServer();
            }
        });

        // Вариант 3: Перехватываем platform.exit если он существует
        if (Lampa.Platform && Lampa.Platform.exit) {
            var originalExit = Lampa.Platform.exit;
            Lampa.Platform.exit = function() {
                log('🔴 Вызов platform.exit');
                stopTorrServer();
                originalExit.apply(Lampa.Platform, arguments);
            };
        }
    }

    // --- Запуск плагина ---
    log('Плагин загружен');
    
    // Ждем загрузки DOM и Lampa
    function init() {
        log('Инициализация...');
        performChecks();
        setupCloseHandler();
    }

    if (window.appready && document.readyState === 'complete') {
        init();
    } else {
        Lampa.Listener.follow('app', function(event) {
            if (event.type === 'ready') {
                setTimeout(init, 500); // Небольшая задержка для загрузки DOM
            }
        });
    }
})();
