(function() {
    'use strict';

    Lampa.Platform.tv();

    const lampa_url = 'http://185.105.117.217:12160';
    const cache_version = Math.floor((new Date()).getTime() / 9e5); // Новое значение каждые 15 минут

    function urlJoin(base, add) {
        return base.endsWith('/') ? base + add : base + '/' + add;
    }

    function putScript(src, onload, onerror) {
        console.log('Loader', 'try-load-script', src);
        let tries = 0;

        const createScript = () => {
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = src;

            script.onload = () => {
                console.log('Loader', 'Script loaded', src);
                if (onload) onload();
            };

            script.onerror = () => {
                tries++;
                console.log('Loader', 'error-load-script', src);
                if (tries < 3) {
                    createScript(); // Повторная попытка загрузки
                } else if (onerror) {
                    onerror();
                } else {
                    $('.no-network').removeClass('hide');
                    $('.no-network__file').text(window.location.href + '/' + src);
                }
            };

            document.body.appendChild(script);
        };

        createScript();
    }

    function loadCurrentLampa() {
        putScript(`app.min.js?v=${cache_version}`, () => {});
    }

    function loadLocalLampa() {
        if (lampa_url !== '') window.local_lampa = true;
        loadCurrentLampa();
    }

    // Проверка на наличие AndroidJS
    if (typeof AndroidJS !== "undefined" && !!AndroidJS.getLampaURL && /^https?:\/\//i.test(AndroidJS.getLampaURL()) && !/^https?:\/\//i.test(location.href)) {
        lampa_url = urlJoin(AndroidJS.getLampaURL(), '');
    }

    if (lampa_url !== '') {
        putScript(urlJoin(lampa_url, `lampainit.js?v=${cache_version}`), false, () => {});

        putScript(urlJoin(lampa_url, `app.min.js?v=${cache_version}`), () => {
            const css = urlJoin(lampa_url, `css/app.css?v=${cache_version}`);
            $('head').append(`<link rel="stylesheet" href="${css}">`);
        }, () => {
            putScript(urlJoin(lampa_url, `lampa-main/app.min.js?v=${cache_version}`), () => {
                const css = urlJoin(lampa_url, `lampa-main/css/app.css?v=${cache_version}`);
                $('head').append(`<link rel="stylesheet" href="${css}">`);
                putScript(urlJoin(lampa_url, `lampainit.js?v=${cache_version}`), false, () => {});
            }, loadLocalLampa);
        });
    } else {
        loadCurrentLampa();
    }
})();
