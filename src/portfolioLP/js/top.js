(function ($) {
  $(window).on('load', function () {
    var $body = $('body');
    var timer = 0;

    //viewportに入ったららjs-showをつける
    var pcPadding = 200;
    var spPadding = 50;
    var sections = [
      '.history',
      '.skill',
      '.works',
      '.contact'
    ];

    checkBp();
    isSp ? initOnScroll(spPadding) : initOnScroll(pcPadding);

    function initOnScroll() {
      $.each(sections, function (i, el) {
        var $el = $body.find(el);
        var elOffset = $el.offset().top;
        var elHeight = $el.innerHeight();
        var scrollTop;

        $(window).on('scroll', function () {
          scrollTop = $(window).scrollTop();
          if (scrollTop + 200 > elOffset && elHeight + elOffset > scrollTop + 200) {
            $el.addClass('js-show');
          } else {
            $el.removeClass('js-show');
          }
        });
      });
    }

    //関数を200msでデバウンスする
    function onResize() {
      if (timer > 0) {
        clearTimeout(timer);
      }
      timer = setTimeout(function () {
        checkBp();
        isSp ? initOnScroll(spPadding) : initOnScroll(pcPadding);
      }, 200);
    }

    $(window).on('resize', onResize);
  });
})(jQuery);
