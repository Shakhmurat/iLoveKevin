'use strict';

import myModule from './module-to-import';

$(document).ready(function() {

  var swiper = new Swiper('.swiper-container', {
    pagination: '.swiper-pagination',
    paginationClickable: true,
    autoHeight: true
  });

  $('.form-control').on('change', function () {
  	if ($('.js-validate-name').val().length > 0 && +
  		+ $('.js-validate-pass').val().length > 10 && + 
  		+ $('.js-validate-check').is(':checked')) {
  		$('.form-inline').find('[type="submit"]').removeClass('disabled');	
  	} else {
  		$('.form-inline').find('[type="submit"]').addClass('disabled');
  	}
  });

});

