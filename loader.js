
Lampa.Platform.tv();

var lampa_url     = 'http://185.105.117.217:12160';
var cache_version = Math.floor((new Date()).getTime() / 9e5); // Новое значение каждые 15 минут
    
function urlJoin(base, add) {
    if (base.charAt(base.length - 1) !== '/') {
        base += '/'
    }

    return base + add
}

function putScript(scripts, onload, onerror){
    var add = function(src){
        console.log('Loader', 'try-load-script', src)

        var trys = 0

        var sreateScript = function(){
            var script = document.createElement('script')

            script.type = 'text/javascript'

            script.onload = script.onreadystatechange = function(e) {
                console.log('Loader', 'Script loaded', e)

                if (!!onload) onload()
            };

            script.onerror = function(){
                trys++

                console.log('Loader', 'error-load-script', src)

                if(trys < 3){
                    sreateScript()
                } else if (!!onerror) {
                    onerror()
                } else{
                    $('.no-network').removeClass('hide')

                    $('.no-network__file').text(window.location.href + '/' + src)
                }
            }

            script.src = src

            document.getElementsByTagName('body')[0].appendChild(script)
        }

        sreateScript()
    }

    add(scripts)
}

function loadCurrentLampa() {
    putScript('app.min.js?v=' + cache_version, function () {})
}

function loadLocalLampa(){
    if(lampa_url !== '') window.local_lampa = true

    loadCurrentLampa()
}

if (typeof AndroidJS !== "undefined"
    && !!AndroidJS.getLampaURL
    && /^https?:\/\//i.test(AndroidJS.getLampaURL())
    && !/^https?:\/\//i.test(location.href)
) {
    lampa_url = urlJoin(AndroidJS.getLampaURL(),'')
}

if (lampa_url !== '') {
    putScript(
        urlJoin(lampa_url, 'lampainit.js?v=' + cache_version),
        false,
        function(){}
    )

    putScript(
        urlJoin(lampa_url, 'app.min.js?v=' + cache_version),
        function () {
            var css = urlJoin(lampa_url, 'css/app.css?v=' + cache_version)

            $('head').append('<link rel="stylesheet" href="' + css + '">')
        },
        function () {
            putScript(
                urlJoin(lampa_url, 'lampa-main/app.min.js?v=' + cache_version),
                function () {
                    var css = urlJoin(lampa_url, 'lampa-main/css/app.css?v=' + cache_version)

                    $('head').append('<link rel="stylesheet" href="' + css + '">')

                    putScript(
                        urlJoin(lampa_url, 'lampainit.js?v=' + cache_version),
                        false,
                        function(){}
                    )
                },
                loadLocalLampa
            )
        }
    )
}
else{
    loadCurrentLampa()
}
