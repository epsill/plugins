(function () {
    'use strict';

    // Плагин парольной защиты для Lampa
    const PasswordPlugin = {
        name: 'password_protection',
        version: '1.0.0',
        password: null,
        isLocked: true,
        
        init: function() {
            // Проверяем сохраненный пароль
            this.password = localStorage.getItem('lampa_password');
            
            if (this.password) {
                // Если пароль установлен, проверяем блокировку
                this.isLocked = localStorage.getItem('lampa_locked') === 'true';
                
                if (this.isLocked) {
                    this.showPasswordScreen();
                } else {
                    this.unlockApp();
                }
            } else {
                // Пароль не установлен, предлагаем создать
                this.showSetupScreen();
            }
            
            // Добавляем пункт в меню настроек
            this.addSettingsMenuItem();
        },
        
        showPasswordScreen: function() {
            // Создаем экран ввода пароля
            const overlay = document.createElement('div');
            overlay.id = 'password_overlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.95);
                z-index: 9999;
                display: flex;
                justify-content: center;
                align-items: center;
                flex-direction: column;
            `;
            
            overlay.innerHTML = `
                <div style="color: white; font-size: 24px; margin-bottom: 20px;">
                    Введите пароль
                </div>
                <input type="password" id="password_input" 
                       style="padding: 10px; font-size: 18px; width: 200px; border-radius: 5px; border: none;">
                <button id="password_submit" 
                        style="margin-top: 15px; padding: 10px 20px; font-size: 16px; border-radius: 5px; border: none; background: #2196F3; color: white;">
                    Разблокировать
                </button>
                <div id="password_error" style="color: red; margin-top: 10px; display: none;">
                    Неверный пароль!
                </div>
            `;
            
            document.body.appendChild(overlay);
            
            // Обработчики событий
            document.getElementById('password_submit').addEventListener('click', () => {
                this.checkPassword();
            });
            
            document.getElementById('password_input').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.checkPassword();
                }
            });
        },
        
        checkPassword: function() {
            const input = document.getElementById('password_input');
            const error = document.getElementById('password_error');
            
            if (input.value === this.password) {
                this.unlockApp();
                document.getElementById('password_overlay').remove();
            } else {
                error.style.display = 'block';
                input.value = '';
                input.focus();
            }
        },
        
        showSetupScreen: function() {
            const overlay = document.createElement('div');
            overlay.id = 'setup_overlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.95);
                z-index: 9999;
                display: flex;
                justify-content: center;
                align-items: center;
                flex-direction: column;
            `;
            
            overlay.innerHTML = `
                <div style="color: white; font-size: 24px; margin-bottom: 20px;">
                    Установите пароль для приложения
                </div>
                <input type="password" id="new_password" placeholder="Новый пароль"
                       style="padding: 10px; font-size: 18px; width: 200px; margin-bottom: 10px; border-radius: 5px; border: none;">
                <input type="password" id="confirm_password" placeholder="Повторите пароль"
                       style="padding: 10px; font-size: 18px; width: 200px; border-radius: 5px; border: none;">
                <button id="setup_submit" 
                        style="margin-top: 15px; padding: 10px 20px; font-size: 16px; border-radius: 5px; border: none; background: #4CAF50; color: white;">
                    Сохранить пароль
                </button>
                <div id="setup_error" style="color: red; margin-top: 10px; display: none;">
                    Пароли не совпадают или слишком короткие!
                </div>
            `;
            
            document.body.appendChild(overlay);
            
            document.getElementById('setup_submit').addEventListener('click', () => {
                const newPass = document.getElementById('new_password').value;
                const confirmPass = document.getElementById('confirm_password').value;
                
                if (newPass.length >= 4 && newPass === confirmPass) {
                    this.password = newPass;
                    localStorage.setItem('lampa_password', newPass);
                    localStorage.setItem('lampa_locked', 'false');
                    document.getElementById('setup_overlay').remove();
                    this.unlockApp();
                } else {
                    document.getElementById('setup_error').style.display = 'block';
                }
            });
        },
        
        unlockApp: function() {
            this.isLocked = false;
            localStorage.setItem('lampa_locked', 'false');
            
            // Разрешаем работу приложения
            if (window.lampa_settings) {
                window.lampa_settings.read_only = false;
            }
        },
        
        lockApp: function() {
            this.isLocked = true;
            localStorage.setItem('lampa_locked', 'true');
            location.reload(); // Перезагружаем для блокировки
        },
        
        changePassword: function() {
            const newPass = prompt('Введите новый пароль (минимум 4 символа):');
            if (newPass && newPass.length >= 4) {
                this.password = newPass;
                localStorage.setItem('lampa_password', newPass);
                alert('Пароль изменен!');
            }
        },
        
        addSettingsMenuItem: function() {
            // Ждем загрузки интерфейса
            setTimeout(() => {
                // Ищем меню настроек и добавляем свой пункт
                this.addToMenu();
            }, 3000);
        },
        
        addToMenu: function() {
            // Здесь нужно адаптировать под конкретную структуру Lampa
            // Это примерный код, который может потребовать адаптации
            const menu = document.querySelector('.settings-menu, .main-menu');
            
            if (menu) {
                const passwordItem = document.createElement('div');
                passwordItem.className = 'menu-item';
                passwordItem.innerHTML = `
                    <div style="padding: 10px; display: flex; justify-content: space-between; align-items: center;">
                        <span>Защита паролем</span>
                        <button id="lock_app" style="padding: 5px 10px; background: #ff4444; color: white; border: none; border-radius: 3px;">
                            Заблокировать
                        </button>
                    </div>
                    <div style="padding: 10px;">
                        <button id="change_password" style="padding: 5px 10px; margin-right: 10px; background: #2196F3; color: white; border: none; border-radius: 3px;">
                            Сменить пароль
                        </button>
                        <button id="remove_password" style="padding: 5px 10px; background: #ff4444; color: white; border: none; border-radius: 3px;">
                            Удалить пароль
                        </button>
                    </div>
                `;
                
                menu.appendChild(passwordItem);
                
                // Обработчики кнопок
                document.getElementById('lock_app').addEventListener('click', () => {
                    if (confirm('Заблокировать приложение?')) {
                        this.lockApp();
                    }
                });
                
                document.getElementById('change_password').addEventListener('click', () => {
                    this.changePassword();
                });
                
                document.getElementById('remove_password').addEventListener('click', () => {
                    if (confirm('Удалить парольную защиту?')) {
                        localStorage.removeItem('lampa_password');
                        localStorage.removeItem('lampa_locked');
                        alert('Пароль удален!');
                        location.reload();
                    }
                });
            }
        }
    };

    // Инициализация плагина при загрузке страницы
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            PasswordPlugin.init();
        });
    } else {
        PasswordPlugin.init();
    }

    // Экспортируем плагин для доступа из консоли (опционально)
    window.LampaPasswordPlugin = PasswordPlugin;

})();