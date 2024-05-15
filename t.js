Lampa.Listener.follow('full', function(e) {
  if (e.type == 'complite') {
    setTimeout(function() {
      $('.view--torrent').each(function() {
        var $torrentButton = $(this);
        var $parent = $torrentButton.parent();
        var $firstChild = $parent.children().first();

        if (!$torrentButton.is($firstChild)) {
          $torrentButton.prepend($parent);
        }
      });
    }, 10);
  }
});
