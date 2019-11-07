(function ($) {
  var $win = $(window);
  var $body = $('body');
  $(function () {

    $body.addClass('js-ready');

    //IEのスムーススクロールを無効にさせる(パララックスのため)
    if (navigator.userAgent.match(/MSIE 10/i) || navigator.userAgent.match(/Trident\/7\./) || navigator.userAgent.match(/Edge\/12\./)) {
      var pc = $('<script>',{
        charset: 'utf-8',
        src: 'https://kksample.sakura.ne.jp/portfolio/wp-content/themes/portfoliotheme/js/jquery.nicescroll.min.js'
      });
      var s = $('[src*="main.js"]');
      s.before(pc);
      $body.niceScroll({
        cursorcolor: "#d82d0f",
        cursorwidth: "18px",
        cursorborder: "1px solid #d82d0f",
      });
    }

    //drawer
    var $html = $('html');
    var $openBtn = $body.find('.open-btn');
    var $closeBtn = $body.find('.close-btn');
    var $drawer = $body.find('.drawer');
    var $drawerOverlay = $body.find('.drawer__overlay');
    var headerHeight = $body.find('.header').innerHeight();
    var drawerOpen = false; //ドロワーが開いてたらtrue
    var $scrollbarFixTargets = $('.scrollbarFix');
    var scrollbarFix = false;
    var scrollLockModifier = 'drawerOpen';
    var tabbableElements = $drawer.find('a[href],button:not(:disabled)');
    var firstTabbable = tabbableElements[0];
    var lastTabbable = tabbableElements[tabbableElements.length - 1];
    var scrollTop;

    function changeAriaExpanded(state) {
      var value = state ? 'true' : 'false';
      $drawer.attr('aria-expanded', value);
      $openBtn.attr('aria-expanded', value);
      $closeBtn.attr('aria-expanded', value);
    }

    function changeState(state) {
      if (state === drawerOpen) {
        return;
      }
      changeAriaExpanded(state);
      drawerOpen = state;
    }

    function openDrawer() {
      changeState(true);
    }

    function closeDrawer() {
      changeState(false);
    }

    function addScrollbarWidth() {
      var scrollbarWidth = window.innerWidth - $(window).width();
      if (!scrollbarWidth) {
        scrollbarFix = false;
        return;
      }
      addScrollbarMargin(scrollbarWidth);
      scrollbarFix = true;
    }

    function removeScrollbarWidth() {
      if (!scrollbarFix) {
        return;
      }
      addScrollbarMargin(0);
    }

    function addScrollbarMargin(value) {
      $scrollbarFixTargets.css('margin-right', value + "px")
    }

    function activateScrollLock() {
      addScrollbarWidth();
      $html.addClass(scrollLockModifier);
    }

    function deactivateScrollLock() {
      removeScrollbarWidth();
      $html.removeClass(scrollLockModifier);
    }

    function onClickOpenBtn() {
      openDrawer();
      activateScrollLock();
    }

    function onClickCloseBtn() {
      closeDrawer();
      deactivateScrollLock();
      $openBtn.focus();
    }

    function onKeydownTabKeyFirstTabbable(event) {
      if (event.key !== "Tab" || !event.shiftKey) {
        return;
      }
      event.preventDefault();
      lastTabbable.focus();
    }

    function onKeydownTabKeyLastTabbable(event) {
      if (event.key !== "Tab" || event.shiftKey) {
        return;
      }
      event.preventDefault();
      firstTabbable.focus();
    }

    function onKeydownEsc(event) {
      if (!drawerOpen || event.key !== "Escape") {
        return;
      }
      event.preventDefault();
      onClickCloseBtn()
    }

    function onScrollChangeClr() {
      scrollTop = $(window).scrollTop();
      if (headerHeight < scrollTop) {
        $openBtn.addClass('js-clr');
      } else {
        $openBtn.removeClass('js-clr');
      }
    }

    $(window).on('keydown', onKeydownEsc);
    $(firstTabbable).on('keydown', onKeydownTabKeyFirstTabbable);
    $(lastTabbable).on('keydown', onKeydownTabKeyLastTabbable);
    $openBtn.on('click', onClickOpenBtn);
    $closeBtn.on('click', onClickCloseBtn);
    $drawerOverlay.on('click', onClickCloseBtn);
    $(window).on('scroll', onScrollChangeClr)

  });

  $win.on('load', function () {

    var ua = navigator.userAgent;
    var winWidth;
    var breakPoint = 768;
    window.isSp = false;

    //uaに応じてbodyにクラスをつける
    if (ua.indexOf('iPhone') !== -1 || ua.indexOf('iPad') !== -1) {
      $body.addClass('ios');
    }

    //breakPointを判定
    function checkBp() {
      winWidth = window.innerWidth;
      if (winWidth < breakPoint) {
        isSp = true;
      } else {
        isSp = false;
      }
    }

    window.checkBp = checkBp;

    // //viewportに入ったららjs-showをつける
    // var pcPadding = 200;
    // var spPadding = 50;
    // var sections = [
    //   '.history',
    //   '.skill',
    //   '.works',
    //   '.contact'
    // ];

    // checkBp();
    // isSp ? initOnScroll(spPadding) : initOnScroll(pcPadding);

    // function initOnScroll() {
    //   $.each(sections, function (i, el) {
    //     var $el = $body.find(el);
    //     var elOffset = $el.offset().top;
    //     var elHeight = $el.innerHeight();
    //     var scrollTop;

    //     $win.on('scroll', function () {
    //       scrollTop = $win.scrollTop();
    //       if (scrollTop + 200 > elOffset && elHeight + elOffset > scrollTop + 200) {
    //         $el.addClass('js-show');
    //       } else {
    //         $el.removeClass('js-show');
    //       }
    //     });
    //   });
    // }

    // //関数を200msでデバウンスする
    // function onResize() {
    //   if (timer > 0) {
    //     clearTimeout(timer);
    //   }
    //   timer = setTimeout(function () {
    //     checkBp();
    //     isSp ? initOnScroll(spPadding) : initOnScroll(pcPadding);
    //   }, 200);
    // }

    // $win.on('resize', onResize);

  });

})(jQuery);
