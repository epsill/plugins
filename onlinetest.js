// online_movies_plugin.js
// Рабочий плагин для онлайн просмотра фильмов

(function() {
    if (window.online_movies_plugin) return;
    window.online_movies_plugin = true;
    
    console.log('Online Movies Plugin loading...');
    
    // Минимальный рабочий плагин
    function initPlugin() {
        // Ждем когда Lampa полностью загрузится
        Lampa.Listener.follow('app', function(e) {
            if (e.type == 'ready') {
                addOnlineButton();
            }
        });
        
        // Также добавляем кнопку при открытии карточки фильма
        Lampa.Listener.follow('full', function(e) {
            if (e.type == 'complite') {
                setTimeout(function() {
                    addButtonToCard(e);
                }, 100);
            }
        });
    }
    
    // Добавляем кнопку в карточку фильма
    function addButtonToCard(e) {
        try {
            var movie = e.data.movie;
            var render = e.object.activity.render();
            var playSection = render.find('.button--play');
            
            if (playSection.length && !playSection.find('.online-movies-btn').length) {
                var button = $('<div class="selector online-movies-btn" style="margin: 0 10px; padding: 8px 15px; background: rgba(255,215,0,0.2); border-radius: 5px; display: flex; align-items: center;">' +
                    '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 8px;">' +
                    '<path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path>' +
                    '</svg>' +
                    '<span>Смотреть онлайн</span>' +
                    '</div>');
                
                button.on('hover:enter', function() {
                    openOnlineSources(movie);
                });
                
                playSection.before(button);
            }
        } catch (err) {
            console.error('Error adding button:', err);
        }
    }
    
    // Открываем окно с источниками
    function openOnlineSources(movie) {
        var title = movie.title || movie.original_title || movie.name;
        var year = movie.year || '';
        var searchQuery = encodeURIComponent(title + ' ' + year);
        
        // Список источников
        var sources = [
            {
                name: 'VidSrc',
                url: 'https://vidsrc.me/embed/latest',
                quality: 'HD',
                search: 'https://vidsrc.me/videosearch?q=' + searchQuery
            },
            {
                name: '2Embed',
                url: 'https://www.2embed.to/embed/tmdb/movie/latest',
                quality: 'HD',
                search: 'https://www.2embed.to/embed/tmdb/search?query=' + searchQuery
            },
            {
                name: 'SuperEmbed',
                url: 'https://multiembed.mov/directstream.php?video_id=latest&tmdb=1',
                quality: 'HD'
            },
            {
                name: 'Filmix',
                url: 'https://filmix.ac',
                quality: 'FHD',
                search: 'https://filmix.ac/search/' + searchQuery
            }
        ];
        
        // Создаем модальное окно
        var modalHtml = '<div style="padding: 20px;">';
        modalHtml += '<div style="font-size: 1.2em; margin-bottom: 20px; color: #ffd700;">Выберите источник для просмотра</div>';
        
        sources.forEach(function(source, index) {
            modalHtml += '<div class="selector source-item" data-index="' + index + '" style="padding: 15px; margin: 10px 0; background: rgba(255,255,255,0.1); border-radius: 5px; border: 1px solid rgba(255,255,255,0.2);">';
            modalHtml += '<div style="font-weight: bold; font-size: 1.1em;">' + source.name + '</div>';
            modalHtml += '<div style="color: #aaa; margin-top: 5px;">Качество: ' + source.quality + '</div>';
            modalHtml += '</div>';
        });
        
        modalHtml += '</div>';
        
        Lampa.Modal.open({
            title: 'Онлайн источники: ' + title,
            html: modalHtml,
            size: 'medium',
            onReady: function(modal) {
                modal.render.find('.source-item').on('hover:enter', function() {
                    var index = $(this).data('index');
                    var source = sources[index];
                    
                    // Если есть поисковый URL, используем его
                    var url = source.search || source.url;
                    
                    // Запускаем плеер
                    Lampa.Player.play({
                        title: title,
                        files: [{
                            title: source.name + ' (' + source.quality + ')',
                            url: url,
                            quality: source.quality,
                            format: 'iframe'
                        }],
                        poster: movie.poster || '',
                        subtitle: 'Источник: ' + source.name
                    });
                    
                    Lampa.Modal.close();
                });
            }
        });
    }
    
    // Добавляем кнопку в главное меню
    function addOnlineButton() {
        // Добавляем в боковое меню если есть
        setTimeout(function() {
            if (Lampa.Menu && Lampa.Menu.left) {
                var menuItems = Lampa.Menu.left.items;
                var hasOnlineItem = menuItems.some(function(item) {
                    return item.name && item.name.includes('Online');
                });
                
                if (!hasOnlineItem) {
                    Lampa.Menu.left.add({
                        name: 'Фильмы онлайн',
                        component: 'online_movies_component',
                        icon: 'online'
                    });
                }
            }
        }, 2000);
    }
    
    // Создаем компонент для онлайн просмотра
    var onlineComponent = {
        template: {
            url: '',
            html: '',
            type: 'none'
        },
        
        controller: function(params) {
            var self = this;
            var activity = Lampa.Activity.active();
            
            self.render = activity.render();
            self.params = params || {};
            
            self.init = function() {
                var html = '<div style="padding: 20px;">';
                html += '<h1 style="color: #ffd700; margin-bottom: 20px;">Фильмы онлайн</h1>';
                html += '<p style="color: #ccc; margin-bottom: 30px;">Выберите источник для поиска фильмов:</p>';
                
                var sources = [
                    { name: 'Filmix', url: 'https://filmix.ac', icon: '🎬' },
                    { name: 'HDRezka', url: 'https://hdrezka.ag', icon: '🎥' },
                    { name: 'VidSrc', url: 'https://vidsrc.me', icon: '📺' },
                    { name: '2Embed', url: 'https://2embed.to', icon: '🔗' }
                ];
                
                sources.forEach(function(source, index) {
                    html += '<div class="selector source-select" data-url="' + source.url + '" style="padding: 15px; margin: 10px 0; background: rgba(255,255,255,0.05); border-radius: 8px; display: flex; align-items: center;">';
                    html += '<span style="font-size: 1.5em; margin-right: 15px;">' + source.icon + '</span>';
                    html += '<div>';
                    html += '<div style="font-weight: bold; font-size: 1.1em;">' + source.name + '</div>';
                    html += '<div style="color: #aaa; font-size: 0.9em;">' + source.url + '</div>';
                    html += '</div>';
                    html += '</div>';
                });
                
                html += '</div>';
                
                self.render.html(html);
                
                // Обработчики для выбора источника
                self.render.find('.source-select').on('hover:enter', function() {
                    var url = $(this).data('url');
                    
                    // Открываем плеер с выбранным источником
                    Lampa.Player.play({
                        title: 'Онлайн кинотеатр',
                        files: [{
                            title: 'Главная страница',
                            url: url,
                            quality: 'HD',
                            format: 'iframe'
                        }]
                    });
                });
                
                // Добавляем фокус
                setTimeout(function() {
                    Lampa.Controller.add('content', self.render);
                    self.render.find('.source-select').first().trigger('focus');
                }, 100);
            };
            
            self.init();
            return self;
        }
    };
    
    // Регистрируем компонент
    Lampa.Component.add('online_movies_component', onlineComponent);
    
    // Запускаем плагин
    if (window.Lampa) {
        initPlugin();
        console.log('Online Movies Plugin loaded successfully!');
    } else {
        document.addEventListener('lampa-loaded', initPlugin);
    }

})();
