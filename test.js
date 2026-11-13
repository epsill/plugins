(function () {
    'use strict';

    Lampa.Platform.tv();

    // ---- Антиотладочный мусор (можно смело удалить) ----
    // Блок с _0x2c6bed / _0x2a457b — это классический "self-defending"
    // обфускатор (подмена console, проверка toString). На работу не влияет.
    // ---- /Антиотладочный мусор ----

    (function () {
        'use strict';

        function start() {
            // Проверка приложения: плагин работает только в Lampa
            if (Lampa.Manifest.app !== 'lampa') {
                Lampa.Noty.show('Cardify: приложение не поддерживается');
                return;
            }

            // Проверка платформы
            if (!Lampa.Platform.is('tv')) {
                return console.log('Cardify', 'Плагин только для TV');
            }

            // ---- Стили ----
            Lampa.Template.add('cardify_style', `
                <style>
                .cardify .full-start-new__body { height: 80vh }
                .cardify .full-start-new__right { display: flex; align-items: flex-end }
                .cardify__left { flex-grow: 1 }
                .cardify__right { display: flex; align-items: center; flex-shrink: 0 }
                .cardify__details { display: flex }
                .cardify .full-start-new__reactions { margin: 0; margin-right: -2.8em }
                .cardify .full-start-new__reactions:not(.focus) { margin: 0 }
                .cardify .full-start-new__reactions:not(.focus) > div:not(:first-child) { display: none }
                .cardify .full-start-new__reactions:not(.focus) .reaction { position: relative }
                .cardify .full-start-new__reactions:not(.focus) .reaction__count {
                    position: absolute; top: 28%; left: 95%;
                    font-size: 1.2em; font-weight: 500;
                }
                .cardify .full-start-new__rate-line { margin: 0; margin-left: 3.5em }
                .cardify .full-start-new__rate-line > *:last-child { margin-right: 0 !important }
                .cardify__background { left: 0 }
                .cardify__background.loaded:not(.dim) { opacity: 1 }
                body:not(.menu--open) .cardify__background {
                    background:
                        linear-gradient(to top,    rgba(0,0,0,0.8), rgba(0,0,0,0) 70%),
                        linear-gradient(to bottom, rgba(0,0,0,0.8), rgba(0,0,0,0) 70%),
                        linear-gradient(to left,   rgba(0,0,0,0.8), rgba(0,0,0,0) 70%),
                        linear-gradient(to right,  rgba(0,0,0,0.8), rgba(0,0,0,0) 70%);
                }
                </style>
            `);

            // ---- HTML-шаблон карточки ----
            Lampa.Template.add('cardify', `
                <div class="full-start-new cardify">
                    <div class="full-start-new__body">
                        <div class="full-start-new__left hide">
                            <div class="full-start-new__poster">
                                <img class="full-start-new__img full--poster" />
                            </div>
                        </div>
                        <div class="full-start-new__right">
                            <div class="cardify__left">
                                <div class="full-start-new__head"></div>
                                <div class="full-start-new__title">{title}</div>
                                <div class="cardify__details">
                                    <div class="full-start-new__details"></div>
                                </div>
                                <div class="full-start-new__buttons">
                                    <!-- кнопка Play -->
                                    <div class="full-start__button selector button--play">
                                        <svg width="28" height="29" viewBox="0 0 28 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <circle cx="14" cy="14.5" r="13" stroke="currentColor" stroke-width="2.7"/>
                                            <path d="M18.0739 13.634C18.7406 14.0189 18.7406 14.9811 18.0739 15.366L11.751 19.0166C11.0843 19.4015 10.251 18.9204 10.251 18.1506L10.251 10.8494C10.251 10.0796 11.0843 9.5985 11.751 9.9834L18.0739 13.634Z" fill="currentColor"/>
                                        </svg>
                                        <span>#{title_watch}</span>
                                    </div>
                                    <!-- кнопка Ссылки -->
                                    <div class="full-start__button selector button--book">
                                        <svg width="21" height="32" viewBox="0 0 21 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M2 1.5H19C19.2761 1.5 19.5 1.72386 19.5 2V27.9618C19.5 28.3756 19.0261 28.6103 18.697 28.3595L12.6212 23.7303C11.3682 22.7757 9.63183 22.7757 8.37885 23.7303L2.30302 28.3595C1.9739 28.6103 1.5 28.3756 1.5 27.9618V2C1.5 1.72386 1.72386 1.5 2 1.5Z" stroke="currentColor" stroke-width="2.5"/>
                                        </svg>
                                        <span>#{settings_input_links}</span>
                                    </div>
                                    <!-- кнопка Реакции -->
                                    <div class="full-start__button selector button--reaction">
                                        <svg width="38" height="34" viewBox="0 0 38 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M37.208 10.9742C37.1364 10.8013 37.0314 10.6441 36.899 10.5117C36.7666 10.3794 36.6095 10.2744 36.4365 10.2028L12.0658 0.108375C11.7166 -0.0361828 11.3242 -0.0361227 10.9749 0.108542C10.6257 0.253206 10.3482 0.530634 10.2034 0.879836L0.108666 25.2507C0.0369593 25.4236 3.37953e-05 25.609 2.3187e-08 25.7962C-3.37489e-05 25.9834 0.0368249 26.1688 0.108469 26.3418C0.180114 26.5147 0.28514 26.6719 0.417545 26.8042C0.54995 26.9366 0.707139 27.0416 0.880127 27.1131L17.2452 33.8917C17.5945 34.0361 17.9869 34.0361 18.3362 33.8917L29.6574 29.2017C29.8304 29.1301 29.9875 29.0251 30.1199 28.8928C30.2523 28.7604 30.3573 28.6032 30.4289 28.4303L37.2078 12.065C37.2795 11.8921 37.3164 11.7068 37.3164 11.5196C37.3165 11.3325 37.2796 11.1471 37.208 10.9742ZM20.425 29.9407L21.8784 26.4316L25.3873 27.885L20.425 29.9407ZM28.3407 26.0222L21.6524 23.252C21.3031 23.1075 20.9107 23.1076 20.5615 23.2523C20.2123 23.3969 19.9348 23.6743 19.79 24.0235L17.0194 30.7123L3.28783 25.0247L12.2918 3.28773L34.0286 12.2912L28.3407 26.0222Z" fill="currentColor"/>
                                            <path d="M25.3493 16.976L24.258 14.3423L16.959 17.3666L15.7196 14.375L13.0859 15.4659L15.4161 21.0916L25.3493 16.976Z" fill="currentColor"/>
                                        </svg>
                                        <span>#{title_reactions}</span>
                                    </div>
                                    <!-- кнопка Подписка -->
                                    <div class="full-start__button selector button--subscribe hide">
                                        <svg width="25" height="30" viewBox="0 0 25 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M6.01892 24C6.27423 27.3562 9.07836 30 12.5 30C15.9216 30 18.7257 27.3562 18.981 24H15.9645C15.7219 25.6961 14.2632 27 12.5 27C10.7367 27 9.27804 25.6961 9.03542 24H6.01892Z" fill="currentColor"/>
                                            <path d="M3.81972 14.5957V10.2679C3.81972 5.41336 7.7181 1.5 12.5 1.5C17.2819 1.5 21.1803 5.41336 21.1803 10.2679V14.5957C21.1803 15.8462 21.5399 17.0709 22.2168 18.1213L23.0727 19.4494C24.2077 21.2106 22.9392 23.5 20.9098 23.5H4.09021C2.06084 23.5 0.792282 21.2106 1.9273 19.4494L2.78317 18.1213C3.46012 17.0709 3.81972 15.8462 3.81972 14.5957Z" stroke="currentColor" stroke-width="2.5"/>
                                        </svg>
                                        <span>#{title_subscribe}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="cardify__right">
                                <div class="full-start-new__reactions selector">
                                    <div>#{reactions_none}</div>
                                </div>
                                <div class="full-start-new__rate-line">
                                    <div class="full-start__rate rate--tmdb"><div>{rating}</div><div class="source--name">TMDB</div></div>
                                    <div class="full-start__rate rate--imdb hide"><div></div><div>IMDB</div></div>
                                    <div class="full-start__rate rate--kp hide"><div></div><div>KP</div></div>
                                    <div class="full-start__pg hide"></div>
                                    <div class="full-start__status hide"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="hide buttons--container">
                        <div class="full-start__button view--torrent hide">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="50px" height="50px">
                                <path d="..." fill="currentColor"/>
                            </svg>
                            <span>#{full_torrents}</span>
                        </div>
                        <div class="full-start__button selector view--trailer">
                            <svg height="70" viewBox="0 0 80 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="..." fill="currentColor"></path>
                            </svg>
                            <span>#{full_trailers}</span>
                        </div>
                    </div>
                </div>
            `);

            // Вставляем шаблон карточки на страницу
            $('.full-start__background').append(
                Lampa.Template.get('cardify', {}, true)
            );

            // При открытии карточки фильма — вешаем класс cardify
            Lampa.Listener.follow('full', function (e) {
                if (e.type === 'movie') {
                    e.object.activity.render()
                        .find('.full-start-new__body')
                        .addClass('cardify');
                }
            });
        }

        // Запуск, если приложение уже загружено, иначе ждём событие
        if (window.appready) {
            start();
        } else {
            Lampa.Listener.follow('app', function (e) {
                if (e.type === 'ready') start();
            });
        }
    })();
})();
