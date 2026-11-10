/* Panel BT Odkrywca: pola powtarzane (dodaj, usuń, kolejność) i wybór zdjęć / plików z biblioteki mediów. */
jQuery(function ($) {
  'use strict';
  function renum($rep) {
    var name = $rep.data('name');
    $rep.find('.odk-rep-l > .odk-rep-w').each(function (i) {
      $(this).find('[name]').each(function () {
        var n = $(this).attr('name');
        var p = name.replace(/[\[\]]/g, '\\$&');
        $(this).attr('name', n.replace(new RegExp('^' + p + '\\[(\\d+|__i__)\\]'), name + '[' + i + ']'));
      });
    });
  }
  $(document).on('click', '.odk-rep-add', function () {
    var $rep = $(this).closest('.odk-rep');
    var html = $rep.children('template').html();
    $rep.children('.odk-rep-l').append(html);
    renum($rep);
  });
  $(document).on('click', '.odk-rep-del', function () {
    var $rep = $(this).closest('.odk-rep');
    if (!window.confirm('Usunąć ten wiersz?')) return;
    $(this).closest('.odk-rep-w').remove();
    renum($rep);
  });
  $(document).on('click', '.odk-rep-up, .odk-rep-down', function () {
    var $w = $(this).closest('.odk-rep-w'), $rep = $(this).closest('.odk-rep');
    if ($(this).hasClass('odk-rep-up')) $w.prev('.odk-rep-w').before($w); else $w.next('.odk-rep-w').after($w);
    renum($rep);
  });

  function sync($box) {
    var ids = [];
    $box.find('.odk-media-l [data-id]').each(function () { ids.push($(this).data('id')); });
    $box.find('input[type=hidden]').first().val(ids.join(','));
  }
  $('.odk-media[data-multi="1"] .odk-media-l').sortable({ items: '[data-id]', tolerance: 'pointer', update: function () { sync($(this).closest('.odk-media')); } });
  $(document).on('click', '.odk-media-x', function (e) {
    e.preventDefault();
    var $box = $(this).closest('.odk-media');
    $box.find('.odk-media-l').empty();
    $box.find('input[type=hidden]').first().val('');
  });
  $(document).on('click', '.odk-media-b', function (e) {
    e.preventDefault();
    var $box = $(this).closest('.odk-media'), multi = $box.data('multi') == 1, typ = $box.data('typ');
    var opts = { title: typ === 'image' ? 'Wybierz zdjęcia' : 'Wybierz pliki', multiple: multi ? 'add' : false, button: { text: 'Użyj' } };
    if (typ) opts.library = { type: typ };
    var f = wp.media(opts);
    f.on('open', function () {
      var s = f.state().get('selection');
      ($box.find('input[type=hidden]').first().val() || '').split(',').forEach(function (i) {
        if (i) { var a = wp.media.attachment(i); a.fetch(); s.add(a); }
      });
    });
    f.on('select', function () {
      var $l = $box.find('.odk-media-l').empty(), ids = [];
      f.state().get('selection').each(function (a) {
        ids.push(a.id);
        if (a.get('type') === 'image') {
          var u = a.get('sizes') && a.get('sizes').thumbnail ? a.get('sizes').thumbnail.url : a.get('url');
          $l.append($('<img width="90" height="90">').attr({ src: u, 'data-id': a.id }));
        } else {
          $l.append($('<span class="odk-plik">').attr('data-id', a.id).text(a.get('filename')));
        }
      });
      $box.find('input[type=hidden]').first().val(ids.join(','));
    });
    f.open();
  });
});
