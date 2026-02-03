// Сохраните этот код как remote-redirector.js на вашем GitHub
(function() {
    'use strict';
    
    console.log('🎯 Lampa Remote Redirector Plugin v1.0');
    console.log('📍 Плагин загружен удаленно');
    
    // ========== КОНСТАНТЫ ==========
    const PLUGIN_NAME = 'Remote Redirector';
    const PLUGIN_VERSION = '1.0';
    const PLUGIN_AUTHOR = 'Ваше имя';
    
    // ========== КОНФИГУРАЦИЯ ПО УМОЧАНИЮ ==========
    let CONFIG = {
        // Основной сервер для загрузки (можно изменить в настройках)
        targetServer: 'https://epsill.github.io/bylampa',
        
        // Оригинальный сервер Lampa
        originalServer: 'https://bylampa.github.io/lampa',
        
        // Включить логирование
        debug: true,
        
        // Автоматическая активация
        autoActivate: true
    };
    
    // ========== СОСТОЯНИЕ ==========
    let isActive = false;
    let isInitialized = false;
    let redirectMap = new Map();
    
    // ========== УТИЛИТЫ ==========
    function log(...args) {
        if (CONFIG.debug) {
            console.log(`[${PLUGIN_NAME}]`, ...args);
        }
    }
    
    function error(...args) {
        console.error(`[${PLUGIN_NAME} ERROR]`, ...args);
    }
    
    // ========== ОСНОВНЫЕ ФУНКЦИИ ==========
    
    function initialize() {
        if (isInitialized) {
            log('Уже инициализирован');
            return;
        }
        
        log('🚀 Инициализация плагина...');
        
        // 1. Создаем карту перенаправления
        createRedirectMap();
        
        // 2. Перехватываем методы загрузки
        patchLoaders();
        
        // 3. Настраиваем глобальные переменные
        setupGlobals();
        
        // 4. Активируем если нужно
        if (CONFIG.autoActivate) {
            activate();
        }
        
        isInitialized = true;
        log('✅ Плагин инициализирован');
    }
    
    function createRedirectMap() {
        log('Создаю карту перенаправления...');
        
        const paths = [
            '', // корень
            '/app.min.js',
            '/lampainit.js',
            '/css/app.css',
            '/lampa-main/',
            '/lampa-main/app.min.js',
            '/lampa-main/css/app.css',
            '/vender/',
            '/webos/',
            '/icons/',
            '/js/',
            '/css/',
            '/img/',
            '/fonts/'
        ];
        
        paths.forEach(path => {
            const original = CONFIG.originalServer + path;
            const target = CONFIG.targetServer + path;
            redirectMap.set(original, target);
            
            // Также добавляем варианты без trailing slash
            if (path.endsWith('/')) {
                const originalNoSlash = original.slice(0, -1);
                const targetNoSlash = target.slice(0, -1);
                redirectMap.set(originalNoSlash, targetNoSlash);
            }
        });
        
        log(`Карта создана: ${redirectMap.size} записей`);
    }
    
    function getRedirectedUrl(url) {
        if (!url || typeof url !== 'string') {
            return url;
        }
        
        // Проверяем точные совпадения
        if (redirectMap.has(url)) {
            const redirected = redirectMap.get(url);
            if (url !== redirected) {
                log(`Перенаправляю: ${url} → ${redirected}`);
            }
            return redirected;
        }
        
        // Проверяем частичные совпадения
        for (const [original, target] of redirectMap) {
            if (original && url.startsWith(original)) {
                const redirected = url.replace(original, target);
                if (url !== redirected) {
                    log(`Перенаправляю (частично): ${url.substring(0, 50)}...`);
                }
                return redirected;
            }
        }
        
        return url;
    }
    
    // ========== ПЕРЕХВАТ ЗАГРУЗКИ ==========
    
    function patchLoaders() {
        log('Настраиваю перехват загрузки...');
        
        // 1. Перехват XMLHttpRequest
        patchXMLHttpRequest();
        
        // 2. Перехват fetch
        if (window.fetch) {
            patchFetch();
        }
        
        // 3. Перехват создания script элементов
        patchScriptCreation();
        
        // 4. Перехват загрузки CSS
        patchCSSLoading();
        
        // 5. Перехват lampa_url
        patchLampaUrl();
    }
    
    function patchXMLHttpRequest() {
        const OriginalXHR = window.XMLHttpRequest;
        
        window.XMLHttpRequest = function() {
            const xhr = new OriginalXHR();
            const originalOpen = xhr.open;
            
            xhr.open = function(method, url, ...args) {
                const redirectedUrl = getRedirectedUrl(url);
                return originalOpen.call(this, method, redirectedUrl, ...args);
            };
            
            return xhr;
        };
        
        // Копируем статические свойства
        Object.setPrototypeOf(window.XMLHttpRequest, OriginalXHR);
        Object.getOwnPropertyNames(OriginalXHR).forEach(prop => {
            if (!window.XMLHttpRequest.hasOwnProperty(prop)) {
                window.XMLHttpRequest[prop] = OriginalXHR[prop];
            }
        });
    }
    
    function patchFetch() {
        const originalFetch = window.fetch;
        
        window.fetch = function(input, init) {
            if (typeof input === 'string') {
                input = getRedirectedUrl(input);
            } else if (input && input.url) {
                input = { ...input, url: getRedirectedUrl(input.url) };
            } else if (input && input instanceof Request) {
                // Обработка Request объектов
                const url = getRedirectedUrl(input.url);
                input = new Request(url, input);
            }
            
            return originalFetch.call(this, input, init);
        };
    }
    
    function patchScriptCreation() {
        const originalCreateElement = document.createElement;
        
        document.createElement = function(tagName, options) {
            const element = originalCreateElement.call(this, tagName, options);
            
            if (tagName.toLowerCase() === 'script') {
                const descriptor = Object.getOwnPropertyDescriptor(element, 'src');
                
                if (descriptor && descriptor.set) {
                    Object.defineProperty(element, 'src', {
                        get: descriptor.get,
                        set: function(value) {
                            return descriptor.set.call(this, getRedirectedUrl(value));
                        },
                        configurable: true,
                        enumerable: descriptor.enumerable
                    });
                }
            }
            
            return element;
        };
    }
    
    function patchCSSLoading() {
        const originalHeadAppend = document.head.appendChild;
        
        document.head.appendChild = function(element) {
            if (element.tagName && 
                element.tagName.toLowerCase() === 'link' && 
                element.rel === 'stylesheet' &&
                element.href) {
                
                const originalHref = element.getAttribute('href');
                const redirectedHref = getRedirectedUrl(originalHref);
                
                if (originalHref !== redirectedHref) {
                    element.setAttribute('href', redirectedHref);
                }
            }
            
            return originalHeadAppend.call(this, element);
        };
    }
    
    function patchLampaUrl() {
        // Сохраняем оригинальный lampa_url если он есть
        if (window.lampa_url !== undefined) {
            window._original_lampa_url = window.lampa_url;
        }
        
        // Создаем геттер/сеттер для lampa_url
        Object.defineProperty(window, 'lampa_url', {
            get: function() {
                return CONFIG.targetServer;
            },
            set: function(value) {
                log(`Кто-то пытается изменить lampa_url на: ${value}`);
                // Не позволяем изменить
                return CONFIG.targetServer;
            },
            configurable: true,
            enumerable: true
        });
        
        log(`lampa_url установлен на: ${CONFIG.targetServer}`);
    }
    
    // ========== УПРАВЛЕНИЕ ==========
    
    function activate() {
        if (isActive) {
            log('Уже активен');
            return;
        }
        
        log('✅ АКТИВИРУЮ перенаправление!');
        log(`Сервер: ${CONFIG.targetServer}`);
        
        // Обновляем настройки Lampa
        if (window.lampa_settings) {
            window.lampa_settings.redirect_active = true;
            window.lampa_settings.redirect_to = CONFIG.targetServer;
        }
        
        isActive = true;
        
        // Отправляем событие
        document.dispatchEvent(new CustomEvent('lampa-redirector-activated', {
            detail: {
                server: CONFIG.targetServer,
                timestamp: Date.now()
            }
        }));
    }
    
    function deactivate() {
        if (!isActive) {
            return;
        }
        
        log('❌ Деактивирую перенаправление');
        
        // Восстанавливаем lampa_url
        if (window._original_lampa_url !== undefined) {
            Object.defineProperty(window, 'lampa_url', {
                value: window._original_lampa_url,
                writable: true,
                configurable: true,
                enumerable: true
            });
        }
        
        isActive = false;
    }
    
    function setupGlobals() {
        // Экспортируем API для управления
        window.LampaRedirector = {
            // Информация
            name: PLUGIN_NAME,
            version: PLUGIN_VERSION,
            author: PLUGIN_AUTHOR,
            
            // Состояние
            isActive: () => isActive,
            isInitialized: () => isInitialized,
            
            // Конфигурация
            config: CONFIG,
            
            // Управление
            activate: activate,
            deactivate: deactivate,
            toggle: () => isActive ? deactivate() : activate(),
            
            // Изменение настроек
            setTargetServer: (newServer) => {
                CONFIG.targetServer = newServer;
                createRedirectMap(); // Обновляем карту
                log(`Сервер изменен на: ${newServer}`);
                
                // Если активен - переприменяем патчи
                if (isActive) {
                    patchLampaUrl();
                }
            },
            
            // Информация
            getStatus: () => ({
                active: isActive,
                targetServer: CONFIG.targetServer,
                originalServer: CONFIG.originalServer,
                redirectCount: redirectMap.size
            }),
            
            // Тестирование
            testRedirect: (url) => getRedirectedUrl(url)
        };
        
        log('Глобальный API создан: LampaRedirector');
    }
    
    // ========== ИНТЕРФЕЙС ДЛЯ LAMPA EXTENSIONS ==========
    
    // Создаем объект плагина для системы расширений Lampa
    const pluginObject = {
        // Основная информация
        name: PLUGIN_NAME,
        version: PLUGIN_VERSION,
        author: PLUGIN_AUTHOR,
        description: 'Перенаправляет загрузку Lampa на ваш сервер',
        
        // Настройки для UI
        settings: [
            {
                name: 'target_server',
                type: 'text',
                title: 'URL вашего сервера',
                value: CONFIG.targetServer,
                description: 'Введите адрес вашего сервера с Lampa'
            },
            {
                name: 'auto_activate',
                type: 'toggle',
                title: 'Автоматически активировать',
                value: CONFIG.autoActivate,
                description: 'Активировать при загрузке'
            },
            {
                name: 'debug',
                type: 'toggle',
                title: 'Режим отладки',
                value: CONFIG.debug,
                description: 'Показывать логи в консоли'
            }
        ],
        
        // Обработчик изменения настроек
        onSettingsChange: function(newSettings) {
            log('Настройки обновлены:', newSettings);
            
            // Обновляем конфиг
            if (newSettings.target_server) {
                CONFIG.targetServer = newSettings.target_server;
            }
            if (newSettings.auto_activate !== undefined) {
                CONFIG.autoActivate = newSettings.auto_activate;
            }
            if (newSettings.debug !== undefined) {
                CONFIG.debug = newSettings.debug;
            }
            
            // Переинициализируем с новыми настройками
            isInitialized = false;
            redirectMap.clear();
            initialize();
            
            return true;
        },
        
        // Методы плагина
        methods: {
            activate: activate,
            deactivate: deactivate,
            getStatus: () => ({
                active: isActive,
                server: CONFIG.targetServer
            })
        },
        
        // Иконка (base64 или URL)
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE2IDI5LjMzMzNDMjMuMzYzOCAyOS4zMzMzIDI5LjMzMzMgMjMuMzYzOCAyOS4zMzMzIDE2QzI5LjMzMzMgOC42MzYyIDIzLjM2MzggMi42NjY2NyAxNiAyLjY2NjY3QzguNjM2MiAyLjY2NjY3IDIuNjY2NjcgOC42MzYyIDIuNjY2NjcgMTZDMi42NjY2NyAyMy4zNjM4IDguNjM2MiAyOS4zMzMzIDE2IDI5LjMzMzNaIiBmaWxsPSIjNDI4NUY0Ii8+CjxwYXRoIGQ9Ik0yMi42NjY3IDE2TDEzLjMzMzMgOC42NjY2N1YyMy4zMzMzTDIyLjY2NjcgMTZaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K'
    };
    
    // Регистрируем плагин в Lampa если она уже загружена
    if (typeof Lampa !== 'undefined' && Lampa.Extensions) {
        Lampa.Extensions.register(PLUGIN_NAME, pluginObject);
        log('Плагин зарегистрирован в системе расширений Lampa');
    } else {
        // Ждем Lampa
        const waitForLampa = setInterval(() => {
            if (typeof Lampa !== 'undefined' && Lampa.Extensions) {
                clearInterval(waitForLampa);
                Lampa.Extensions.register(PLUGIN_NAME, pluginObject);
                log('Плагин зарегистрирован в системе расширений Lampa');
            }
        }, 100);
    }
    
    // ========== АВТОЗАПУСК ==========
    
    // Запускаем инициализацию
    setTimeout(() => {
        initialize();
        log('Плагин готов к работе!');
        log(`Пользователь будет загружать Lampa с: ${CONFIG.targetServer}`);
    }, 500);
    
})();