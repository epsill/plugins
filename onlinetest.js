// free_movies_plugin.js
// Плагин для просмотра фильмов без API ключей

(function() {
    if(window.free_movies_plugin) return;
    window.free_movies_plugin = true;
    
    const manifest = {
        name: 'Free Movies Online',
        version: '2.0.0',
        description: 'Просмотр фильмов и сериалов через бесплатные источники'
    };
    
    console.log(`Загрузка плагина: ${manifest.name} v${manifest.version}`);

    // Основной компонент
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
            self.searchQuery = params.search || '';
            self.results = [];
            self.loading = false;
            self.selectedItem = null;
            self.sources = [];
            self.currentPage = 1;
            
            // Инициализация
            self.init = function() {
                console.log('Free Movies plugin initialized');
                
                // Создаем интерфейс
                self.createUI();
                
                // Запускаем поиск если есть запрос
                if(self.searchQuery) {
                    self.performSearch();
                }
                
                // Фокус
                setTimeout(() => {
                    Lampa.Controller.add('content', self.render);
                    self.render.find('.search-input').trigger('focus');
                }, 200);
            };
            
            // Создание интерфейса
            self.createUI = function() {
                let html = `
                    <div class="filmix-container">
                        <div class="filmix-header">
                            <div class="filmix-title">${manifest.name}</div>
                            <div class="filmix-search">
                                <input type="text" class="search-input selector" 
                                       value="${self.searchQuery || ''}" 
                                       placeholder="Введите название фильма или сериала...">
                                <button class="search-btn selector">Поиск</button>
                            </div>
                        </div>
                        
                        <div class="filmix-content">
                            <div class="results-container"></div>
                            <div class="loading-container hide">
                                <div class="loading-spinner"></div>
                                <div class="loading-text">Поиск...</div>
                            </div>
                        </div>
                    </div>
                `;
                
                self.render.html(html);
                
                // Обработчики событий
                self.render.find('.search-btn').on('hover:enter', function() {
                    const query = self.render.find('.search-input').val().trim();
                    if(query) {
                        self.searchQuery = query;
                        self.performSearch();
                    }
                });
                
                self.render.find('.search-input').on('keypress', function(e) {
                    if(e.keyCode === 13) { // Enter
                        const query = $(this).val().trim();
                        if(query) {
                            self.searchQuery = query;
                            self.performSearch();
                        }
                    }
                });
            };
            
            // Поиск фильмов
            self.performSearch = function() {
                self.loading = true;
                self.results = [];
                self.selectedItem = null;
                self.updateUI();
                
                // Используем несколько методов поиска
                Promise.any([
                    searchViaVidsrc(self.searchQuery),
                    searchVia2Embed(self.searchQuery),
                    searchViaFilmix(self.searchQuery)
                ]).then(results => {
                    self.results = results || [];
                    self.loading = false;
                    self.updateUI();
                }).catch(error => {
                    console.error('Search failed:', error);
                    self.loading = false;
                    self.results = [{
                        id: 'manual',
                        title: self.searchQuery,
                        year: new Date().getFullYear(),
                        type: 'movie'
                    }];
                    self.updateUI();
                });
            };
            
            // Обновление интерфейса
            self.updateUI = function() {
                const resultsContainer = self.render.find('.results-container');
                const loadingContainer = self.render.find('.loading-container');
                
                if(self.loading) {
                    resultsContainer.hide();
                    loadingContainer.removeClass('hide');
                    return;
                }
                
                loadingContainer.addClass('hide');
                resultsContainer.show();
                
                let html = '';
                
                if(self.selectedItem) {
                    // Показываем источники для выбранного фильма
                    html = self.createSourcesUI();
                } else if(self.results.length > 0) {
                    // Показываем результаты поиска
                    html = '<div class="results-grid">';
                    
                    self.results.forEach((item, index) => {
                        html += `
                            <div class="movie-card selector" data-index="${index}">
                                <div class="movie-poster">
                                    ${item.poster ? `<img src="${item.poster}" onerror="this.style.display='none'">` : 
                                    '<div class="no-poster">🎬</div>'}
                                </div>
                                <div class="movie-info">
                                    <div class="movie-title">${item.title || 'Без названия'}</div>
                                    ${item.year ? `<div class="movie-year">${item.year}</div>` : ''}
                                    ${item.description ? `<div class="movie-desc">${item.description.substring(0, 100)}...</div>` : ''}
                                </div>
                            </div>
                        `;
                    });
                    
                    html += '</div>';
                } else {
                    html = '<div class="no-results">Ничего не найдено. Попробуйте другой запрос.</div>';
                }
                
                resultsContainer.html(html);
                
                // Обработчики для карточек
                self.render.find('.movie-card').on('hover:enter', function() {
                    const index = $(this).data('index');
                    self.selectMovie(self.results[index]);
                });
                
                // Обработчики для источников
                self.render.find('.source-item').on('hover:enter', function() {
                    const index = $(this).data('index');
                    self.playMovie(self.sources[index]);
                });
                
                // Фокус на первом элементе
                setTimeout(() => {
                    const firstItem = self.render.find('.selector').first();
                    if(firstItem.length) {
                        firstItem.trigger('focus');
                        Lampa.Controller.collection(self.render.find('.selector'));
                    }
                }, 50);
            };
            
            // Создание интерфейса источников
            self.createSourcesUI = function() {
                let html = `
                    <div class="movie-details">
                        <button class="back-btn selector">← Назад</button>
                        <div class="selected-movie">
                            <div class="movie-title-large">${self.selectedItem.title}</div>
                            ${self.selectedItem.year ? `<div class="movie-year">${self.selectedItem.year}</div>` : ''}
                        </div>
                        
                        <div class="sources-list">
                            <div class="sources-title">Выберите источник:</div>
                `;
                
                if(self.sources.length === 0) {
                    html += '<div class="no-sources">Загрузка источников...</div>';
                    
                    // Автоматически загружаем источники
                    self.loadSources();
                } else {
                    self.sources.forEach((source, index) => {
                        html += `
                            <div class="source-item selector" data-index="${index}">
                                <div class="source-name">${source.name}</div>
                                <div class="source-quality">${source.quality}</div>
                            </div>
                        `;
                    });
                }
                
                html += '</div></div>';
                return html;
            };
            
            // Выбор фильма
            self.selectMovie = function(movie) {
                self.selectedItem = movie;
                self.sources = [];
                self.updateUI();
            };
            
            // Загрузка источников
            self.loadSources = function() {
                getMovieSources(self.selectedItem).then(sources => {
                    self.sources = sources;
                    self.updateUI();
                });
            };
            
            // Воспроизведение
            self.playMovie = function(source) {
                console.log('Playing from:', source.name);
                
                Lampa.Player.play({
                    title: self.selectedItem.title,
                    files: [{
                        title: `${source.name} (${source.quality})`,
                        url: source.url,
                        quality: source.quality,
                        headers: source.headers || {},
                        format: source.type || 'iframe'
                    }],
                    poster: self.selectedItem.poster || ''
                });
            };
            
            // Обработчик кнопки "Назад"
            self.render.on('click', '.back-btn', function() {
                self.selectedItem = null;
                self.sources = [];
                self.updateUI();
            });
            
            self.init();
            return self;
        }
    };
    
    // ========== ПОИСК БЕЗ API КЛЮЧЕЙ ==========
    
    // Поиск через VidSrc
    async function searchViaVidsrc(query) {
        try {
            // VidSrc использует TMDB ID, но мы можем получить его через поиск
            const searchUrl = `https://vidsrc.me/videos/${encodeURIComponent(query)}`;
            
            const response = await fetch(`https://corsproxy.io/?${encodeURIComponent(searchUrl)}`, {
                headers: {
                    'User-Agent': 'Mozilla/5.0',
                    'Accept': 'text/html'
                }
            });
            
            const html = await response.text();
            const results = [];
            
            // Парсим HTML (упрощенно)
            const titleMatch = html.match(/<title>([^<]+)<\/title>/);
            if(titleMatch && !html.includes('404')) {
                results.push({
                    id: 'vidsrc_' + encodeURIComponent(query),
                    title: query,
                    source: 'vidsrc'
                });
            }
            
            return results;
        } catch(error) {
            console.error('VidSrc search error:', error);
            return [];
        }
    }
    
    // Поиск через 2Embed
    async function searchVia2Embed(query) {
        try {
            // 2Embed тоже использует TMDB
            const searchUrl = `https://www.2embed.to/embed/tmdb/search?query=${encodeURIComponent(query)}`;
            
            const response = await fetch(`https://corsproxy.io/?${encodeURIComponent(searchUrl)}`);
            const html = await response.text();
            
            // Извлекаем данные из страницы
            const results = [];
            const regex = /data-id="(\d+)"[^>]*>([^<]+)</g;
            let match;
            
            while((match = regex.exec(html)) !== null) {
                results.push({
                    id: match[1],
                    title: match[2].trim(),
                    source: '2embed'
                });
            }
            
            return results.slice(0, 10);
        } catch(error) {
            console.error('2Embed search error:', error);
            return [];
        }
    }
    
    // Поиск через Filmix (парсинг)
    async function searchViaFilmix(query) {
        try {
            const searchUrl = `https://filmix.ac/search/${encodeURIComponent(query)}`;
            
            const response = await fetch(`https://corsproxy.io/?${encodeURIComponent(searchUrl)}`, {
                headers: {
                    'User-Agent': 'Mozilla/5.0',
                    'Referer': 'https://filmix.ac/'
                }
            });
            
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            const results = [];
            const items = doc.querySelectorAll('.short-story, .search-item');
            
            items.forEach(item => {
                const titleEl = item.querySelector('.short-title, .search-title');
                const posterEl = item.querySelector('img');
                const linkEl = item.querySelector('a');
                
                if(titleEl && linkEl) {
                    const title = titleEl.textContent.trim();
                    const href = linkEl.getAttribute('href');
                    const poster = posterEl ? posterEl.getAttribute('src') : null;
                    
                    // Извлекаем год из заголовка
                    const yearMatch = title.match(/\((\d{4})\)/);
                    const year = yearMatch ? yearMatch[1] : '';
                    
                    results.push({
                        id: href,
                        title: title.replace(/\(\d{4}\)/, '').trim(),
                        year: year,
                        poster: poster ? (poster.startsWith('//') ? 'https:' + poster : poster) : null,
                        source: 'filmix',
                        url: 'https://filmix.ac' + href
                    });
                }
            });
            
            return results;
        } catch(error) {
            console.error('Filmix search error:', error);
            return [];
        }
    }
    
    // Получение источников для фильма
    async function getMovieSources(movie) {
        const sources = [];
        
        // Пробуем разные бесплатные источники
        const sourcePromises = [
            getVidsrcSource(movie),
            get2EmbedSource(movie),
            getFilmixSource(movie),
            getSuperembedSource(movie)
        ];
        
        try {
            const allSources = await Promise.allSettled(sourcePromises);
            
            allSources.forEach(result => {
                if(result.status === 'fulfilled' && result.value) {
                    sources.push(...result.value);
                }
            });
            
            // Если ничего не нашли, создаем стандартные источники
            if(sources.length === 0) {
                sources.push(...createFallbackSources(movie));
            }
            
            return sources;
        } catch(error) {
            console.error('Error getting sources:', error);
            return createFallbackSources(movie);
        }
    }
    
    // Источник через VidSrc
    async function getVidsrcSource(movie) {
        try {
            // VidSrc поддерживает TMDB ID
            // Если у нас нет ID, используем заглушку
            const vidsrcId = movie.id && movie.id.startsWith('tmdb_') ? 
                movie.id.replace('tmdb_', '') : 'latest';
            
            return [{
                name: 'VidSrc',
                quality: 'HD',
                url: `https://vidsrc.me/embed/${vidsrcId}`,
                type: 'iframe'
            }];
        } catch(error) {
            return [];
        }
    }
    
    // Источник через 2Embed
    async function get2EmbedSource(movie) {
        try {
            return [{
                name: '2Embed',
                quality: 'HD',
                url: `https://www.2embed.to/embed/tmdb/movie/${movie.id || 'latest'}`,
                type: 'iframe'
            }];
        } catch(error) {
            return [];
        }
    }
    
    // Источник через SuperEmbed
    async function getSuperembedSource(movie) {
        try {
            return [{
                name: 'SuperEmbed',
                quality: 'HD',
                url: `https://multiembed.mov/directstream.php?video_id=${movie.id || 'latest'}&tmdb=1`,
                type: 'iframe'
            }];
        } catch(error) {
            return [];
        }
    }
    
    // Запасные источники
    function createFallbackSources(movie) {
        const query = encodeURIComponent(movie.title);
        
        return [
            {
                name: 'Поиск в Google',
                quality: 'Разное',
                url: `https://www.google.com/search?q=${query}+смотреть+онлайн+бесплатно`,
                type: 'browser'
            },
            {
                name: 'YouTube',
                quality: 'HD',
                url: `https://www.youtube.com/results?search_query=${query}+фильм`,
                type: 'browser'
            }
        ];
    }
    
    // ========== СТИЛИ ==========
    function addStyles() {
        const css = `
            <style>
                .filmix-container {
                    padding: 20px;
                    max-width: 1200px;
                    margin: 0 auto;
                }
                
                .filmix-header {
                    margin-bottom: 30px;
                }
                
                .filmix-title {
                    font-size: 2em;
                    margin-bottom: 15px;
                    color: #ffd700;
                }
                
                .filmix-search {
                    display: flex;
                    gap: 10px;
                }
                
                .search-input {
                    flex: 1;
                    padding: 10px 15px;
                    background: rgba(255,255,255,0.1);
                    border: 1px solid rgba(255,255,255,0.2);
                    border-radius: 5px;
                    color: white;
                    font-size: 1em;
                }
                
                .search-btn {
                    padding: 10px 20px;
                    background: #ffd700;
                    color: #000;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-weight: bold;
                }
                
                .search-btn.focus {
                    background: #fffacd;
                }
                
                .results-grid {
