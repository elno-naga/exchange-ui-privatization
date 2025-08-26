(() => {
  class SwiperExtend {
    init() {
      this.$swiper = document.querySelector('#swiper-wrap');
      this.$slideList = this.$swiper.querySelector('.slide-list');
      this.$slideItem = this.$swiper.querySelectorAll('.slide-item');
      if (this.$slideItem.length > 4) {
        this.$prev = this.$swiper.querySelector('.prev-btn');
        this.$next = this.$swiper.querySelector('.next-btn');
        this.setBtnStyle();
      }
      this.activeIndex = 0;
      this.len = Math.ceil(this.$slideItem.length / 4);
      this.bindEvent();
    }

    bindEvent() {
      if (this.$slideItem.length > 4) {
        this.$prev.addEventListener('click', () => {
          if (this.activeIndex > 0) {
            this.activeIndex -= 1;
            this.setBtnStyle();
            this.$slideList.style.transform = `translate3d(-${this.activeIndex * 1212}px, 0, 0)`;
          }
        });
        this.$next.addEventListener('click', () => {
          if (this.activeIndex < (this.len - 1)) {
            this.activeIndex += 1;
            this.setBtnStyle();
            this.$slideList.style.transform = `translate3d(-${this.activeIndex * 1212}px, 0, 0)`;
          }
        });
      }
    }

    setBtnStyle() {
      if (this.activeIndex === 0) {
        this.$prev.style.cursor = 'not-allowed';
      } else {
        this.$prev.style.cursor = 'pointer';
      }
      if (this.activeIndex === (this.len - 1)) {
        this.$next.style.cursor = 'not-allowed';
      } else {
        this.$next.style.cursor = 'pointer';
      }
    }
  }
  window.SwiperExtend = SwiperExtend;
})();
