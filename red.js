(function() {
    'use strict';

    // 1. Ожидание загрузки Lampa
    function waitForLampa(callback) {
        if (typeof Lampa !== 'undefined') {
            callback();
        } else {
            setTimeout(() => waitForLampa(callback), 100);
        }
    }

    waitForLampa(() => {
        // 2. Инициализация TV-режима
        Lampa.Platform.tv();

        // 3. Конфигурация серверов
        const servers = [
            { name: 'Сервер 1', url: 'http://185.105.117.217:12160/' },
            { name: 'Сервер 2', url: 'http://my.bylampa.online/' },
            { name: 'Сервер 3', url: 'http://bylampa.online/' }
        ];

        // 4. Состояние плагина
        const state = {
            currentSelection: 0,
            menuActive: false,
            keyHoldTimer: null,
            storageKey: 'lampa_redirect_last_server'
        };

        // 5. Работа с хранилищем
        const storage = {
            get: () => {
                const saved = localStorage.getItem(state.storageKey);
                if (saved) {
                    try {
                        return JSON.parse(saved);
                    } catch (e) {
                        return null;
                    }
                }
                return null;
            },
            set: (server) => {
                localStorage.setItem(state.storageKey, JSON.stringify(server));
            }
        };

        // 6. Проверка доступности сервера
        function checkServer(url) {
            return new Promise((resolve) => {
                const xhr = new XMLHttpRequest();
                xhr.timeout = 3000;
                xhr.open('GET', url + '?check=' + Date.now(), true);
                xhr.onload = () => resolve(xhr.status < 400);
                xhr.onerror = () => resolve(false);
                xhr.ontimeout = () => resolve(false);
                try {
                    xhr.send();
                } catch (e) {
                    resolve(false);
                }
            });
        }

        // 7. Управление меню
        function showMenu() {
            if (state.menuActive) return;

            // Создаем меню
            const menu = document.createElement('div');
            menu.id = 'server-selection-menu';
            menu.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.9);
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                z-index: 9999;
            `;

            // Заголовок
            const title = document.createElement('div');
            title.textContent = 'Выберите сервер';
            title.style.cssText = 'color: white; font-size: 24px; margin-bottom: 30px;';
            menu.appendChild(title);

            // Кнопки серверов
            servers.forEach((server, index) => {
                const btn = document.createElement('button');
                btn.textContent = `${server.name} (${new URL(server.url).host})`;
                btn.dataset.index = index;
                btn.style.cssText = `
                    margin: 10px;
                    padding: 15px 30px;
                    font-size: 20px;
                    min-width: 300px;
                    background: #333;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    position: relative;
                `;

                // Проверка доступности
                checkServer(server.url).then(available => {
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
            updateSelection();
        }

        function hideMenu() {
            const menu = document.getElementById('server-selection-menu');
            if (menu) menu.remove();
            state.menuActive = false;
        }

        // 8. Выбор сервера
        function selectServer(server) {
            storage.set(server);
            
            // Специальная обработка для WebOS
            if (/WebOS/i.test(navigator.userAgent)) {
                const iframe = document.createElement('iframe');
                iframe.style.display = 'none';
                iframe.src = server.url;
                document.body.appendChild(iframe);
                setTimeout(() => {
                    window.location.href = server.url;
                }, 1000);
            } else {
                window.location.href = server.url;
            }
        }

        // 9. Навигация по меню
        function updateSelection() {
            const buttons = document.querySelectorAll('#server-selection-menu button');
            buttons.forEach((btn, index) => {
                btn.style.backgroundColor = index === state.currentSelection ? '#4CAF50' : '#333';
            });
        }

        function moveSelection(direction) {
            state.currentSelection = (state.currentSelection + direction + servers.length) % servers.length;
            updateSelection();
        }

        // 10. Обработчики событий
        function onKeyDown(e) {
            // Удержание DOWN для открытия меню
            if (e.key === 'ArrowDown' && !state.menuActive) {
                state.keyHoldTimer = setTimeout(() => {
                    showMenu();
                }, 1000);
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

        function onKeyUp(e) {
            if (e.key === 'ArrowDown') {
                clearTimeout(state.keyHoldTimer);
            }
        }

        // 11. Добавление кнопки в интерфейс
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
                font-size: 20px;
                cursor: pointer;
                margin-left: 15px;
            `;

            btn.addEventListener('click', showMenu);
            
            const actions = document.querySelector('.head__actions');
            if (actions) {
                actions.appendChild(btn);
            } else {
                setTimeout(addInterfaceButton, 100);
            }
        }

        // 12. Инициализация плагина
        function init() {
            // Обработчики клавиш
            document.addEventListener('keydown', onKeyDown);
            document.addEventListener('keyup', onKeyUp);

            // Кнопка в интерфейсе
            addInterfaceButton();

            // Проверка сохраненного сервера
            const savedServer = storage.get();
            if (savedServer) {
                checkServer(savedServer.url).then(available => {
                    if (!available) showMenu();
                });
            } else {
                showMenu();
            }
        }

        // Запуск после полной загрузки
        if (document.readyState === 'complete') {
            init();
        } else {
            window.addEventListener('load', init);
        }
    });
})();
