;(function($){

  'use strict';

  // Smooth Scroll
  $('a[href^="#"]').on('click', function(event) {
    var hash = this.hash.replace(/[#<>]/g, '');
    event.preventDefault();
    if (hash) {
      location.hash = '#/' + hash;
    }
  });

  $(window).on('hashchange', function() {
    $.smoothScroll({
      scrollTarget: '#' + location.hash.replace(/^\#\/?/, '')
    });
  });

  // Bootstrap Auto-Hiding Navbar
  $('.navbar-fixed-top').autoHidingNavbar();

  // Sidebars DEMO
  $.slidebars();

  // Slick DEMO
  $('.slick-demo').slick({
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
  });

  // Your Code
  console.log('Write Your Code.');

})(jQuery);
