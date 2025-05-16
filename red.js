(function() {
    'use strict';

    // 1. Добавляем скрытую кнопку в iframe, который сохраняется при переходах
    var persistentButton = document.createElement('iframe');
    persistentButton.id = 'persistentButtonFrame';
    persistentButton.style.position = 'fixed';
    persistentButton.style.bottom = '20px';
    persistentButton.style.right = '20px';
    persistentButton.style.width = '50px';
    persistentButton.style.height = '50px';
    persistentButton.style.border = 'none';
    persistentButton.style.zIndex = '99999';
    persistentButton.style.opacity = '0';
    persistentButton.style.transition = 'opacity 0.3s';
    
    // Загружаем в iframe страницу с кнопкой
    persistentButton.src = 'data:text/html;charset=utf-8,' + 
        encodeURIComponent(`
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { margin: 0; background: transparent; }
                    #secretBtn {
                        width: 40px; height: 40px;
                        background: rgba(0,0,0,0.5);
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 0px;
                        transition: all 0.3s;
                        cursor: pointer;
                        color: white;
                    }
                    #secretBtn:hover {
                        font-size: 20px;
                        background: rgba(0,0,0,0.8);
                    }
                </style>
            </head>
            <body>
                <div id="secretBtn">⚙️</div>
                <script>
                    document.getElementById('secretBtn').addEventListener('click', function() {
                        parent.postMessage('showServerMenu', '*');
                    });
                </script>
            </body>
            </html>
        `);
    
    document.body.appendChild(persistentButton);

    // 2. Обработчик сообщений от iframe
    window.addEventListener('message', function(e) {
        if (e.data === 'showServerMenu') {
            showServerSelectionMenu();
        }
    });

    // 3. Функция показа меню (должна быть доступна на всех серверах)
    function showServerSelectionMenu() {
        // Удаляем старое меню если есть
        $('#SERVER_SELECTION').remove();
        
        // Создаем HTML для меню выбора серверов
        var menuHTML = `
            <div id="SERVER_SELECTION" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                background-color: rgba(0,0,0,0.9); display: flex; flex-direction: column; 
                justify-content: center; align-items: center; z-index: 9999;">
                <div style="color: white; font-size: 24px; margin-bottom: 30px;">
                    Выберите сервер
                </div>
        `;
        
        // Добавляем кнопки для каждого сервера
        servers.forEach(function(server, index) {
            menuHTML += `
                <button onclick="parent.selectServer(${index})"
                        style="margin: 10px; padding: 15px 30px; font-size: 20px; min-width: 300px; 
                               background-color: #333; color: white; border: none; 
                               border-radius: 5px; cursor: pointer;">
                    ${server.name} (${server.url.replace(/^https?:\/\//, '')})
                </button>
            `;
        });
        
        menuHTML += `</div>`;
        
        // Добавляем меню в основной документ
        document.body.insertAdjacentHTML('beforeend', menuHTML);
    }

    // 4. Функция выбора сервера (должна быть доступна на всех серверах)
    window.selectServer = function(index) {
        var selectedServer = servers[index];
        localStorage.setItem('selectedServer', JSON.stringify(selectedServer));
        window.location.href = selectedServer.url;
    };

    // 5. Инициализация - показываем кнопку после загрузки
    window.addEventListener('load', function() {
        setTimeout(function() {
            document.getElementById('persistentButtonFrame').style.opacity = '1';
        }, 3000);
    });

})();
