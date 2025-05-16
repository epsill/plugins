(function() {
    'use strict';

    // 1. Инициализация плагина
    function initPlugin() {
        // Проверяем, что Lampa загружена
        if (typeof Lampa === 'undefined') {
            setTimeout(initPlugin, 100);
            return;
        }

        // Включаем TV-режим
        Lampa.Platform.tv();

        // 2. Конфигурация серверов
        const servers = [
            { 
                id: 'server1',
                name: 'Сервер 1', 
                url: 'http://185.105.117.217:12160/',
                testPath: '/ping'
            },
            { 
                id: 'server2',
                name: 'Сервер 2', 
                url: 'http://my.bylampa.online/',
                testPath: '/ping'
            },
            { 
                id: 'server3',
                name: 'Сервер 3', 
                url: 'http://bylampa.online/',
                testPath: '/ping'
            }
        ];

        // 3. Состояние плагина
        const state = {
            currentSelection: 0,
            menuActive: false,
            keyHoldTimer: null,
            storageKey: 'lampa_redirect_last_server_v2'
        };

        // 4. Управление хранилищем
        const storage = {
            get: () => {
                try {
                    const saved = localStorage.getItem(state.storageKey);
                    return saved ? JSON.parse(saved) : null;
                } catch (e) {
                    return null;
                }
            },
            set: (server) => {
                localStorage.setItem(state.storageKey, JSON.stringify(server));
            },
            clear: () => {
                localStorage.removeItem(state.storageKey);
            }
        };

        // 5. Проверка доступности сервера
        async function checkServer(server) {
            try {
                const testUrl = server.url + (server.testPath || '/ping') + '?t=' + Date.now();
                const response = await fetch(testUrl, {
                    method: 'HEAD',
                    mode: 'no-cors',
                    cache: 'no-store'
                });
                return true;
            } catch (e) {
                return false;
            }
        }

        // 6. Управление меню выбора
        function showMenu() {
            if (state.menuActive) return;
            
            // Создаем элемент меню
            const menu = document.createElement('div');
            menu.id = 'server-selection-menu';
            menu.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.95);
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                z-index: 9999;
            `;

            // Заголовок
            const title = document.createElement('div');
            title.textContent = 'Выберите сервер';
            title.style.cssText = 'color: white; font-size: 28px; margin-bottom: 30px;';
            menu.appendChild(title);

            // Кнопки серверов
            servers.forEach((server, index) => {
                const btn = document.createElement('button');
                btn.id = server.id;
                btn.textContent = `${server.name} (${new URL(server.url).host})`;
                btn.style.cssText = `
                    margin: 15px;
                    padding: 20px 40px;
                    font-size: 22px;
                    min-width: 350px;
                    background: ${index === 0 ? '#4CAF50' : '#333'};
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    position: relative;
                    transition: all 0.3s;
                `;

                // Индикатор статуса
                const status = document.createElement('span');
                status.style.cssText = 'position: absolute; right: 15px; top: 50%; transform: translateY(-50%);';
                status.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#777"/></svg>';
                btn.appendChild(status);

                // Проверка доступности
                checkServer(server).then(available => {
                    status.querySelector('circle').setAttribute('fill', available ? '#4CAF50' : '#f44336');
                    if (!available) {
                        btn.style.opacity = '0.6';
                        btn.title = 'Сервер недоступен';
                    }
                });

                btn.addEventListener('click', () => selectServer(server));
                menu.appendChild(btn);
            });

            document.body.appendChild(menu);
            state.menuActive = true;
            state.currentSelection = 0;
            updateSelection();
        }

        function hideMenu() {
            const menu = document.getElementById('server-selection-menu');
            if (menu) menu.remove();
            state.menuActive = false;
        }

        function updateSelection() {
            const buttons = document.querySelectorAll('#server-selection-menu button');
            buttons.forEach((btn, index) => {
                btn.style.backgroundColor = index === state.currentSelection ? '#4CAF50' : '#333';
                btn.style.transform = index === state.currentSelection ? 'scale(1.05)' : 'scale(1)';
            });
        }

        function moveSelection(direction) {
            state.currentSelection = (state.currentSelection + direction + servers.length) % servers.length;
            updateSelection();
        }

        // 7. Выбор сервера
        async function selectServer(server) {
            // Сохраняем выбор
            storage.set(server);
            
            // Показываем статус загрузки
            const status = document.createElement('div');
            status.textContent = 'Переход на сервер...';
            status.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                color: white;
                font-size: 24px;
                z-index: 10000;
            `;
            document.body.appendChild(status);

            // Для WebOS используем iframe
            if (/WebOS/i.test(navigator.userAgent)) {
                const iframe = document.createElement('iframe');
                iframe.style.display = 'none';
                iframe.src = server.url;
                document.body.appendChild(iframe);
            }

            // Переход с задержкой
            setTimeout(() => {
                window.location.href = server.url;
            }, 1000);
        }

        // 8. Обработчики событий
        function handleKeyDown(e) {
            // Удержание DOWN (2 секунды) для открытия меню
            if (e.key === 'ArrowDown' && !state.menuActive) {
                state.keyHoldTimer = setTimeout(() => {
                    showMenu();
                }, 2000);
            }

            // Навигация в меню
            if (state.menuActive) {
                if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    moveSelection(-1);
                } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    moveSelection(1);
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    selectServer(servers[state.currentSelection]);
                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    hideMenu();
                }
            }
        }

        function handleKeyUp(e) {
            if (e.key === 'ArrowDown') {
                clearTimeout(state.keyHoldTimer);
            }
        }

        // 9. Добавление кнопки в интерфейс
        function addInterfaceButton() {
            const buttonExists = document.getElementById('lampa-server-switcher');
            if (buttonExists) return;

            const btn = document.createElement('div');
            btn.id = 'lampa-server-switcher';
            btn.innerHTML = '⚙️';
            btn.style.cssText = `
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                cursor: pointer;
                margin-left: 20px;
                transition: transform 0.3s;
            `;

            btn.addEventListener('mouseover', () => {
                btn.style.transform = 'scale(1.2)';
            });

            btn.addEventListener('mouseout', () => {
                btn.style.transform = 'scale(1)';
            });

            btn.addEventListener('click', showMenu);
            
            const actions = document.querySelector('.head__actions');
            if (actions) {
                actions.appendChild(btn);
            } else {
                setTimeout(addInterfaceButton, 100);
            }
        }

        // 10. Основная логика запуска
        async function start() {
            // Регистрируем обработчики
            document.addEventListener('keydown', handleKeyDown);
            document.addEventListener('keyup', handleKeyUp);
            
            // Добавляем кнопку в интерфейс
            addInterfaceButton();

            // Проверяем сохраненный сервер
            const savedServer = storage.get();
            if (savedServer) {
                const isAvailable = await checkServer(savedServer);
                if (!isAvailable) {
                    showMenu();
                }
            } else {
                showMenu();
            }
        }

        // Запускаем после полной загрузки
        if (document.readyState === 'complete') {
            start();
        } else {
            window.addEventListener('load', start);
        }
    }

    // Инициализация плагина
    if (window.appready) {
        initPlugin();
    } else {
        const readyCheck = setInterval(() => {
            if (typeof Lampa !== 'undefined' && typeof window.appready !== 'undefined') {
                clearInterval(readyCheck);
                initPlugin();
            }
        }, 100);
    }
})();
