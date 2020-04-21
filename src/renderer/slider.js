'use strict'

function slide(wrapper, items, prev, next) {
  const slides = items.children;
  const slidesCount = slides.length;

  const cloneFirst = slides[0].cloneNode(true);
  const cloneLast = slides[slidesCount - 1].cloneNode(true);
  let index = 1;
  
  items.appendChild(cloneFirst);
  items.insertBefore(cloneLast, slides[0]);
  
  next.addEventListener('click', shift.bind(this, true));
  prev.addEventListener('click', shift.bind(this, false));

  document.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowRight') {
      e.preventDefault();
      shift(true)
    } else if (e.code === 'ArrowLeft') {
      e.preventDefault();
      shift()
    }
  })
  
  items.addEventListener('transitionend', checkIndex);
  
  function shift(isNext) {
    items.classList.add('shifting');
    
    if (slides[index].tagName === 'VIDEO') {
      slides[index].pause();
      slides[index].currentTime = 0;
    }
    
    index += isNext ? 1 : -1;
    items.style.left = `-${index * 100}%`;
  };
    
  function checkIndex() {
    items.classList.remove('shifting');

    if (index === 0) {
      index = slidesCount
    } else if (index === slidesCount + 1) {
      index = 1
    }

    if (slides[index].tagName === 'VIDEO') {
      slides[index].play();
    }

    items.style.left = `-${index * 100}%`;
  }
}

module.exports = {
    slide,
}