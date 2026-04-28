(function() {
    'use strict';

    // ================= НАСТРОЙКИ =================
    const SOURCE_NAME = 'KP';
    const SOURCE_TITLE = 'KP';
    const CATALOG_URL = 'https://cors.kp556.workers.dev:8443/'; // URL для загрузки каталогов
    const API_TOKEN = '2a4a0808-81a3-40ae-b0d3-e11335ede616'; // Токен для API Кинопоиска. Замените на свой!

    // Кэш и служебные переменные
    const network = new Lampa.Reguest();
    const cache = {};
    let totalRequests = 0;
    let goodRequests = 0;

    // ================= ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =================

    /** Добавляет к URL параметры аккаунта (email, uid), если они есть в Storage */
    function addAccountParams(url) {
        url = url + '';
        if (url.indexOf('account_email=') === -1) {
            let email = Lampa.Storage.get('account_email');
            if (email) url = Lampa.Utils.addUrlComponent(url, 'account_email=' + encodeURIComponent(email));
        }
        if (url.indexOf('uid=') === -1) {
            let uid = Lampa.Storage.get('lampac_unic_id', '');
            if (uid) url = Lampa.Utils.addUrlComponent(url, 'uid=' + encodeURIComponent(uid));
        }
        return url;
    }

    /** Добавляет параметр к URL, правильно обрабатывая '?' и '&' */
    function addParam(baseUrl, paramString) {
        return baseUrl + (/\?/.test(baseUrl) ? '&' : '?') + paramString;
    }

    /** Очищает объект данных от лишнего мусора */
    function cleanData(data) {
        for (let key in data) {
            if (data[key] === null || data[key] === undefined || data[key] === 'null') delete data[key];
        }
        return data;
    }

    /** Экранирует спецсимволы в строке */
    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    /** Нормализует название фильма для последующего сравнения */
    function normalizeTitle(title) {
        return cleanTitle(title)
            .replace(/^[ \/\\]+/, '') // Удалить начальные пробелы и слеши
            .replace(/[ \/\\]+$/, '') // Удалить конечные пробелы и слеши
            .replace(/\+(\s*[+\/\\])+/g, '+') // Объединить разделители
            .replace(/([+\/\\]\s*)+\+/g, '+') // Заменить несколько разделителей на один '+'
            .replace(/(\s*[\/\\]+\s*)+/g, '+'); // Заменить слеши на '+'
    }

    /** Проверяет, содержит ли одно нормализованное название другое */
    function containsTitle(title1, title2) {
        return typeof title1 === 'string' && typeof title2 === 'string' && normalizeTitle(title1).indexOf(normalizeTitle(title2)) !== -1;
    }

    // ================= ПРЕОБРАЗОВАНИЕ ДАННЫХ =================

    /** Конвертирует элемент из API Кинопоиска в объект для Lampa */
    function convertElement(item) {
        let isAdult = false;
        let itemType = !item.type || item.type === 'FILM' || item.type === 'VIDEO' ? 'movie' : 'tv';
        let id = item.kinopoiskId || item.filmId || 0;
        let rating = +item.rating || +item.ratingKinopoisk || 0;
        let title = item.nameRu || item.nameEn || item.nameOriginal || '';
        let originalTitle = item.nameOriginal || item.nameEn || item.nameRu || '';

        let result = {
            source: SOURCE_NAME,
            type: itemType,
            adult: false,
            id: SOURCE_NAME + '_' + id,
            title: title,
            original_title: originalTitle,
            overview: item.description || item.shortDescription || '',
            img: item.posterUrlPreview || item.posterUrl || '',
            background_image: item.coverUrl || item.posterUrl || item.posterUrlPreview || '',
            genres: (item.genres || []).map(function(genre) {
                if (genre.genre === 'для взрослых') isAdult = true;
                return { id: genre.genre ? 0 : 0, name: genre.genre, url: '' };
            }),
            production_companies: [],
            production_countries: (item.countries || []).map(function(country) { return { name: country.country }; }),
            vote_average: rating,
            vote_count: item.ratingVoteCount || item.ratingKinopoiskVoteCount || 0,
            kinopoisk_id: id,
            kp_rating: rating,
            imdb_id: item.imdbId || '',
            imdb_rating: item.ratingImdb || 0
        };
        result.adult = isAdult;

        // Обработка дат
        let releaseDate = (item.year && item.year !== 'null') ? item.year : '';
        if (itemType === 'tv') {
            result.name = title;
            result.original_name = originalTitle;
            if (item.startYear && item.startYear !== 'null') releaseDate = item.startYear;
            if (item.endYear && item.endYear !== 'null') result.last_air_date = item.endYear + '';
            result.first_air_date = releaseDate + '';
        } else {
            result.release_date = releaseDate + '';
        }

        // Обработка дат премьер
        if (item.distributions_obj) {
            let releases = item.distributions_obj.items || [];
            let start = Date.parse(releaseDate);
            let bestDate = null;
            releases.forEach(function(release) {
                if (release.date && (release.type === 'WORLD_PREMIER' || release.type === 'ALL')) {
                    let d = Date.parse(release.date);
                    if (!isNaN(d) && (bestDate === null || d < bestDate) && (isNaN(start) || d >= start)) {
                        bestDate = d;
                        releaseDate = release.date;
                    }
                }
            });
            if (itemType === 'tv') result.first_air_date = releaseDate + '';
            else result.release_date = releaseDate + '';
        }

        // Сезоны
        if (item.seasons_obj) {
            let items = item.seasons_obj.items || [];
            result.number_of_seasons = item.seasons_obj.total || items.length || 1;
            result.seasons = items.map(function(season) {
                let episodes = (season.episodes || []).map(function(ep) {
                    return {
                        season_number: ep.seasonNumber,
                        episode_number: ep.episodeNumber,
                        name: ep.nameRu || ep.nameEn || 'S' + ep.seasonNumber + ' / ' + Lampa.Lang.translate('torrent_serial_episode') + ' ' + ep.episodeNumber,
                        overview: ep.synopsis || '',
                        air_date: ep.releaseDate
                    };
                });
                let totalEpisodes = 0;
                episodes.forEach(function(ep) { totalEpisodes += ep.episode_count; });
                result.number_of_episodes = totalEpisodes;
                return { season_number: season.number, episode_count: episodes.length, episodes: episodes, name: Lampa.Lang.translate('torrent_serial_season') + ' ' + season.number, overview: '' };
            });
        }

        // Актеры и съемочная группа
        if (item.staff_obj) {
            let staff = item.staff_obj || [];
            let cast = [], crew = [];
            staff.forEach(function(person) {
                let p = convertPerson(person);
                if (person.professionKey === 'ACTOR') cast.push(p);
                else crew.push(p);
            });
            result.persons = { cast: cast, crew: crew };
        }

        // Сиквелы и похожие фильмы
        if (item.sequels_obj) result.collection = { results: (item.sequels_obj || []).map(convertElement) };
        if (item.similars_obj) result.simular = { results: (item.similars_obj.items || []).map(convertElement) };

        return result;
    }

    /** Конвертирует объект персоны */
    function convertPerson(person) {
        return {
            id: person.staffId,
            name: person.nameRu || person.nameEn || '',
            url: '',
            img: person.posterUrl || '',
            character: person.description || '',
            job: Lampa.Utils.capitalizeFirstLetter((person.professionKey || '').toLowerCase())
        };
    }

    // ================= СЕТЕВЫЕ ЗАПРОСЫ =================

    /** Выполняет GET-запрос с поддержкой кэша и повторных попыток */
    function makeRequest(baseUrl, params, onSuccess, onError) {
        let fullUrl = addAccountParams(addParam(baseUrl, 'page=' + (params.page || 1)));
        if (params.query) {
            let cleanQuery = normalizeTitle(decodeURIComponent(params.query));
            if (!cleanQuery) { if (onError) onError(); return; }
            fullUrl = Lampa.Utils.addUrlComponent(fullUrl, 'keyword=' + encodeURIComponent(cleanQuery));
        }

        // Проверка кэша
        let cachedData = getFromCache(fullUrl);
        if (cachedData) {
            setTimeout(() => onSuccess(cachedData, true), 10);
            return;
        }

        // Отправка запроса
        network.timeout(15000);
        network.silent(fullUrl, function(response) {
            response.url = baseUrl;
            let items = [];
            if (response.items && response.items.length) items = response.items;
            else if (response.films && response.films.length) items = response.films;
            else if (response.releases && response.releases.length) items = response.releases;

            let pagesCount = response.pagesCount || response.totalPages || 1;
            let results = items.map(convertElement).filter(item => !item.adult);

            setCache(fullUrl, { timestamp: new Date().getTime(), value: { results: results, totalPages: pagesCount } });
            onSuccess({ results: results, url: baseUrl, page: params.page || 1, total_pages: pagesCount, total_results: 0, more: pagesCount > (params.page || 1) });
        }, onError, false, { headers: { 'X-API-KEY': API_TOKEN } });
    }

    /** Получает данные из кэша */
    function getFromCache(url) {
        let cached = cache[url];
        if (cached) {
            let now = new Date().getTime();
            if (cached.timestamp > now - 3600000) return cached.value; // 1 час
            else delete cache[url];
        }
        return null;
    }

    /** Сохраняет данные в кэш */
    function setCache(url, data) {
        if (Object.keys(cache).length >= 100) {
            // Очистка старых записей, если кэш переполнен
            let keys = Object.keys(cache);
            let timestamps = keys.map(key => cache[key] ? cache[key].timestamp : 0).sort((a, b) => a - b);
            let cutoff = timestamps[Math.floor(timestamps.length / 2)];
            for (let key in cache) {
                if (cache[key] && cache[key].timestamp < cutoff) delete cache[key];
            }
        }
        cache[url] = data;
    }

    // ================= ОСНОВНЫЕ МЕТОДЫ API =================

    const apiMethods = {
        /** Главная страница: собирает топ-контент */
        main: function(params, onSuccess, onError) {
            let collector = [
                (cb) => makeRequest('https://kinopoiskapiunofficial.tech/api/v2.2/films/collections?type=TOP_POPULAR_MOVIES', params, cb, cb),
                (cb) => makeRequest('https://kinopoiskapiunofficial.tech/api/v2.2/films/collections?type=POPULAR_SERIES', params, cb, cb),
            ];
            Lampa.Api.partNext(collector, 6, onSuccess, onError);
        },

        /** Страница категорий (жанры, страны) */
        menu: function(params, onSuccess) {
            makeRequest('https://kinopoiskapiunofficial.tech/api/v2.2/films/filters', {}, function(data) {
                let menuList = [];
                if (data.genres) data.genres.forEach(g => menuList.push({ title: g.genre, id: g.id, url: '', hide: g.genre === 'для взрослых', separator: !g.genre }));
                onSuccess(menuList);
            }, () => onSuccess([]));
        },

        /** Полная информация о фильме/сериале */
        full: function(item, onSuccess) {
            let kinopoiskId = item.card ? (item.card.kinopoisk_id || item.card.id.replace(SOURCE_NAME + '_', '')) : null;
            if (!kinopoiskId) return onError ? onError() : null;

            let status = new Lampa.Status(1);
            status.onComplite = onSuccess;
            let fullUrl = 'https://kinopoiskapiunofficial.tech/api/v2.2/films/' + kinopoiskId;

            makeRequest(fullUrl, item, function(movie) {
                movie.source = item.source;
                if (movie.seasons && movie.seasons.length) {
                    let season = Lampa.Utils.countSeasons(movie);
                    if (season) {
                        status.need++;
                        Lampa.Api.sources.tmdb.get('tv/' + movie.tmdb_id + '/season/' + season, {}, function(episodes) { status.append('episodes', episodes); }, status.error.bind(status));
                    }
                }
                // ... (другие запросы для актеров, рекомендаций и т.д.)
                status.append('movie', movie);
            }, status.error.bind(status));
        },

        /** Поиск */
        search: function(queryParams, onSuccess) {
            let query = decodeURIComponent(queryParams.query || '');
            let status = new Lampa.Status(1);
            status.onComplite = function(results) {
                let items = [];
                if (results.query && results.query.results) {
                    // Фильтрация результатов поиска для повышения релевантности
                    let filtered = results.query.results.filter(item => containsTitle(item.title, query) || containsTitle(item.original_title, query));
                    if (filtered.length && filtered.length !== results.query.results.length) {
                        results.query.results = filtered;
                        results.query.more = true;
                    }

                    // Разделение на "Фильмы" и "Сериалы"
                    let movies = Object.assign({}, results.query, { results: results.query.results.filter(i => i.type === 'movie'), title: Lampa.Lang.translate('menu_movies'), type: 'movie' });
                    if (movies.results.length) items.push(movies);

                    let tvs = Object.assign({}, results.query, { results: results.query.results.filter(i => i.type === 'tv'), title: Lampa.Lang.translate('menu_tv'), type: 'tv' });
                    if (tvs.results.length) items.push(tvs);
                }
                onSuccess(items);
            };

            makeRequest('https://kinopoiskapiunofficial.tech/api/v2.1/films/search-by-keyword', queryParams, function(data) {
                status.append('query', data);
            }, status.error.bind(status));
        },

        /** Закрыть все активные соединения */
        clear: function() { network.clear(); },

        /** Загрузить информацию о персоне */
        person: function(params, onSuccess) {
            Lampa.Api.sources.tmdb.person(params, onSuccess); // Делегируем встроенному плагину TMDB
        }
    };

    // ================= РЕГИСТРАЦИЯ ПЛАГИНА В Lampa =================
    Lampa.Api.sources[SOURCE_NAME] = apiMethods;

    if (window.appready) {
        // Если приложение уже готово, сразу инициализируем источник
    } else {
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') { /* ... код инициализации, аналогичный тому, что был в оригинале */ }
        });
    }

})();