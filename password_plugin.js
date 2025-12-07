(function () {
    'use strict';

    // Плагин парольной защиты для Lampa
    const PasswordPlugin = {
        name: 'password_protection',
        version: '2.0.0',
        password: null,
        isLocked: false,
        sessionTimeout: 30 * 60 * 1000, // 30 минут бездействия
        lastActivity: Date.now(),
        
        init: function() {
            console.log('Password Plugin: Initializing...');
            
            // Загружаем сохраненный пароль
            this.password = localStorage.getItem('lampa_password');
            
            // Проверяем, нужно ли показывать пароль
            this.checkLockStatus();
            
            // Слушаем события активности
            this.setupActivityTracking();
            
            // Добавляем пункт в меню настроек
            this.addSettingsMenuItem();
        },
        
        checkLockStatus: function() {
            const isUnlocked = sessionStorage.getItem('lampa_session_unlocked');
            const lastLock = localStorage.getItem('lampa_last_lock');
            const now = Date.now();
            
            if (this.password) {
                // Если есть активная сессия - пропускаем
                if (isUnlocked === 'true') {
                    console.log('Password Plugin: Session is active');
                    this.isLocked = false;
                    this.startSessionTimer();
                    return;
                }
                
                // Проверяем авто-блокировку
                if (lastLock && (now - parseInt(lastLock)) > this.sessionTimeout) {
                    console.log('Password Plugin: Session expired');
                    this.isLocked = true;
                } else {
                    this.isLocked = localStorage.getItem('lampa_locked') === 'true';
                }
                
                if (this.isLocked) {
                    console.log('Password Plugin: App is locked, showing password screen');
                    this.showPasswordScreen();
                } else {
                    console.log('Password Plugin: App is unlocked');
                    this.startSession();
                }
            } else {
                // Пароль не установлен
                console.log('Password Plugin: No password set, showing setup');
                this.showSetupScreen();
            }
        },
        
        showPasswordScreen: function() {
            // Если уже есть экран пароля - не создаем новый
            if (document.getElementById('password_overlay')) {
                return;
            }
            
            // Блокируем интерфейс Lampa
            if (window.lampa_settings) {
                window.lampa_settings.read_only = true;
            }
            
            // Скрываем основной интерфейс
            const appElements = document.querySelectorAll('body > *:not(#password_overlay)');
            appElements.forEach(el => {
                if (el.style) el.style.display = 'none';
            });
            
            // Создаем экран ввода пароля
            const overlay = document.createElement('div');
            overlay.id = 'password_overlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                z-index: 999999;
                display: flex;
                justify-content: center;
                align-items: center;
                flex-direction: column;
                font-family: Arial, sans-serif;
            `;
            
            overlay.innerHTML = `
                <div style="text-align: center; margin-bottom: 40px;">
                    <div style="color: #fff; font-size: 32px; font-weight: bold; margin-bottom: 10px;">
                        🔒 Lampa
                    </div>
                    <div style="color: #aaa; font-size: 16px;">
                        Требуется пароль для доступа
                    </div>
                </div>
                
                <div style="background: rgba(255,255,255,0.1); padding: 30px; border-radius: 15px; backdrop-filter: blur(10px);">
                    <div style="color: #fff; font-size: 20px; margin-bottom: 20px; text-align: center;">
                        Введите пароль
                    </div>
                    
                    <input type="password" id="password_input" 
                           placeholder="••••••••"
                           autocomplete="off"
                           style="padding: 15px; font-size: 18px; width: 250px; 
                                  border-radius: 8px; border: 2px solid #3498db;
                                  background: rgba(255,255,255,0.1); 
                                  color: white; text-align: center;
                                  letter-spacing: 5px;">
                    
                    <button id="password_submit" 
                            style="margin-top: 20px; padding: 15px 30px; font-size: 16px; 
                                   width: 100%; border-radius: 8px; border: none; 
                                   background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
                                   color: white; font-weight: bold; cursor: pointer;
                                   transition: transform 0.2s;">
                        Разблокировать
                    </button>
                    
                    <div id="password_error" 
                         style="color: #e74c3c; margin-top: 15px; text-align: center; 
                                font-size: 14px; display: none;">
                        ❌ Неверный пароль!
                    </div>
                    
                    <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
                        <button id="forgot_password" 
                                style="background: none; border: none; color: #95a5a6; 
                                       font-size: 14px; cursor: pointer; padding: 5px;">
                            Забыли пароль?
                        </button>
                    </div>
                </div>
                
                <div style="margin-top: 30px; color: #7f8c8d; font-size: 12px; text-align: center;">
                    Для смены пароля зайдите в настройки после входа
                </div>
            `;
            
            document.body.appendChild(overlay);
            
            // Фокус на поле ввода
            setTimeout(() => {
                document.getElementById('password_input').focus();
            }, 100);
            
            // Обработчики событий
            document.getElementById('password_submit').addEventListener('click', () => {
                this.checkPassword();
            });
            
            document.getElementById('password_input').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.checkPassword();
                }
            });
            
            document.getElementById('forgot_password').addEventListener('click', () => {
                if (confirm('Сбросить пароль? Приложение будет перезагружено.')) {
                    localStorage.removeItem('lampa_password');
                    localStorage.removeItem('lampa_locked');
                    sessionStorage.removeItem('lampa_session_unlocked');
                    location.reload();
                }
            });
            
            // Добавляем анимацию
            overlay.style.opacity = '0';
            overlay.style.transition = 'opacity 0.3s';
            setTimeout(() => {
                overlay.style.opacity = '1';
            }, 10);
        },
        
        checkPassword: function() {
            const input = document.getElementById('password_input');
            const error = document.getElementById('password_error');
            const submitBtn = document.getElementById('password_submit');
            
            // Анимация нажатия
            submitBtn.style.transform = 'scale(0.95)';
            setTimeout(() => {
                submitBtn.style.transform = 'scale(1)';
            }, 150);
            
            if (input.value === this.password) {
                // Успешный вход
                this.unlockApp();
            } else {
                // Неверный пароль
                error.style.display = 'block';
                input.value = '';
                input.focus();
                
                // Вибрация (если поддерживается)
                if (navigator.vibrate) {
                    navigator.vibrate(200);
                }
            }
        },
        
        showSetupScreen: function() {
            // Создаем экран установки пароля
            const overlay = document.createElement('div');
            overlay.id = 'setup_overlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                z-index: 999999;
                display: flex;
                justify-content: center;
                align-items: center;
                flex-direction: column;
                font-family: Arial, sans-serif;
            `;
            
            overlay.innerHTML = `
                <div style="text-align: center; margin-bottom: 40px;">
                    <div style="color: #fff; font-size: 32px; font-weight: bold; margin-bottom: 10px;">
                        🔐 Настройка защиты
                    </div>
                    <div style="color: #aaa; font-size: 16px;">
                        Установите пароль для приложения Lampa
                    </div>
                </div>
                
                <div style="background: rgba(255,255,255,0.1); padding: 30px; border-radius: 15px; width: 300px;">
                    <div style="color: #fff; font-size: 18px; margin-bottom: 20px; text-align: center;">
                        Создайте пароль
                    </div>
                    
                    <input type="password" id="new_password" placeholder="Новый пароль (мин. 4 символа)"
                           style="padding: 12px; font-size: 16px; width: 100%; margin-bottom: 15px;
                                  border-radius: 8px; border: 2px solid #2ecc71;
                                  background: rgba(255,255,255,0.1); color: white;">
                    
                    <input type="password" id="confirm_password" placeholder="Повторите пароль"
                           style="padding: 12px; font-size: 16px; width: 100%; margin-bottom: 20px;
                                  border-radius: 8px; border: 2px solid #2ecc71;
                                  background: rgba(255,255,255,0.1); color: white;">
                    
                    <button id="setup_submit" 
                            style="padding: 15px; font-size: 16px; width: 100%;
                                   border-radius: 8px; border: none; 
                                   background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
                                   color: white; font-weight: bold; cursor: pointer;">
                        Сохранить и продолжить
                    </button>
                    
                    <button id="skip_setup" 
                            style="margin-top: 15px; padding: 10px; font-size: 14px; width: 100%;
                                   border-radius: 8px; border: 1px solid #7f8c8d;
                                   background: transparent; color: #7f8c8d; cursor: pointer;">
                        Пропустить (не рекомендуется)
                    </button>
                    
                    <div id="setup_error" 
                         style="color: #e74c3c; margin-top: 15px; text-align: center; 
                                font-size: 14px; display: none;">
                        ❌ Пароли не совпадают или слишком короткие!
                    </div>
                </div>
            `;
            
            document.body.appendChild(overlay);
            
            // Фокус на первом поле
            setTimeout(() => {
                document.getElementById('new_password').focus();
            }, 100);
            
            // Обработчики событий
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
                    // Вибрация
                    if (navigator.vibrate) {
                        navigator.vibrate(200);
                    }
                }
            });
            
            document.getElementById('skip_setup').addEventListener('click', () => {
                if (confirm('Пропустить установку пароля? Приложение будет менее защищено.')) {
                    localStorage.setItem('lampa_password', '');
                    localStorage.setItem('lampa_locked', 'false');
                    document.getElementById('setup_overlay').remove();
                    this.unlockApp();
                }
            });
        },
        
        unlockApp: function() {
            console.log('Password Plugin: Unlocking app...');
            
            // Разблокируем
            this.isLocked = false;
            localStorage.setItem('lampa_locked', 'false');
            
            // Начинаем сессию
            this.startSession();
            
            // Показываем основной интерфейс
            const appElements = document.querySelectorAll('body > *:not(#password_overlay):not(#setup_overlay)');
            appElements.forEach(el => {
                if (el.style) el.style.display = '';
            });
            
            // Удаляем оверлей с анимацией
            const overlay = document.getElementById('password_overlay');
            if (overlay) {
                overlay.style.opacity = '0';
                setTimeout(() => {
                    overlay.remove();
                }, 300);
            }
            
            // Разрешаем работу приложения
            if (window.lampa_settings) {
                window.lampa_settings.read_only = false;
            }
            
            // Уведомление
            this.showNotification('Приложение разблокировано');
        },
        
        startSession: function() {
            console.log('Password Plugin: Starting new session');
            sessionStorage.setItem('lampa_session_unlocked', 'true');
            this.lastActivity = Date.now();
            this.startSessionTimer();
        },
        
        startSessionTimer: function() {
            // Проверяем неактивность каждую минуту
            this.activityInterval = setInterval(() => {
                const inactiveTime = Date.now() - this.lastActivity;
                
                if (inactiveTime > this.sessionTimeout) {
                    console.log('Password Plugin: Session timeout - locking');
                    this.lockApp();
                    clearInterval(this.activityInterval);
                }
            }, 60000); // Проверка каждую минуту
        },
        
        setupActivityTracking: function() {
            // Отслеживаем активность пользователя
            const activityEvents = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
            
            activityEvents.forEach(event => {
                document.addEventListener(event, () => {
                    this.lastActivity = Date.now();
                }, { passive: true });
            });
            
            // Блокировка при закрытии вкладки
            window.addEventListener('beforeunload', () => {
                // Не блокируем полностью, только сбрасываем сессию
                sessionStorage.removeItem('lampa_session_unlocked');
                localStorage.setItem('lampa_last_lock', Date.now().toString());
            });
        },
        
        lockApp: function() {
            console.log('Password Plugin: Locking app');
            this.isLocked = true;
            localStorage.setItem('lampa_locked', 'true');
            localStorage.setItem('lampa_last_lock', Date.now().toString());
            sessionStorage.removeItem('lampa_session_unlocked');
            
            if (this.activityInterval) {
                clearInterval(this.activityInterval);
            }
            
            // Показываем экран блокировки
            this.showPasswordScreen();
        },
        
        showNotification: function(message) {
            // Создаем уведомление
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #2ecc71;
                color: white;
                padding: 15px 25px;
                border-radius: 8px;
                z-index: 1000000;
                font-weight: bold;
                box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                transform: translateX(100%);
                transition: transform 0.3s;
            `;
            notification.textContent = message;
            
            document.body.appendChild(notification);
            
            // Показываем
            setTimeout(() => {
                notification.style.transform = 'translateX(0)';
            }, 10);
            
            // Скрываем через 3 секунды
            setTimeout(() => {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }, 3000);
        },
        
        addSettingsMenuItem: function() {
            // Ждем загрузки интерфейса
            const checkMenu = setInterval(() => {
                // Ищем меню настроек Lampa (адаптируйте селектор под вашу версию)
                const menu = document.querySelector('.settings-list, .menu-container, nav, .navbar');
                
                if (menu && !document.getElementById('password_menu_item')) {
                    clearInterval(checkMenu);
                    this.createMenuItem(menu);
                }
            }, 1000);
        },
        
        createMenuItem: function(menu) {
            const menuItem = document.createElement('div');
            menuItem.id = 'password_menu_item';
            menuItem.className = 'menu-item';
            menuItem.style.cssText = `
                padding: 15px;
                margin: 10px;
                background: rgba(255,255,255,0.05);
                border-radius: 10px;
                border-left: 4px solid #3498db;
            `;
            
            menuItem.innerHTML = `
                <div style="color: white; font-weight: bold; margin-bottom: 10px; font-size: 16px;">
                    🔐 Защита паролем
                </div>
                
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    <button id="lock_now_btn" 
                            st
