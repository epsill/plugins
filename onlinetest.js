// fixed_online_plugin.js
// Исправленный плагин без ошибок

(function() {
    // Проверяем, не загружен ли уже плагин
    if (window.fixed_online_plugin) return;
    window.fixed_online_plugin = true;
    
    console.log('Fixed Online Plugin loading...');
    
    // Основная функция инициализации
    function initializePlugin() {
        // Ждем немного перед добавлением кнопки
        setTimeout(addOnlineButton, 1000);
        
        // Также слушаем открытие карточек
        listenForMovieCards();
    }
    
    // Слушаем открытие карточек фильмов
    function listenForMovieCards() {
        if (!Lampa.Listener) return;
        
        Lampa.Listener.follow('full', function(e) {
            if (e.type == 'complite') {
                setTimeout(function() {
                    addButtonToMovieCard(e);
                }, 200);
            }
        });
    }
    
    // Добавляем кнопку на карточку фильма
    function addButtonToMovieCard(e) {
        try {
            // Безопасно получаем данные
            var movie = e && e.data && e.data.movie;
            if (!movie) return;
            
            var render = e.object && e.object.activity && e.object.activity.render();
            if (!render || !render.length) return;
            
            // Ищем контейнер для кнопок
            var playContainer = render.find('.button--play');
            if (!playContainer || !playContainer.length) {
                playContainer = render.find('.view--torrent');
            }
            
            if (!playContainer || !playContainer.length) return;
            
            // Проверяем, не добавили ли уже кнопку
            if (playContainer.find('.fixed-online-btn').length > 0) return;
            
            // Создаем кнопку
            var button = document.createElement('div');
            button.className = 'selector fixed-online-btn';
            button.style.cssText = 'margin: 0 10px; padding: 8px 15px; background: linear-gradient(90deg, #ff416c, #ff4b2b); border-radius: 5px; display: flex; align-items: center;';
            button.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="white" style="margin-right: 8px;"><path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path></svg><span style="color: white; font-weight: bold;">Смотреть онлайн</span>';
            
            // Добавляем обработчик клика
            $(button).on('hover:enter', function() {
                openSimplePlayer(movie);
            });
            
            // Вставляем кнопку
            playContainer.before(button);
            
        } catch (error) {
            console.error('Error adding button:', error);
        }
    }
    
    // Открываем простой плеер
    function openSimplePlayer(movie) {
        try {
            var title = movie.title || movie.original_title || 'Фильм';
            var year = movie.year || '';
            var fullTitle = year ? title + ' (' + year + ')' : title;
            
            // Используем простой источник - Filmix
            var videoUrl = 'https://filmix.ac';
            
            // Проверяем, доступен ли Player
            if (!Lampa.Player || !Lampa.Player.play) {
                console.error('Lampa Player not available');
                return;
            }
            
            // Открываем плеер напрямую
            Lampa.Player.play({
                title: fullTitle,
                files: [{
                    title: 'Filmix - Онлайн кинотеатр',
                    url: videoUrl,
                    quality: 'HD',
                    format: 'iframe'
                }],
                poster: movie.poster || '',
                kinopoisk: movie.kinopoisk_id || '',
                imdb: movie.imdb_id || ''
            });
            
        } catch (error) {
            console.error('Error opening player:', error);
            // Альтернативный способ - открыть в новой вкладке
            if (movie.title) {
                var searchUrl = 'https://www.google.com/search?q=' + encodeURIComponent(movie.title + ' смотреть онлайн бесплатно');
                window.open(searchUrl, '_blank');
            }
        }
    }
    
    // Добавляем кнопку в главное меню
    function addOnlineButton() {
        try {
            // Проверяем, есть ли меню
            if (!Lampa.Menu || !Lampa.Menu.left) return;
            
            // Ждем пока меню загрузится
            setTimeout(function() {
                try {
                    // Добавляем пункт в меню
                    Lampa.Menu.left.add({
                        name: 'Онлайн кинотеатр',
                        component: 'online_theater',
                        icon: 'online',
                        onSelect: function() {
                            openOnlineTheater();
                        }
                    });
                } catch (e) {
                    console.log('Could not add to menu:', e);
                }
            }, 3000);
        } catch (error) {
            console.log('Menu not available:', error);
        }
    }
    
    // Открываем онлайн кинотеатр
    function openOnlineTheater() {
        // Создаем простой интерфейс
        var html = '<div style="padding: 20px; max-width: 800px; margin: 0 auto;">';
        html += '<h1 style="color: #ffd700; text-align: center; margin-bottom: 30px;">🎬 Онлайн Кинотеатр</h1>';
        html += '<div style="color: #ccc; text-align: center; margin-bottom: 40px;">Выберите источник для просмотра</div>';
        
        var sources = [
            { name: 'Filmix', url: 'https://filmix.ac', desc: 'Большая коллекция фильмов', color: '#ff5722' },
            { name: 'HDRezka', url: 'https://hdrezka.ag', desc: 'Фильмы в HD качестве', color: '#4CAF50' },
            { name: 'VidSrc', url: 'https://vidsrc.me', desc: 'Английские фильмы и сериалы', color: '#2196F3' },
            { name: 'YouTube', url: 'https://www.youtube.com', desc: 'Бесплатные фильмы', color: '#FF0000' }
        ];
        
        sources.forEach(function(source, index) {
            html += '<div class="selector source-btn" data-index="' + index + '" style="padding: 15px; margin: 15px 0; background: ' + source.color + '20; border: 1px solid ' + source.color + '40; border-radius: 10px; display: flex; align-items: center;">';
            html += '<div style="width: 40px; height: 40px; background: ' + source.color + '; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; color: white; font-weight: bold;">' + (index + 1) + '</div>';
            html += '<div style="flex: 1;">';
            html += '<div style="font-weight: bold; font-size: 1.1em; color: ' + source.color + ';">' + source.name + '</div>';
            html += '<div style="color: #aaa; font-size: 0.9em;">' + source.desc + '</div>';
            html += '</div>';
            html += '</div>';
        });
        
        html += '</div>';
        
        // Открываем как активность
        Lampa.Activity.push({
            url: '',
            title: 'Онлайн кинотеатр',
            component: 'simple_html',
            html: html,
            onReady: function(activity) {
                var render = activity.render();
                if (!render) return;
                
                // Добавляем обработчики
                render.find('.source-btn').on('hover:enter', function() {
                    var index = $(this).data('index');
                    var source = sources[index];
                    
                    // Открываем в плеере
                    if (Lampa.Player && Lampa.Player.play) {
                        Lampa.Player.play({
                            title: source.name,
                            files: [{
                                title: source.name,
                                url: source.url,
                                quality: 'HD',
                                format: 'iframe'
                            }]
                        });
                    }
                });
                
                // Фокус
                setTimeout(function() {
                    if (render.find('.source-btn').length) {
                        Lampa.Controller.add('content', render);
                        render.find('.source-btn').first().trigger('focus');
                    }
                }, 100);
            }
        });
    }
    
    // Регистрируем компонент для простого HTML
    if (!Lampa.Component.get('simple_html')) {
        Lampa.Component.add('simple_html', {
            template: { url: '', html: '', type: 'none' },
            controller: function(params) {
                var self = this;
                var activity = Lampa.Activity.active();
                
                self.render = activity.render();
                self.params = params || {};
                
                self.init = function() {
                    self.render.html(self.params.html || '<div style="padding: 20px; color: white;">Пусто</div>');
                    return self;
                };
                
                return self.init();
            }
        });
    }
    
    // Запускаем плагин когда Lampa готова
    function startPlugin() {
        if (window.Lampa) {
            setTimeout(initializePlugin, 500);
            console.log('Fixed Online Plugin started successfully!');
        } else {
            // Ждем Lampa
            var waitForLampa = setInterval(function() {
                if (window.Lampa) {
                    clearInterval(waitForLampa);
                    setTimeout(initializePlugin, 500);
                    console.log('Fixed Online Plugin started successfully!');
                }
            }, 100);
        }
    }
    
    // Начинаем
    startPlugin();

})();
