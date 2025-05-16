(function () {
    'use strict';

    // Cache WebOS check
    var isWebOS = navigator.userAgent.match(/WebOS|webOS|webos|WEBOS/i) ? true : false;

    // Основной объект плагина
    var InterFaceMod = {
        name: 'interface_mod',
        version: '2.2.2', // Updated version
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
            webos_simple_mode: isWebOS // Default to true if WebOS
        }
    };

    // Упрощенные стили для WebOS - moved to top level for better performance
    var webOSStyles = {
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

    // Модифицированная функция добавления информации о сезонах
    function addSeasonInfo() {
        Lampa.Listener.follow('full', function (data) {
            if (data.type === 'complite' && data.data.movie.number_of_seasons) {
                if (InterFaceMod.settings.seasons_info_mode === 'none') return;
                
                var movie = data.data.movie;
                var status = movie.status;
                var totalSeasons = movie.number_of_seasons || 0;
                var totalEpisodes = movie.number_of_episodes || 0;
                
                // Calculate aired seasons/episodes
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

                // Create info element
                var infoElement = $('<div class="season-info-label"></div>');
                var styles = InterFaceMod.settings.webos_simple_mode && isWebOS ? 
                    webOSStyles.label : {
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
                
                // Add text (fixed syntax error)
                var text = airedSeasons + ' сез. ' + airedEpisodes + ' сер.';
                if (status !== 'Ended' && status !== 'Canceled') {
                    text += ' из ' + totalEpisodes;
                }
                infoElement.text(text);

                // Add to poster with requestAnimationFrame for better performance
                requestAnimationFrame(function() {
                    var poster = $(data.object.activity.render()).find('.full-start-new__poster, .full-start__poster').first();
                    if (poster.length) {
                        poster.css('position', 'relative');
                        poster.append(infoElement);
                    }
                });
            }
        });
    }

    // Optimized button display function
    function showAllButtons() {
        var style = document.getElementById('interface_mod_buttons_style') || document.createElement('style');
        style.id = 'interface_mod_buttons_style';
        
        var css = InterFaceMod.settings.webos_simple_mode && isWebOS ? 
            '.full-start-new__buttons, .full-start__buttons { display: flex !important; flex-wrap: wrap !important; gap: 8px !important; }' :
            '.full-start-new__buttons, .full-start__buttons { display: flex !important; flex-wrap: wrap !important; gap: 10px !important; }';
        
        style.innerHTML = css;
        if (!document.getElementById('interface_mod_buttons_style')) {
            document.head.appendChild(style);
        }
    }

    // Start plugin function
    function startPlugin() {
        // Add WebOS setting
        if (isWebOS) {
            Lampa.SettingsApi.addParam({
                component: 'season_info',
                param: {
                    name: 'webos_simple_mode',
                    type: 'trigger',
                    default: true
                },
                field: {
                    name: 'Упрощенный режим для WebOS',
                    description: 'Упрощает анимации и эффекты для лучшей совместимости'
                },
                onChange: function (value) {
                    InterFaceMod.settings.webos_simple_mode = value;
                    Lampa.Settings.update();
                    setTimeout(() => location.reload(), 300); // Smooth reload
                }
            });
        }

        // Initialize other plugin features
        addSeasonInfo();
        showAllButtons();
    }

    // Plugin initialization
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
