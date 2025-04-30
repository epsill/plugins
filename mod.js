(function () {
    'use strict';

    // Основной объект плагина
    var InterFaceMod = {
        name: 'interface_mod',
        version: '2.2.1', // Обновленная версия
        debug: false,
        settings: {
            enabled: true,
            buttons_mode: 'default',
            show_movie_type: true,
            theme: 'default',
            colored_ratings: true,
            seasons_info_mode: 'aired',
            show_episodes_on_main: false,
            label_position: 'top-right',
            show_buttons: true,
            colored_elements: true,
            webos_simple_mode: true // Новая настройка для WebOS
        }
    };

    // Функция для проверки WebOS
    function isWebOS() {
        return navigator.userAgent.match(/WebOS|webOS|webos|WEBOS/i);
    }

    // Упрощенные стили для WebOS
    function getWebOSCompatibleStyles() {
        return {
            label: {
                'position': 'absolute',
                'background-color': 'rgba(33, 150, 243, 0.9)',
                'color': 'white',
                'padding': '0.4em 0.6em',
                'border-radius': '0.3em',
                'font-size': '0.8em',
                'z-index': '999',
                'text-align': 'center',
                'white-space': 'nowrap',
                'line-height': '1.2em'
            },
            buttons: {
                'display': 'flex',
                'flex-wrap': 'wrap',
                'gap': '10px'
            }
        };
    }

    // Модифицированная функция добавления информации о сезонах
    function addSeasonInfo() {
        Lampa.Listener.follow('full', function (data) {
            if (data.type === 'complite' && data.data.movie.number_of_seasons) {
                if (InterFaceMod.settings.seasons_info_mode === 'none') return;
                
                var movie = data.data.movie;
                var status = movie.status;
                var totalSeasons = movie.number_of_seasons || 0;
                var totalEpisodes = movie.number_of_episodes || 0;
                
                // Упрощенный расчет для WebOS
                var airedSeasons = totalSeasons;
                var airedEpisodes = totalEpisodes;
                
                if (movie.seasons) {
                    var currentDate = new Date();
                    airedSeasons = 0;
                    airedEpisodes = 0;
                    
                    movie.seasons.forEach(function(season) {
                        if (season.season_number === 0) return;
                        
                        if (season.air_date) {
                            var airDate = new Date(season.air_date);
                            if (airDate <= currentDate) {
                                airedSeasons++;
                                airedEpisodes += season.episode_count || 0;
                            }
                        }
                    });
                }

                // Создаем элемент с упрощенными стилями
                var infoElement = $('<div class="season-info-label"></div>');
                var styles = InterFaceMod.settings.webos_simple_mode && isWebOS() ? 
                    getWebOSCompatibleStyles().label : {
                        'position': 'absolute',
                        'background-color': status === 'Ended' || status === 'Canceled' ? 
                            'rgba(33, 150, 243, 0.8)' : 'rgba(244, 67, 54, 0.8)',
                        'color': 'white',
                        'padding': '0.4em 0.6em',
                        'border-radius': '0.3em',
                        'font-size': '0.8em',
                        'z-index': '999',
                        'text-align': 'center',
                        'white-space': 'nowrap',
                        'line-height': '1.2em',
                        'box-shadow': '0 2px 5px rgba(0, 0, 0, 0.2)'
                    };

                infoElement.css(styles);
                
                // Добавляем текст
                var text = airedSeasons + ' сез. ' + airedEpisodes + ' сер.';
                if (!(status === 'Ended' || status === 'Canceled') {
                    text += ' из ' + totalEpisodes;
                }
                infoElement.text(text);

                // Добавляем на постер
                setTimeout(function() {
                    var poster = $(data.object.activity.render()).find('.full-start-new__poster, .full-start__poster').first();
                    if (poster.length) {
                        poster.css('position', 'relative');
                        poster.append(infoElement);
                    }
                }, 100);
            }
        });
    }

    // Упрощенная функция для отображения кнопок
    function showAllButtons() {
        var style = document.createElement('style');
        style.id = 'interface_mod_buttons_style';
        
        var css = InterFaceMod.settings.webos_simple_mode && isWebOS() ? 
            '.full-start-new__buttons, .full-start__buttons { display: flex !important; flex-wrap: wrap !important; gap: 8px !important; }' :
            '.full-start-new__buttons, .full-start__buttons { display: flex !important; flex-wrap: wrap !important; gap: 10px !important; }';
        
        style.innerHTML = css;
        document.head.appendChild(style);
    }

    // Упрощенные темы для WebOS
    function applyTheme(theme) {
        $('#interface_mod_theme').remove();
        if (theme === 'default') return;

        var style = $('<style id="interface_mod_theme"></style>');
        var themes = {
            // Упрощенная тема для WebOS
            webos_simple: `
                .menu__item.focus, .menu__item.traverse, .menu__item.hover {
                    background: #3498db;
                    color: #fff;
                }
                .card.focus .card__view::after {
                    border: 2px solid #3498db;
                }
            `,
            // Остальные темы...
        };

        // Для WebOS используем упрощенную тему
        if (isWebOS()) {
            theme = 'webos_simple';
        }

        style.html(themes[theme] || '');
        $('head').append(style);
    }

    // Добавляем настройку для WebOS
    function startPlugin() {
        // Автоматически включаем простой режим для WebOS
        if (isWebOS()) {
            InterFaceMod.settings.webos_simple_mode = true;
        }

        // Добавляем параметр в настройки
        Lampa.SettingsApi.addParam({
            component: 'season_info',
            param: {
                name: 'webos_simple_mode',
                type: 'trigger',
                default: isWebOS() // Включено по умолчанию для WebOS
            },
            field: {
                name: 'Упрощенный режим для WebOS',
                description: 'Упрощает анимации и эффекты для лучшей совместимости'
            },
            onChange: function (value) {
                InterFaceMod.settings.webos_simple_mode = value;
                Lampa.Settings.update();
                location.reload(); // Перезагружаем для применения изменений
            }
        });

        // Остальной код инициализации...
    }

    // Остальные функции плагина...

    // Запуск плагина
    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', function (event) {
            if (event.type === 'ready') {
                startPlugin();
            }
        });
    }

    window.season_info = InterFaceMod;
})();