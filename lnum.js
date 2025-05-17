(function() {
  var plugins = Lampa.Storage.get('plugins', '[]');
  
  plugins.forEach(function(p) {
    if (p.url) { // Аналог optional chaining (?.) в ES5
      p.url = p.url.replace('skaztv.online', 'lampaplugins.github.io/store');
    }
  });

  Lampa.Storage.set('plugins', plugins);
  $.getScript('https://lampaplugins.github.io/store/store.js');
})();
