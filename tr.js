function () {
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
        log('Пытаемся остановить TorrServer...');
        
        if (typeof webOS === 'undefined' || !webOS.service) {
            log('webOS API не доступен');
            return;
        }
        
        // Пробуем закрыть приложение через webOS
        webOS.service.request('luna://com.webos.applicationManager', {
            method: 'close',
            parameters: { 
                id: SERVER_APP_ID 
            },
            onSuccess: function() {
                log('✅ TorrServer успешно остановлен');
            },
            onFailure: function(error) {
                log('❌ Не удалось остановить TorrServer:', error.errorText);
                
                // Если не вышло через webOS, пробуем HTTP (на всякий случай)
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
            log('Сервер не доступен (сетевая ошибка)');
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
                log('❌ Ошибка запуска:', error.errorText || 'Неизвестная ошибка');
            }
        });
    }

    // --- Основная логика проверки (как и раньше) ---
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

    // --- ГЛАВНОЕ: Подписка на закрытие приложения ---
    function setupCloseHandler() {
        log('Настраиваем обработчик закрытия...');
        
        // Следим за активностями Lampa [citation:2]
        Lampa.Listener.follow('activity', function(event) {
            // Когда пользователь нажимает "Закрыть приложение"
            if (event.type === 'close' || event.activity === 'close') {
                log('Обнаружено закрытие Lampa');
                stopTorrServer();
            }
        });
        
        // Альтернативный вариант - следить за активностью напрямую
        if (Lampa.Activity) {
            Lampa.Activity.on('destroy', function() {
                log('Активность уничтожена');
                stopTorrServer();
            });
        }
    }

    // --- Запуск плагина ---
    log('Плагин загружен');
    
    // Ждём готовности Lampa [citation:1]
    if (window.appready) {
        log('Lampa готова, инициализация...');
        performChecks();
        setupCloseHandler();
    } else {
        Lampa.Listener.follow('app', function(event) {
            if (event.type === 'ready') {
                log('Lampa готова (событие), инициализация...');
                performChecks();
                setupCloseHandler();
            }
        });
    }
}
