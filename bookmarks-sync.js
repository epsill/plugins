(function () {
    'use strict';

    var network = new Lampa.Reguest();

    var cubUrl = 'https://' + Lampa.Storage.get('cub_domain', 'cub.red');
    var cubApiUrl = cubUrl + '/api/';

    function convertToFavorite(cubBookmarksResponse) {
        var cubFavorites = {
            card: []
        };

        var bookmarks = [];
        for (var i = 0; i < cubBookmarksResponse.bookmarks.length; i++) {
            if (cubBookmarksResponse.bookmarks[i].type !== 'history') {
                bookmarks.push(cubBookmarksResponse.bookmarks[i]);
            }
        }
        bookmarks.sort(function (a, b) {
            return a.type > b.type ? 1 : -1;
        }).reverse();

        var history = [];
        for (var j = 0; j < cubBookmarksResponse.bookmarks.length; j++) {
            if (cubBookmarksResponse.bookmarks[j].type === 'history') {
                history.push(cubBookmarksResponse.bookmarks[j]);
            }
        }
        history.reverse();

        function selectCard(bookmark) {
            var card = JSON.parse(bookmark.data);

            var alreadyExistsCard = false;
            for (var k = 0; k < cubFavorites.card.length; k++) {
                if (cubFavorites.card[k].id == card.id) {
                    alreadyExistsCard = true;
                    break;
                }
            }

            if (!alreadyExistsCard) {
                cubFavorites.card.push(card);
            }

            if (cubFavorites[bookmark.type] === undefined) {
                cubFavorites[bookmark.type] = [];
            }

            cubFavorites[bookmark.type].push(card.id);
        }

        for (var m = 0; m < history.length; m++) {
            selectCard(history[m]);
        }
        for (var n = 0; n < bookmarks.length; n++) {
            selectCard(bookmarks[n]);
        }

        return cubFavorites;
    }

    function syncFavorite() {
        var html = Lampa.Template.get('account_add_device');

        var qr = html.find('.account-add-device__qr');
        qr.attr('src', cubUrl + '/img/qr/qr_device.svg');
        qr.css('opacity', 1);

        var controller = Lampa.Controller;

        html.find('.simple-button').on('hover:enter', function () {
            Lampa.Modal.close();
            Lampa.Input.edit({
                free: true,
                title: Lampa.Lang.translate('account_code_enter'),
                nosave: true,
                value: '',
                layout: 'nums'
            }, function (new_value) {
                var code = parseInt(new_value);
                if (new_value && new_value.length == 6 && !isNaN(code)) {
                    Lampa.Loading.start();
                    network.silent(cubApiUrl + 'device/add', function (resultDeviceAdd) {

                        network.silent(cubApiUrl + 'profiles/all', function (result) {
                            Lampa.Loading.stop();

                            if (result.secuses) {
                                var items = Lampa.Arrays.clone(result.profiles);
                                var clone = Lampa.Arrays.clone(result.profiles);
                                items.reverse();
                                clone.reverse();

                                var controller = Lampa.Controller.enabled().name;

                                Lampa.Select.show({
                                    title: Lampa.Lang.translate('account_profiles'),
                                    items: items.map(function (elem, index) {
                                        elem.title = elem.name;
                                        elem.template = 'selectbox_icon';
                                        elem.icon = '<img src="' + cubUrl + '/img/profiles/' + elem.icon + '.png" />';
                                        elem.index = index;
                                        elem.selected = false;
                                        return elem;
                                    }),
                                    onSelect: function onSelect(profile) {
                                        Lampa.Controller.toggle(controller);
                                        Lampa.Loading.start();

                                        network.silent(cubApiUrl + 'bookmarks/all?full=1', function (bookmarksResult) {
                                            if (bookmarksResult.secuses) {
                                                var favorite = convertToFavorite(bookmarksResult);
                                                Lampa.Storage.set('favorite', favorite);
                                                Lampa.Loading.stop();
                                                Lampa.Noty.show('Successfully synchronized');
                                            } else {
                                                Lampa.Loading.stop();
                                                Lampa.Noty.show('error');
                                            }
                                        }, function () {
                                            Lampa.Loading.stop();
                                            Lampa.Noty.show('error');
                                        }, false, {
                                            headers: {
                                                token: resultDeviceAdd.token,
                                                profile: profile.id
                                            }
                                        });
                                    },
                                    onBack: function onBack() {
                                        Lampa.Controller.toggle(controller);
                                    }
                                });
                            } else {
                                Lampa.Noty.show(result.text);
                            }
                        }, function () {
                            Lampa.Loading.stop();
                            Lampa.Noty.show(Lang.translate('account_profiles_empty'));
                        }, false, {
                            headers: {
                                token: resultDeviceAdd.token
                            }
                        });
                    }, function () {
                        Lampa.Loading.stop();
                        Lampa.Noty.show(Lampa.Lang.translate('account_code_error'));
                    }, {
                        code: code
                    });

                } else {
                    displayModal();
                    Lampa.Noty.show(Lampa.Lang.translate('account_code_wrong'));
                }
            });
        });

        Lampa.Modal.open({
            title: '',
            html: html,
            size: 'small',
            onBack: function onBack() {
                Lampa.Modal.close();
                Lampa.Controller.toggle('settings_component');
            }
        });
    };

    function start() {
        if (window.bookmarks_sync == true) {
            return;
        }

        window.bookmarks_sync = true;

        Lampa.SettingsApi.addComponent({
            component: 'bookmarks_sync',
            name: 'Bookmarks',
            icon: `
            <svg fill="white" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" height="50px" width="50px" version="1.1" id="Capa_1" viewBox="0 0 56 56" xml:space="preserve">
            <g>
                <path d="M52.199,44.02c-0.549-0.105-1.069,0.241-1.18,0.781C49.903,50.303,45.574,54,40.249,54c-5.028,0-9.446-3.3-10.948-8H34v-2 h-8v8h2v-3.848C30.169,52.833,34.915,56,40.249,56c6.304,0,11.42-4.341,12.731-10.801C53.09,44.657,52.74,44.13,52.199,44.02z"/>
                <path d="M52,32v4.308C49.75,31.855,45.296,29,40.249,29c-6.109,0-11.541,3.997-13.209,9.721c-0.154,0.53,0.15,1.085,0.681,1.239 c0.531,0.157,1.086-0.15,1.239-0.681C30.358,34.482,35.105,31,40.249,31c4.565,0,8.562,2.766,10.33,7H46v2h8v-8H52z"/>
                <polygon points="36,11 36,0 19,0 2,0 2,11 19,11 "/>
                <path d="M36,26.382V13H19H2v41.443C2,55.302,2.699,56,3.559,56c0.412,0,0.801-0.162,1.091-0.452L19,41l4.259,4.317 C23.1,44.4,23,43.462,23,42.5C23,34.604,28.579,27.993,36,26.382z"/>
            </g>
            </svg>`
        });
    
        Lampa.SettingsApi.addParam({
            component: 'bookmarks_sync',
            param: {
                name: 'SyncParam',
                type: 'static',
            },
            field: {
                name: 'Sync',
                description: 'Synchronizes bookmarks and history with CUB service profile'
            },
            onRender: function (item) {
                item.on('hover:enter', function () {
                    syncFavorite();
                });
            }
        });
    }

    if (window.appready) start();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') {
                start();
            }
        });
    }
})();