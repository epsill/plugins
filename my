(function() {
    'use strict';

    // Основная инициализация Lampa для TV
    Lampa.Platform.tv();

    // Анти-отладочная и обфусцирующая обертка
    // Защита от анализа кода
    (function(obfuscatedArray, targetValue) {
        // Типичная техника обфускации - массив функций и их перемешивание
        var shuffledArray = obfuscatedArray();
        
        function decodeString1(param1, param2, param3, param4) {
            return decodeHex(param4 - -0x39f, param1);
        }
        
        function decodeString2(param1, param2, param3, param4) {
            return decodeHex(param2 - -0x3c7, param4);
        }
        
        while(true) {
            try {
                // Сложные математические вычисления для проверки целостности кода
                var checkValue = parseInt(decodeString1(-0x2cf,-0x2ec,-0x2f9,-0x2df)) / (9 * 584 + -7955 + -75 * 36) + 
                                parseInt(decodeString1(-0x282,-0x2d3,-0x2c6,-0x2ad)) / (8355 + -1802 + -6551) + 
                                -parseInt(decodeString2(-0x2fa,-0x2d8,-0x2a8,-0x2f9)) / (4140 + -1219 + -1459 * 2) * 
                                (-parseInt(decodeString1(-0x2dc,-0x2b7,-0x2f6,-0x2d9)) / (6255 + 927 * 6 + -43 * 281)) + 
                                parseInt(decodeString2(-0x2f7,-0x30c,-0x31b,-0x310)) / (-105 * 11 + -935 * 3 + -1645) * 
                                (parseInt(decodeString1(-0x2b6,-0x2db,-0x2a7,-0x2d0)) / (1261 + 5863 + 2 * -3559)) + 
                                parseInt(decodeString1(-0x2fe,-0x2c9,-0x2b4,-0x2da)) / (102 + -7582 + -1 * -7487) + 
                                -parseInt(decodeString2(-0x2d6,-0x2c5,-0x299,-0x2a6)) / (-3053 + -2454 + 5515) * 
                                (-parseInt(decodeString1(-0x2e1,-0x2de,-0x2c2,-0x2e9)) / (29 * 229 + -1589 * 6 + -59 * 274)) + 
                                -parseInt(decodeString2(-0x2e9,-0x2e9,-0x2c7,-0x2bd)) / (1 * 6689 + 1 * 137 + -6816) * 
                                (parseInt(decodeString1(-0x2e6,-0x298,-0x2c3,-0x2bd)) / (-8767 + 7590 + -4 * -294));
                
                if(checkValue === targetValue) break;
                else shuffledArray.push(shuffledArray.shift());
            } catch(e) {
                shuffledArray.push(shuffledArray.shift());
            }
        }
    })(/* массив данных */, -102530 * 2 + 656179 - 181419);

    // Основная логика скрипта
    (function() {
        var config = {
            'eJckC': '^[^]*+$',  // Регулярное выражение
            'BIQTQ': 'console',  // Консоль
            'vtGOo': 'xejYm',
            'lgWhR': function(a, b) { return a === b; },
            'SxhJr': 'constructor',
            'QjVxR': function(fn, arg) { return fn(arg); },
            'uUyDs': function(a, b) { return a + b; },
            'ObIiw': function(a, b) { return a + b; },
            'RNmPi': 'return this',  // Возврат контекста
            // ... множество других свойств
        };

        // Функция для перехвата console методов
        var interceptFunction = (function() {
            var isActive = true;
            return function(context, callback) {
                var wrapper = isActive ? function() {
                    if(callback) {
                        var result = callback.apply(context, arguments);
                        callback = null;
                        return result;
                    }
                } : function() {};
                isActive = false;
                return wrapper;
            };
        })();

        // Перехватчик ошибок и логов
        var errorInterceptor = interceptFunction(this, function() {
            // Анти-отладочная логика
            return errorInterceptor.constructor().search(config['RNmPi']).constructor.constructor(config['RNmPi'])();
        });

        config['QjVxR'](errorInterceptor);

        // Основной перехватчик консоли
        var consoleInterceptor = (function() {
            var methods = {};
            methods['toString'] = config['BIQTQ'];
            methods['LwkmN'] = 'CDqwQ';
            
            var isActive = true;
            
            return function(target, callback) {
                var interceptor = {
                    'wXClP': methods['toString'],
                    'testKey': 'CDqwQ',
                    'checkFn': function(a, b) { return a !== b; },
                    'VmaWG': methods['LwkmN']
                };
                
                var interceptorFn = isActive ? function() {
                    if(interceptor['checkFn'](interceptor['wXClP'], interceptor['testKey'])) {
                        // Анти-отладочный код
                    } else {
                        if(callback) {
                            var result = callback.apply(target, arguments);
                            callback = null;
                            return result;
                        }
                    }
                } : function() {};
                
                isActive = false;
                return interceptorFn;
            };
        }());

        // Перехват console методов
        var hookConsole = consoleInterceptor(this, function() {
            try {
                // Попытка создания функции через конструктор
                var testFn = Function(config['ObIiw'](config['ObIiw'](config['RNmPi'], 'return this'), ')'));
                var globalObj = testFn();
            } catch(e) {
                var globalObj = window;
            }
            
            var consoleObj = globalObj.console = globalObj.console || {};
            var methodsToHook = ['log', 'debug', 'info', 'error', 'warn', 'trace', 'exception'];
            
            for(var i = 0; i < methodsToHook.length; i++) {
                var methodName = methodsToHook[i];
                var originalMethod = consoleObj[methodName] || function() {};
                
                var hookedMethod = consoleInterceptor.constructor.prototype.bind(consoleInterceptor);
                hookedMethod.toString = originalMethod.toString.bind(originalMethod);
                hookedMethod.bind = originalMethod.bind.bind(originalMethod);
                
                consoleObj[methodName] = hookedMethod;
            }
        });

        config['QjVxR'](hookConsole);

        'use strict';

        // Интервал проверки Lampa
        var checkInterval = setInterval(function() {
            if(typeof Lampa !== 'undefined') {
                clearInterval(checkInterval);
                
                // Проверка origin Lampa
                if(Lampa.Storage.origin !== 'bylampa') {
                    Lampa.Storage.set('origin', 'bylamp');
                    return;
                } else {
                    // Установка кастомных настроек
                    var checkValue = Lampa.Storage.get('lampac_unique', '');
                    if(checkValue !== 'tyusdt') {
                        Lampa.Storage.set('lampac_unique', 'tyusdt');
                    }
                    
                    // Добавление кастомных событий
                    Lampa.Manager.add(['custom_event'], function() {});
                }
            }
        }, 500);
    })();
})();
