// plugin_filmix.js
// Плагин для просмотра фильмов и сериалов через Filmix и другие источники

(function() {
    // Проверяем, не загружен ли уже плагин
    if(window.filmix_plugin) return;
    window.filmix_plugin = true;
    
    const manifest = {
        name: 'Filmix Online',
        version: '1.0.0',
        description: 'Плагин для просмотра фильмов и сериалов из бесплатных источников'
    };

    // Основной компонент плагина
    const component = {
        template: {
            url: '',
            html: '',
            type: 'none'
        },
        
        controller: function(params) {
            let self = this;
            let activity = Lampa.Activity.active();
            
            self.render = activity.render();
            self.params = params || {};
            self.movie = params.movie || {};
            self.search = params.search || '';
            self.page = params.page || 1;
            self.results = [];
            self.loading = false;
            self.selected = null;
            self.sources = [];
            
            // Инициализация
            self.init = function() {
                console.log('Filmix Online plugin initialized');
                
                // Добавляем шаблоны
                addTemplates();
                
                // Загружаем результаты
                self.loadResults();
                
                // Устанавливаем фокус
                setTimeout(() => {
                    if(self.render.find('.card').length) {
                        Lampa.Controller.add('content', self.render);
                        Lampa.Controller.collection(self.render.find('.card'));
                        self.render.find('.card').first().trigger('hover:focus');
                    }
                }, 100);
            };
            
            // Поиск контента
            self.loadResults = function() {
                self.loading = true;
                updateView();
                
                // Ищем фильмы по разным источникам
                searchFilms(self.search, self.page).then(results => {
                    self.results = results;
                    self.loading = false;
                    updateView();
                }).catch(error => {
                    console.error('Search error:', error);
                    self.loading = false;
                    updateView();
                });
            };
            
            // Выбор элемента
            self.selectItem = function(item) {
                self.selected = item;
                self.loadSources(item);
            };
            
            // Загрузка источников для просмотра
            self.loadSources = function(item) {
                self.loading = true;
                updateView();
                
                getFilmSources(item).then(sources => {
                    self.sources = sources;
                    self.loading = false;
                    updateView();
                    
                    // Автовыбор первого источника
                    if(sources.length > 0) {
                        setTimeout(() => {
                            self.playSource(sources[0]);
                        }, 100);
                    }
                });
            };
            
            // Воспроизведение источника
            self.playSource = function(source) {
                console.log('Playing source:', source);
                
                // Создаем плеер
                Lampa.Player.play({
                    title: self.selected?.title || self.search,
                    files: [{
                        title: source.title,
                        url: source.url,
                        quality: source.quality,
                        headers: source.headers || {},
                        format: source.format || 'mp4'
                    }],
                    poster: self.selected?.poster || '',
                    kinopoisk: self.selected?.kinopoisk_id || '',
                    imdb: self.selected?.imdb_id || ''
                });
            };
            
            // Обновление отображения
            function updateView() {
                let html = '';
                
                if(self.loading) {
                    html = '<div class="content-loading"></div>';
                }
                else if(self.selected) {
                    // Показываем источники
                    html = '<div class="card card--height">';
                    html += '<div class="card__title">' + (self.selected.title || self.selected.name) + '</div>';
                    
                    if(self.selected.poster) {
                        html += '<div class="card__poster"><img src="' + self.selected.poster + '"></div>';
                    }
                    
                    html += '<div class="card__subtitle">Выберите источник:</div>';
                    
                    self.sources.forEach((source, index) => {
                        html += '<div class="selector card__source" data-index="' + index + '">';
                        html += '<div class="card__source-title">' + source.title + '</div>';
                        html += '<div class="card__source-quality">' + source.quality + '</div>';
                        html += '</div>';
                    });
                    
                    html += '</div>';
                }
                else {
                    // Показываем результаты поиска
                    html = '<div class="card card--height">';
                    html += '<div class="card__title">Результаты поиска: ' + self.search + '</div>';
                    
                    if(self.results.length === 0) {
                        html += '<div class="card__empty">Ничего не найдено</div>';
                    }
                    else {
                        self.results.forEach((item, index) => {
                            html += '<div class="selector card__item" data-index="' + index + '">';
                            html += '<div class="card__item-poster"><img src="' + (item.poster || '') + '"></div>';
                            html += '<div class="card__item-info">';
                            html += '<div class="card__item-title">' + (item.title || item.name) + '</div>';
                            html += '<div class="card__item-year">' + (item.year || '') + '</div>';
                            html += '<div class="card__item-description">' + (item.description || '').substring(0, 100) + '...</div>';
                            html += '</div>';
                            html += '</div>';
                        });
                    }
                    
                    html += '</div>';
                }
                
                self.render.html(html);
                
                // Добавляем обработчики событий
                self.render.find('.card__item, .card__source').on('hover:enter', function() {
                    let index = $(this).data('index');
                    
                    if(self.selected) {
                        // Выбор источника
                        self.playSource(self.sources[index]);
                    }
                    else {
                        // Выбор фильма
                        self.selectItem(self.results[index]);
                    }
                });
            }
            
            self.init();
            return self;
        }
    };
    
    // Функции для работы с источниками
    
    // Поиск фильмов по разным источникам
    async function searchFilms(query, page = 1) {
        const results = [];
        
        try {
            // Пробуем несколько источников
            const sources = [
                searchFilmix(query, page),
                searchVideocdn(query, page),
                searchKodik(query, page)
            ];
            
            const allResults = await Promise.allSettled(sources);
            
            allResults.forEach(result => {
                if(result.status === 'fulfilled' && result.value) {
                    results.push(...result.value);
                }
            });
            
            // Убираем дубликаты
            const uniqueResults = [];
            const seenIds = new Set();
            
            results.forEach(item => {
                const id = item.id || (item.title + item.year);
                if(!seenIds.has(id)) {
                    seenIds.add(id);
                    uniqueResults.push(item);
                }
            });
            
            return uniqueResults.slice(0, 50); // Ограничиваем количество
        }
        catch(error) {
            console.error('Search films error:', error);
            return [];
        }
    }
    
    // Поиск на Filmix
    async function searchFilmix(query, page) {
        try {
            // Используем прокси для обхода CORS
            const url = `https://corsproxy.io/?${encodeURIComponent(`https://filmix.ac/find/${query}?page=${page}`)}`;
            
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
                }
            });
            
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            const items = [];
            const filmElements = doc.querySelectorAll('.short-story');
            
            filmElements.forEach(element => {
                const titleElement = element.querySelector('.short-title');
                const posterElement = element.querySelector('.short-poster img');
                const linkElement = element.querySelector('.short-title a');
                
                if(titleElement && linkElement) {
                    const title = titleElement.textContent.trim();
                    const href = linkElement.getAttribute('href');
                    const poster = posterElement ? posterElement.getAttribute('src') : '';
                    
                    // Извлекаем ID из ссылки
                    const idMatch = href.match(/\/film\/(\d+)-/);
                    const id = idMatch ? idMatch[1] : href;
                    
                    // Пытаемся извлечь год из заголовка
                    const yearMatch = title.match(/\((\d{4})\)/);
                    const year = yearMatch ? yearMatch[1] : '';
                    
                    items.push({
                        id: id,
                        title: title.replace(/\(\d{4}\)/, '').trim(),
                        year: year,
                        poster: poster.startsWith('//') ? 'https:' + poster : poster,
                        description: '',
                        source: 'filmix',
                        url: 'https://filmix.ac' + href
                    });
                }
            });
            
            return items;
        }
        catch(error) {
            console.error('Filmix search error:', error);
            return [];
        }
    }
    
    // Поиск на VideoCDN
    async function searchVideocdn(query, page) {
        try {
            const url = `https://corsproxy.io/?${encodeURIComponent(`https://videocdn.tv/api/short?api_token=some_token&query=${query}&page=${page}`)}`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            if(data.data && Array.isArray(data.data)) {
                return data.data.map(item => ({
                    id: item.id,
                    title: item.ru_title || item.en_title || item.original_title,
                    year: item.year,
                    poster: item.poster,
                    description: item.content,
                    kinopoisk_id: item.kinopoisk_id,
                    imdb_id: item.imdb_id,
                    source: 'videocdn'
                }));
            }
            
            return [];
        }
        catch(error) {
            console.error('VideoCDN search error:', error);
            return [];
        }
    }
    
    // Поиск на Kodik
    async function searchKodik(query, page) {
        try {
            const url = `https://corsproxy.io/?${encodeURIComponent(`https://kodikapi.com/search?token=demo&title=${query}&page=${page}`)}`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            if(data.results && Array.isArray(data.results)) {
                return data.results.map(item => ({
                    id: item.id,
                    title: item.title,
                    year: item.year,
                    poster: item.material_data?.poster_url || '',
                    description: item.material_data?.description || '',
                    kinopoisk_id: item.material_data?.kinopoisk_id,
                    imdb_id: item.material_data?.imdb_id,
                    source: 'kodik'
                }));
            }
            
            return [];
        }
        catch(error) {
            console.error('Kodik search error:', error);
            return [];
        }
    }
    
    // Получение источников для фильма
    async function getFilmSources(item) {
        const sources = [];
        
        try {
            // В зависимости от источника используем разные методы
            switch(item.source) {
                case 'filmix':
                    const filmixSources = await getFilmixSources(item);
                    sources.push(...filmixSources);
                    break;
                    
                case 'videocdn':
                    const videocdnSources = await getVideoCDNSources(item);
                    sources.push(...videocdnSources);
                    break;
                    
                case 'kodik':
                    const kodikSources = await getKodikSources(item);
                    sources.push(...kodikSources);
                    break;
            }
            
            // Если не нашли источников, пробуем альтернативные методы
            if(sources.length === 0) {
                const altSources = await getAlternativeSources(item);
                sources.push(...altSources);
            }
            
            return sources;
        }
        catch(error) {
            console.error('Get sources error:', error);
            return [];
        }
    }
    
    // Источники с Filmix
    async function getFilmixSources(item) {
        try {
            const url = `https://corsproxy.io/?${encodeURIComponent(item.url || `https://filmix.ac/film/${item.id}`)}`;
            
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Referer': 'https://filmix.ac/'
                }
            });
            
            const html = await response.text();
            
            // Парсим страницу для получения ссылок на видео
            // Это упрощенный парсинг, реальная реализация требует более сложного парсинга
            const sources = [];
            
            // Ищем iframe с видео
            const iframeMatch = html.match(/<iframe[^>]+src="([^"]+)"/);
            if(iframeMatch) {
                const iframeUrl = iframeMatch[1];
                
                // Добавляем разные качества (в реальности нужно парсить доступные качества)
                sources.push({
                    title: 'Filmix (1080p)',
                    quality: 'FHD',
                    url: iframeUrl,
                    headers: {
                        'Referer': 'https://filmix.ac/',
                        'Origin': 'https://filmix.ac'
                    },
                    format: 'iframe'
                });
            }
            
            // Ищем прямые ссылки на видео
            const videoMatches = html.match(/https?:\/\/[^"']+\.(mp4|m3u8|mkv)[^"']*/gi);
            if(videoMatches) {
                videoMatches.forEach((videoUrl, index) => {
                    sources.push({
                        title: `Прямая ссылка ${index + 1}`,
                        quality: videoUrl.includes('1080') ? 'FHD' : videoUrl.includes('720') ? 'HD' : 'SD',
                        url: videoUrl,
                        headers: {
                            'Referer': 'https://filmix.ac/'
                        },
                        format: videoUrl.includes('.m3u8') ? 'hls' : 'mp4'
                    });
                });
            }
            
            return sources;
        }
        catch(error) {
            console.error('Filmix sources error:', error);
            return [];
        }
    }
    
    // Источники с VideoCDN
    async function getVideoCDNSources(item) {
        try {
            // Используем API VideoCDN
            const url = `https://corsproxy.io/?${encodeURIComponent(`https://videocdn.tv/api/movie?api_token=demo&kinopoisk_id=${item.kinopoisk_id}`)}`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            if(data.data && data.data.iframe_src) {
                return [{
                    title: 'VideoCDN',
                    quality: 'HD',
                    url: data.data.iframe_src,
                    headers: {
                        'Referer': 'https://videocdn.tv/'
                    },
                    format: 'iframe'
                }];
            }
            
            return [];
        }
        catch(error) {
            console.error('VideoCDN sources error:', error);
            return [];
        }
    }
    
    // Альтернативные источники через внешние сервисы
    async function getAlternativeSources(item) {
        const sources = [];
        
        try {
            // Пробуем получить через vidsrc
            const vidsrcUrl = `https://vidsrc.me/embed/${item.imdb_id || ''}`;
            if(item.imdb_id) {
                sources.push({
                    title: 'VidSrc',
                    quality: 'HD',
                    url: vidsrcUrl,
                    format: 'iframe'
                });
            }
            
            // Пробуем через 2embed
            const twoembedUrl = `https://www.2embed.to/embed/tmdb/movie/${item.id}`;
            sources.push({
                title: '2Embed',
                quality: 'HD',
                url: twoembedUrl,
                format: 'iframe'
            });
            
            return sources;
        }
        catch(error) {
            console.error('Alternative sources error:', error);
            return [];
        }
    }
    
    // Добавление шаблонов
    function addTemplates() {
        Lampa.Template.add('filmix_card', `
            <div class="card card--height selector">
                <div class="card__title">{title}</div>
                <div class="card__poster">
                    <img src="{poster}" onerror="this.src='data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\"/>'">
                </div>
                <div class="card__info">
                    <div class="card__year">{year}</div>
                    <div class="card__description">{description}</div>
                </div>
            </div>
        `);
        
        Lampa.Template.add('filmix_source', `
            <div class="source-item selector">
                <div class="source-item__title">{title}</div>
                <div class="source-item__quality">{quality}</div>
            </div>
        `);
    }
    
    // Добавление кнопки в интерфейс
    function addButton() {
