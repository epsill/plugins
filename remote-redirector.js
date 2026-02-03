// Сохраните как: redirect-plugin.js
Lampa.Extensions.install({
    // Обязательные поля
    name: 'Redirect to My Server',
    description: 'Load Lampa from your custom server',
    version: '1.0.0',
    author: 'Your Name',
    
    // Настройки для интерфейса
    settings: {
        server_url: {
            type: 'text',
            title: 'Server URL',
            value: 'https://ваш-логин.github.io/ваш-репозиторий/',
            description: 'URL of your Lampa fork'
        },
        enabled: {
            type: 'toggle',
            title: 'Enabled',
            value: true,
            description: 'Enable redirect'
        }
    },
    
    // Иконка (опционально)
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNiIgZmlsbD0iIzAwQjFGNSIvPgo8cGF0aCBkPSJNMTYgMTBMMjIgMTZMMTYgMjJWMTBaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTAgMTBMMTYgMTZMMTAgMjJWMTBaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K',
    
    // Инициализация плагина
    init: function(settings) {
        console.log('[Redirect Plugin] Initializing...');
        
        // Получаем настройки
        const targetServer = settings.server_url.value;
        const isEnabled = settings.enabled.value;
        
        if (!isEnabled) {
            console.log('[Redirect Plugin] Disabled');
            return;
        }
        
        console.log('[Redirect Plugin] Redirecting to:', targetServer);
        
        // Основная функция перенаправления
        const originalServer = 'https://bylampa.github.io/lampa/';
        
        // 1. Переопределяем lampa_url
        if (window.lampa_url !== undefined) {
            window._original_lampa_url = window.lampa_url;
        }
        
        Object.defineProperty(window, 'lampa_url', {
            get: function() {
                return targetServer;
            },
            set: function(value) {
                console.log('[Redirect Plugin] Someone tried to change lampa_url, keeping:', targetServer);
            },
            configurable: true
        });
        
        // 2. Перехватываем XMLHttpRequest
        const OriginalXHR = window.XMLHttpRequest;
        
        window.XMLHttpRequest = function() {
            const xhr = new OriginalXHR();
            const originalOpen = xhr.open;
            
            xhr.open = function(method, url, async, user, password) {
                if (url && url.includes(originalServer)) {
                    const newUrl = url.replace(originalServer, targetServer);
                    console.log('[Redirect Plugin] XHR redirect:', url.substring(0, 50) + '...');
                    return originalOpen.call(this, method, newUrl, async, user, password);
                }
                return originalOpen.apply(this, arguments);
            };
            
            return xhr;
        };
        
        // Копируем статические свойства
        for (const prop in OriginalXHR) {
            if (OriginalXHR.hasOwnProperty(prop)) {
                window.XMLHttpRequest[prop] = OriginalXHR[prop];
            }
        }
        
        // 3. Перехватываем создание script элементов
        const originalCreateElement = document.createElement;
        
        document.createElement = function(tagName) {
            const element = originalCreateElement.call(document, tagName);
            
            if (tagName.toLowerCase() === 'script') {
                const descriptor = Object.getOwnPropertyDescriptor(element, 'src');
                
                if (descriptor && descriptor.set) {
                    Object.defineProperty(element, 'src', {
                        get: descriptor.get,
                        set: function(value) {
                            if (value && value.includes(originalServer)) {
                                const newValue = value.replace(originalServer, targetServer);
                                console.log('[Redirect Plugin] Script redirect');
                                return descriptor.set.call(this, newValue);
                            }
                            return descriptor.set.call(this, value);
                        },
                        configurable: true
                    });
                }
            }
            
            return element;
        };
        
        console.log('[Redirect Plugin] ✅ Active! Loading from:', targetServer);
    },
    
    // Вызывается при изменении настроек
    update: function(settings) {
        console.log('[Redirect Plugin] Settings updated');
        // Перезагружаем плагин с новыми настройками
        this.init(settings);
    },
    
    // Вызывается при удалении плагина
    destroy: function() {
        console.log('[Redirect Plugin] Destroyed');
        // Здесь можно восстановить оригинальные функции если нужно
    }
});