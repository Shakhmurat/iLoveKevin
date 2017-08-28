'use strict';

import myModule from './module-to-import';

$(document).ready(function() {

  var swiper = new Swiper('.swiper-container', {
    pagination: '.swiper-pagination',
    paginationClickable: true,
    autoHeight: true
  });
});

