(function() {
    'use strict';

    Lampa.Platform.tv();
    
    var server_protocol = location.protocol === "https:" ? 'https://' : 'http://' ;
    
    var icon_server_redirect = '<svg width="256px" height="256px" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M13 21.75C13.4142 21.75 13.75 21.4142 13.75 21C13.75 20.5858 13.4142 20.25 13 20.25V21.75ZM3.17157 19.8284L3.7019 19.2981H3.7019L3.17157 19.8284ZM20.8284 4.17157L20.2981 4.7019V4.7019L20.8284 4.17157ZM21.25 13C21.25 13.4142 21.5858 13.75 22 13.75C22.4142 13.75 22.75 13.4142 22.75 13H21.25ZM10 3.75H14V2.25H10V3.75ZM2.75 13V12H1.25V13H2.75ZM2.75 12V11H1.25V12H2.75ZM13 20.25H10V21.75H13V20.25ZM21.25 11V12H22.75V11H21.25ZM1.25 13C1.25 14.8644 1.24841 16.3382 1.40313 17.489C1.56076 18.6614 1.89288 19.6104 2.64124 20.3588L3.7019 19.2981C3.27869 18.8749 3.02502 18.2952 2.88976 17.2892C2.75159 16.2615 2.75 14.9068 2.75 13H1.25ZM10 20.25C8.09318 20.25 6.73851 20.2484 5.71085 20.1102C4.70476 19.975 4.12511 19.7213 3.7019 19.2981L2.64124 20.3588C3.38961 21.1071 4.33855 21.4392 5.51098 21.5969C6.66182 21.7516 8.13558 21.75 10 21.75V20.25ZM14 3.75C15.9068 3.75 17.2615 3.75159 18.2892 3.88976C19.2952 4.02502 19.8749 4.27869 20.2981 4.7019L21.3588 3.64124C20.6104 2.89288 19.6614 2.56076 18.489 2.40313C17.3382 2.24841 15.8644 2.25 14 2.25V3.75ZM22.75 11C22.75 9.13558 22.7516 7.66182 22.5969 6.51098C22.4392 5.33855 22.1071 4.38961 21.3588 3.64124L20.2981 4.7019C20.7213 5.12511 20.975 5.70476 21.1102 6.71085C21.2484 7.73851 21.25 9.09318 21.25 11H22.75ZM10 2.25C8.13558 2.25 6.66182 2.24841 5.51098 2.40313C4.33856 2.56076 3.38961 2.89288 2.64124 3.64124L3.7019 4.7019C4.12511 4.27869 4.70476 4.02502 5.71085 3.88976C6.73851 3.75159 8.09318 3.75 10 3.75V2.25ZM2.75 11C2.75 9.09318 2.75159 7.73851 2.88976 6.71085C3.02502 5.70476 3.27869 5.12511 3.7019 4.7019L2.64124 3.64124C1.89288 4.38961 1.56076 5.33855 1.40313 6.51098C1.24841 7.66182 1.25 9.13558 1.25 11H2.75ZM2 12.75H22V11.25H2V12.75ZM21.25 12V13H22.75V12H21.25Z" fill="currentColor"></path> <path d="M13.5 7.5L18 7.5" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round"></path> <path d="M6 17.5L6 15.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path> <path d="M6 8.5L6 6.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path> <path d="M9 17.5L9 15.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path> <path d="M9 8.5L9 6.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path> <path d="M15.5841 17.5H14.8341V17.5L15.5841 17.5ZM15.5841 18L15.0964 18.5698C15.3772 18.8101 15.7911 18.8101 16.0718 18.5698L15.5841 18ZM16.656 18.0698C16.9706 17.8004 17.0074 17.327 16.738 17.0123C16.4687 16.6976 15.9952 16.6609 15.6806 16.9302L16.656 18.0698ZM15.4877 16.9302C15.173 16.6609 14.6996 16.6976 14.4302 17.0123C14.1609 17.327 14.1976 17.8004 14.5123 18.0698L15.4877 16.9302ZM20.3892 16.6352C20.6296 16.9726 21.0979 17.0512 21.4352 16.8108C21.7726 16.5704 21.8512 16.1021 21.6108 15.7648L20.3892 16.6352ZM18.5048 14.25C16.5912 14.25 14.8341 15.5999 14.8341 17.5H16.3341C16.3341 16.6387 17.1923 15.75 18.5048 15.75V14.25ZM14.8341 17.5L14.8341 18L16.3341 18L16.3341 17.5L14.8341 17.5ZM16.0718 18.5698L16.656 18.0698L15.6806 16.9302L15.0964 17.4302L16.0718 18.5698ZM16.0718 17.4302L15.4877 16.9302L14.5123 18.0698L15.0964 18.5698L16.0718 17.4302ZM21.6108 15.7648C20.945 14.8304 19.782 14.25 18.5048 14.25V15.75C19.3411 15.75 20.0295 16.1304 20.3892 16.6352L21.6108 15.7648Z" fill="currentColor"></path> <path d="M18.4952 21V21.75V21ZM21.4159 18.5H22.1659H21.4159ZM21.4159 18L21.9036 17.4302C21.6228 17.1899 21.2089 17.1899 20.9282 17.4302L21.4159 18ZM20.344 17.9302C20.0294 18.1996 19.9926 18.673 20.262 18.9877C20.5313 19.3024 21.0048 19.3391 21.3194 19.0698L20.344 17.9302ZM21.5123 19.0698C21.827 19.3391 22.3004 19.3024 22.5698 18.9877C22.8391 18.673 22.8024 18.1996 22.4877 17.9302L21.5123 19.0698ZM16.6108 19.3648C16.3704 19.0274 15.9021 18.9488 15.5648 19.1892C15.2274 19.4296 15.1488 19.8979 15.3892 20.2352L16.6108 19.3648ZM18.4952 21.75C20.4088 21.75 22.1659 20.4001 22.1659 18.5H20.6659C20.6659 19.3613 19.8077 20.25 18.4952 20.25V21.75ZM22.1659 18.5V18H20.6659V18.5H22.1659ZM20.9282 17.4302L20.344 17.9302L21.3194 19.0698L21.9036 18.5698L20.9282 17.4302ZM20.9282 18.5698L21.5123 19.0698L22.4877 17.9302L21.9036 17.4302L20.9282 18.5698ZM15.3892 20.2352C16.055 21.1696 17.218 21.75 18.4952 21.75V20.25C17.6589 20.25 16.9705 19.8696 16.6108 19.3648L15.3892 20.2352Z" fill="currentColor"></path> </g></svg>';

    // НЕ УСТАНАВЛИВАЕМ НИКАКОЙ ДЕФОЛТНЫЙ СЕРВЕР!
    // Пусть пользователь сам введет в настройках

    // ============ УПРАВЛЕНИЕ ИСТОРИЕЙ ============
    function getHistory() {
        try {
            var data = Lampa.Storage.get('server_history');
            if (data) {
                if (Array.isArray(data)) return data;
                if (typeof data === 'string') return JSON.parse(data);
            }
        } catch(e) {}
        return [];
    }

    function saveHistory(history) {
        try {
            Lampa.Storage.set('server_history', JSON.stringify(history));
        } catch(e) {}
    }

    function addToHistory(server) {
        if (!server || typeof server !== 'string' || server.trim() === '') return;
        var history = getHistory();
        if (!Array.isArray(history)) history = [];
        var index = history.indexOf(server);
        if (index !== -1) history.splice(index, 1);
        history.unshift(server);
        if (history.length > 5) history = history.slice(0, 5);
        saveHistory(history);
    }

    // ============ ФУНКЦИИ ДЛЯ УДАЛЕНИЯ ============
    function clearAllHistory() {
        saveHistory([]);
        Lampa.Noty.show('✓ История серверов очищена', {timeout: 2000});
    }

    function removeLastFromHistory() {
        var history = getHistory();
        if (history.length > 0) {
            var removed = history.pop();
            saveHistory(history);
            Lampa.Noty.show('✓ Удален: ' + removed, {timeout: 2000});
        } else {
            Lampa.Noty.show('История пуста', {timeout: 2000});
        }
    }

    function removeCurrentFromHistory() {
        var current = Lampa.Storage.get('location_server');
        if (!current) return;
        var history = getHistory();
        var index = history.indexOf(current);
        if (index !== -1) {
            history.splice(index, 1);
            saveHistory(history);
            Lampa.Noty.show('✓ Текущий сервер удален из истории', {timeout: 2000});
            
            if (history.length > 0) {
                Lampa.Storage.set('location_server', history[0]);
                var $switcher = $('#SERVER_SWITCHER');
                if ($switcher.length) {
                    $switcher.attr('title', 'Текущий сервер: ' + history[0]);
                }
            }
        }
    }

    function showHistory() {
        var history = getHistory();
        if (history.length > 0) {
            var msg = 'История серверов:\n' + history.map(function(s, i) { 
                return (i+1) + '. ' + s; 
            }).join('\n');
            Lampa.Noty.show(msg, {timeout: 5000});
        } else {
            Lampa.Noty.show('История пуста', {timeout: 2000});
        }
    }
    // ===============================================

    // Переключение сервера
    function switchServer() {
        var current = Lampa.Storage.get('location_server');
        if (!current) {
            Lampa.Noty.show('Сначала укажите сервер в настройках');
            return;
        }
        
        var history = getHistory();
        
        if (!Array.isArray(history) || history.length < 2) {
            // Не создаем дефолтный сервер! Просим пользователя добавить
            Lampa.Noty.show('Добавьте второй сервер в настройках', {timeout: 3000});
            return;
        }
        
        var currentIndex = history.indexOf(current);
        if (currentIndex === -1) {
            history.unshift(current);
            if (history.length > 5) history.pop();
            saveHistory(history);
            currentIndex = 0;
        }
        
        var nextIndex = (currentIndex + 1) % history.length;
        var nextServer = history[nextIndex];
        
        Lampa.Storage.set('location_server', nextServer);
        var $switcher = $('#SERVER_SWITCHER');
        if ($switcher.length) {
            $switcher.attr('title', 'Текущий сервер: ' + nextServer);
        }
        Lampa.Noty.show('✓ Сервер: ' + nextServer, {timeout: 3500});
    }

    function startMe() {
        try {
            if (!window.redirect_initialized) {
                $('#REDIRECT, #SERVER_SWITCHER').remove();
                
                var domainBUTT = '<div id="REDIRECT" class="head__action selector redirect-screen">' + icon_server_redirect + '</div>';
                $('#app > div.head > div > div.head__actions').append(domainBUTT);
                $('#REDIRECT').insertAfter('div.head__action.selector.open--settings');
                
                var switcherBUTT = '<div id="SERVER_SWITCHER" class="head__action selector server-switcher" title="Быстрое переключение сервера">' + 
                    '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>' + 
                    '</div>';
                
                $('#REDIRECT').after(switcherBUTT);
                
                $('#SERVER_SWITCHER').on('hover:enter hover:click hover:touch', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    switchServer();
                });
                
                $('#REDIRECT').on('hover:enter hover:click hover:touch', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    var server = Lampa.Storage.get('location_server');
                    if (server && typeof server === 'string') {
                        window.location.href = server_protocol + server;
                    }
                });
                
                window.redirect_initialized = true;
            }
            
            var currentServer = Lampa.Storage.get('location_server');
            if (currentServer && typeof currentServer === 'string') {
                addToHistory(currentServer);
                var $switcher = $('#SERVER_SWITCHER');
                if ($switcher.length) {
                    $switcher.attr('title', 'Текущий сервер: ' + currentServer);
                }
            }
            
            if (!window.settings_added) {
                Lampa.SettingsApi.addComponent({
                    component: 'location_redirect',
                    name: 'Смена сервера',
                    icon: icon_server_redirect
                });
                
                // Основные настройки - БЕЗ DEFAULT!
                Lampa.SettingsApi.addParam({
                    component: 'location_redirect',
                    param: {
                        name: 'location_server',
                        type: 'input',
                        placeholder: 'Введите адрес сервера (например: server.online)',
                        default: ''
                    },
                    field: {
                        name: 'Адрес сервера',
                        description: 'Введите домен без http://'
                    },
                    onChange: function(value) {
                        if (value && typeof value === 'string' && value.trim() !== '') {
                            addToHistory(value);
                        }
                        if (value == '') {
                            $('#REDIRECT').remove();
                        } else {
                            var $switcher = $('#SERVER_SWITCHER');
                            if ($switcher.length) {
                                $switcher.attr('title', 'Текущий сервер: ' + value);
                            }
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
                        description: 'Зажмите ВНИЗ при загрузке для отключения'
                    }
                });

                // УПРАВЛЕНИЕ ИСТОРИЕЙ
                Lampa.SettingsApi.addParam({
                    component: 'location_redirect',
                    param: {
                        name: 'history_header',
                        type: 'header'
                    },
                    field: {
                        name: '📋 ИСТОРИЯ СЕРВЕРОВ',
                        description: 'Хранится последних 5 серверов'
                    }
                });

                Lampa.SettingsApi.addParam({
                    component: 'location_redirect',
                    param: {
                        name: 'show_history',
                        type: 'trigger',
                        default: false
                    },
                    field: {
                        name: '📜 Показать историю',
                        description: 'Показать все сохраненные серверы'
                    },
                    onChange: function() {
                        showHistory();
                    }
                });

                Lampa.SettingsApi.addParam({
                    component: 'location_redirect',
                    param: {
                        name: 'remove_current',
                        type: 'trigger',
                        default: false
                    },
                    field: {
                        name: '🗑️ Удалить текущий сервер из истории',
                        description: 'Удаляет только текущий сервер из списка'
                    },
                    onChange: function() {
                        removeCurrentFromHistory();
                    }
                });

                Lampa.SettingsApi.addParam({
                    component: 'location_redirect',
                    param: {
                        name: 'remove_last',
                        type: 'trigger',
                        default: false
                    },
                    field: {
                        name: '🗑️ Удалить самый старый сервер',
                        description: 'Удаляет последний сервер из истории'
                    },
                    onChange: function() {
                        removeLastFromHistory();
                    }
                });

                Lampa.SettingsApi.addParam({
                    component: 'location_redirect',
                    param: {
                        name: 'clear_history',
                        type: 'trigger',
                        default: false
                    },
                    field: {
                        name: '⚠️ Очистить всю историю',
                        description: 'Удаляет ВСЕ сохраненные серверы'
                    },
                    onChange: function() {
                        clearAllHistory();
                    }
                });
                
                window.settings_added = true;
            }

            Lampa.Keypad.listener.follow("keydown", function(e) {
                if (e.code === 40 || e.code === 29461) {
                    Lampa.Storage.set('const_redirect', false);
                }
            });

            setTimeout(function() {
                if (Lampa.Storage.field('const_redirect') == true) {
                    var server = Lampa.Storage.get('location_server');
                    if (server && typeof server === 'string') {
                        window.location.href = server_protocol + server;
                    }
                }
            }, 300);
            
        } catch(e) {
            console.log('Redirect plugin error:', e);
        }
    }
    
    if (window.appready) startMe();
    else {
        Lampa.Listener.follow('app', function(e) {
            if (e.type == 'ready') startMe();
        });
    }
    
})();
