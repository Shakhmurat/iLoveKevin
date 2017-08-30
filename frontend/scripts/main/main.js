'use strict';

document.addEventListener('DOMContentLoaded', function() {

  var swiper = new Swiper('.swiper-container', {
    pagination: '.swiper-pagination',
    paginationClickable: true,
    autoHeight: true
  });

  var inputControls = document.querySelectorAll('.form-control'),
      nameField = document.querySelector('.js-validate-name'),
      passField = document.querySelector('.js-validate-pass'),
      checkField = document.querySelector('.js-validate-check'),
      submit = document.querySelector('.form-inline [type="submit"]');

  inputControls.forEach(function (el) {
    el.addEventListener('keyup', formValidate)
    el.addEventListener('change', formValidate)
  })

  function formValidate(){
    if(nameField.value.length && passField.value.length > 10 && checkField.checked) {
      submit.classList.remove('disabled')
    } else {
      submit.classList.add('disabled')
    }
  }

  function scrollIt(destination, duration = 500) {

    function easing(t) { 
      return t * (2 - t);
    }

    const start = window.pageYOffset;
    const startTime = 'now' in window.performance ? performance.now() : new Date().getTime();

    const documentHeight = Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight);
    const windowHeight = window.innerHeight || document.documentElement.clientHeight || document.getElementsByTagName('body')[0].clientHeight;
    const destinationOffset = typeof destination === 'number' ? destination : destination.offsetTop;
    const destinationOffsetToScroll = Math.round(documentHeight - destinationOffset < windowHeight ? documentHeight - windowHeight : destinationOffset);

    if ('requestAnimationFrame' in window === false) {
      window.scroll(0, destinationOffsetToScroll);
      return;
    }

    function scroll() {
      const now = 'now' in window.performance ? performance.now() : new Date().getTime();
      const time = Math.min(1, ((now - startTime) / duration));
      const timeFunction = easing(time);
      window.scroll(0, Math.ceil((timeFunction * (destinationOffsetToScroll - start)) + start));

      if (window.pageYOffset === destinationOffsetToScroll) {
        return;
      }

      requestAnimationFrame(scroll);
    }

    scroll();
  }

  var navHeaderItems = document.querySelectorAll('.header-nav .link');

  navHeaderItems.forEach(function(el){
    el.addEventListener('click', function(e){
      e.preventDefault();
      var target = e.currentTarget;
      scrollIt(document.querySelector(target.hash));
    })
  });


});

