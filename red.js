(function() {
    'use strict';

    // 1. Инициализация
    function initPlugin() {
        // Проверяем, что Lampa загружена
        if (typeof Lampa === 'undefined') {
            setTimeout(initPlugin, 100);
            return;
        }

        // Инициализация TV-режима
        Lampa.Platform.tv();

        // 2. Конфигурация серверов
        const servers = [
            { 
                name: 'Сервер 1', 
                url: 'http://185.105.117.217:12160/',
                testPath: '/test'
            },
            { 
                name: 'Сервер 2', 
                url: 'http://my.bylampa.online/',
                testPath: '/test'
            },
            { 
                name: 'Сервер 3', 
                url: 'http://bylampa.online/',
                testPath: '/test'
            }
        ];

        // 3. Глобальные переменные
        let currentSelection = 0;
        let menuActive = false;
        const storageKey = 'lampa_redirect_selected_server';
        const holdDuration = 2000; // 2 секунды для удержания кнопки

        // 4. Универсальное хранилище
        const storage = {
            get: () => {
                const saved = localStorage.getItem(storageKey);
                return saved ? JSON.parse(saved) : null;
            },
            set: (server) => {
                localStorage.setItem(storageKey, JSON.stringify(server));
            }
        };

        // 5. Проверка доступности сервера
        async function checkServer(server) {
            try {
                const testUrl = server.url + (server.testPath || '/test');
                const response = await fetch(testUrl, {method: 'HEAD', cache: 'no-store'});
                return response.ok;
            } catch (e) {
                return false;
            }
        }

        // 6. Функции меню
        function createMenu() {
            // Удаляем старое меню если есть
            const oldMenu = document.getElementById('server-selection-menu');
            if (oldMenu) oldMenu.remove();

            // Создаем новое меню
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
                btn.textContent = server.name;
                btn.style.cssText = `
                    margin: 10px;
                    padding: 15px 30px;
                    font-size: 20px;
                    min-width: 300px;
                    background: ${index === 0 ? '#4CAF50' : '#333'};
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    position: relative;
                `;

                // Индикатор статуса
                const status = document.createElement('span');
                status.style.cssText = 'position: absolute; right: 10px;';
                status.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#777"/></svg>';
                btn.appendChild(status);

                // Проверка доступности
                checkServer(server).then(isAvailable => {
                    status.querySelector('circle').setAttribute('fill', isAvailable ? '#4CAF50' : '#f44336');
                    if (!isAvailable) btn.style.opacity = '0.6';
                });

                btn.addEventListener('click', () => {
                    if (btn.style.opacity !== '0.6') selectServer(server);
                });

                menu.appendChild(btn);
            });

            document.body.appendChild(menu);
            menuActive = true;
            currentSelection = 0;
            highlightSelected();
        }

        function highlightSelected() {
            const buttons = document.querySelectorAll('#server-selection-menu button');
            buttons.forEach((btn, index) => {
                btn.style.backgroundColor = index === currentSelection ? '#4CAF50' : '#333';
            });
        }

        // 7. Выбор сервера
        function selectServer(server) {
            storage.set(server);
            
            // Для WebOS используем iframe
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

        // 8. Обработчики клавиш
        let keyDownTime = 0;

        function handleKeyDown(e) {
            if (e.key === 'ArrowDown') {
                keyDownTime = Date.now();
                setTimeout(() => {
                    if (Date.now() - keyDownTime >= holdDuration - 100) {
                        if (!menuActive) createMenu();
                    }
                }, holdDuration);
            }

            if (menuActive) {
                if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    currentSelection = (currentSelection - 1 + servers.length) % servers.length;
                    highlightSelected();
                } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    currentSelection = (currentSelection + 1) % servers.length;
                    highlightSelected();
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    selectServer(servers[currentSelection]);
                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    document.getElementById('server-selection-menu').remove();
                    menuActive = false;
                }
            }
        }

        function handleKeyUp(e) {
            if (e.key === 'ArrowDown') {
                keyDownTime = 0;
            }
        }

        // 9. Добавление кнопки в интерфейс
        function addInterfaceButton() {
            const buttonExists = document.getElementById('lampa-redirect-button');
            if (buttonExists || !document.querySelector('.head__actions')) {
                setTimeout(addInterfaceButton, 100);
                return;
            }

            const btn = document.createElement('div');
            btn.id = 'lampa-redirect-button';
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

            btn.addEventListener('click', () => createMenu());
            
            const actions = document.querySelector('.head__actions');
            if (actions) actions.appendChild(btn);
        }

        // 10. Основная логика запуска
        function start() {
            document.addEventListener('keydown', handleKeyDown);
            document.addEventListener('keyup', handleKeyUp);
            
            addInterfaceButton();

            const savedServer = storage.get();
            if (savedServer) {
                checkServer(savedServer).then(isAvailable => {
                    if (!isAvailable) createMenu();
                });
            } else {
                createMenu();
            }
        }

        // Запускаем после полной загрузки
        if (document.readyState === 'complete') {
            start();
        } else {
            window.addEventListener('load', start);
        }
    }

    // Запуск плагина
    if (typeof window.appready !== 'undefined' && window.appready) {
        initPlugin();
    } else {
        const checkLampa = setInterval(() => {
            if (typeof Lampa !== 'undefined') {
                clearInterval(checkLampa);
                initPlugin();
            }
        }, 100);
    }
})();  
