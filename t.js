Lampa.Listener.follow('full', function(e) {
      if (e.type == 'complite') {
       setTimeout(function(){
$('.view--torrent').insertAfter($('.button--play').last());
       },10);
     }
  })
