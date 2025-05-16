(function() {
    'use strict';

    // 1. Список серверов
    var servers = [
        { name: 'Сервер 1', url: 'http://185.105.117.217:12160/' },
        { name: 'Сервер 2', url: 'http://my.bylampa.online/' },
        { name: 'Сервер 3', url: 'http://bylampa.online/' }
    ];

    // 2. Создаем кнопку в основном интерфейсе
    function createControlButton() {
        // Проверяем, есть ли уже кнопка
        if (document.getElementById('server-switcher-btn')) return;
        
        var btn = document.createElement('div');
        btn.id = 'server-switcher-btn';
        btn.innerHTML = '🔄';
        btn.style.position = 'fixed';
        btn.style.bottom = '20px';
        btn.style.right = '20px';
        btn.style.width = '40px';
        btn.style.height = '40px';
        btn.style.backgroundColor = 'rgba(0,0,0,0.5)';
        btn.style.borderRadius = '50%';
        btn.style.display = 'flex';
        btn.style.alignItems = 'center';
        btn.style.justifyContent = 'center';
        btn.style.fontSize = '20px';
        btn.style.zIndex = '99999';
        btn.style.cursor = 'pointer';
        
        btn.addEventListener('click', showServerMenu);
        
        document.body.appendChild(btn);
    }

    // 3. Функция показа меню
    function showServerMenu() {
        // Удаляем старое меню если есть
        var oldMenu = document.getElementById('server-selection-menu');
        if (oldMenu) oldMenu.remove();
        
        // Создаем меню
        var menu = document.createElement('div');
        menu.id = 'server-selection-menu';
        menu.style.position = 'fixed';
        menu.style.top = '0';
        menu.style.left = '0';
        menu.style.width = '100%';
        menu.style.height = '100%';
        menu.style.backgroundColor = 'rgba(0,0,0,0.9)';
        menu.style.display = 'flex';
        menu.style.flexDirection = 'column';
        menu.style.justifyContent = 'center';
        menu.style.alignItems = 'center';
        menu.style.zIndex = '99998';
        
        // Заголовок
        var title = document.createElement('div');
        title.textContent = 'Выберите сервер';
        title.style.color = 'white';
        title.style.fontSize = '24px';
        title.style.marginBottom = '30px';
        menu.appendChild(title);
        
        // Кнопки серверов
        servers.forEach(function(server) {
            var btn = document.createElement('button');
            btn.textContent = server.name;
            btn.style.margin = '10px';
            btn.style.padding = '15px 30px';
            btn.style.fontSize = '20px';
            btn.style.minWidth = '300px';
            btn.style.backgroundColor = '#4CAF50';
            btn.style.color = 'white';
            btn.style.border = 'none';
            btn.style.borderRadius = '5px';
            btn.style.cursor = 'pointer';
            
            btn.addEventListener('click', function() {
                switchToServer(server.url);
            });
            
            menu.appendChild(btn);
        });
        
        // Кнопка закрытия
        var closeBtn = document.createElement('button');
        closeBtn.textContent = 'Закрыть';
        closeBtn.style.marginTop = '20px';
        closeBtn.style.padding = '10px 20px';
        closeBtn.style.backgroundColor = '#f44336';
        closeBtn.addEventListener('click', function() {
            menu.remove();
        });
        menu.appendChild(closeBtn);
        
        document.body.appendChild(menu);
    }

    // 4. Переключение серверов
    function switchToServer(url) {
        // Сохраняем выбор
        localStorage.setItem('selectedServer', url);
        
        // Для WebOS используем стандартный переход
        window.location.href = url;
    }

    // 5. Инициализация
    function init() {
        // Ждем загрузки основного интерфейса
        var checkReady = setInterval(function() {
            if (document.querySelector('#app')) {
                clearInterval(checkReady);
                createControlButton();
                
                // Если сервер не выбран, показываем меню
                if (!localStorage.getItem('selectedServer')) {
                    setTimeout(showServerMenu, 1000);
                }
            }
        }, 100);
    }

    // Запускаем при полной загрузке страницы
    if (document.readyState === 'complete') {
        init();
    } else {
        window.addEventListener('load', init);
    }
})();
