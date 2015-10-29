;(function($){

  'use strict';

  // Smooth Scroll
  $('a[href^="#"]').smoothScroll({
    duration : 3000
  });

  // Bootstrap Auto-Hiding Navbar
  $(".navbar-fixed-top").autoHidingNavbar();

  $.slidebars();

  // Your Code
  console.log('Write Your Code.');

})(jQuery);
