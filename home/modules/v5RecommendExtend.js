(() => {
  const { myStorage, colorMap, getCoinShowName } = window.BlockChainUtils;
  class RecommendExtend {
    init(market) {
      this.$recommendWrap = this.$recommend.querySelector('.recommend-list');
      this.symbolAll = market.symbolAll;
      this.dataList = [];
      this.symbolList = [];
      this.groupList = [];
      this.domTree = {};
      this.groupNodeCopy = null;
      this.num = 0;
      this.len = 0;
      this.scrollTimer = null;
      this.resolveSymbol();
      window.emitter.on('RECOMMEEND_DATA', (data) => {
        this.resloveRecommendData(data);
      });
      this.bindEvent();
    }

    resolveSymbol() {
      const list = this.headerSymbol.split(',');
      let temp = [];
      const symbolList = [];
      list.forEach((item, index) => {
        temp.push(item);
        if (temp.length === 5 || index === (list.length - 1)) {
          symbolList.push([...temp]);
          temp = [];
        }
      });
      this.symbolList = [...symbolList];
      this.len = this.symbolList.length;
      this.setGroupView();
    }

    setGroupView() {
      this.$recommendWrap.innerHTML = '';
      const { symbolAll } = this;
      this.groupList = [...this.symbolList];
      this.groupList.push(this.symbolList[0]);
      this.groupList.forEach((item, index) => {
        const groupNode = document.createElement('ul');
        groupNode.className = 'recommend-list_group';
        item.forEach((symbol) => {
          const itemNode = document.createElement('li');
          const name = getCoinShowName(symbol, symbolAll);
          itemNode.className = 'recommend-item';
          itemNode.innerHTML = `
            <div class="symbol-detail">
              <span class="symbol-name">${name}</span>
              <i class="symbol-change"></i>
            </div>
            <div class="symbol-price"></div>
            <div class="symbol-otcPrice"></div>
          `;
          this.domTree[symbol + index] = itemNode;
          itemNode.addEventListener('click', () => {
            let coin = symbol;
            if (symbol.indexOf('-c') > -1) {
              coin = symbol.replace('-c', '');
            }
            myStorage.set('sSymbolName', coin);
            myStorage.set('markTitle', coin.split('/')[1]);
            let sSymbolShowName = symbol;
            if (symbolAll[symbol] && symbolAll[symbol].showName) {
              sSymbolShowName = symbolAll[symbol].showName;
            }
            window.location.href = `/trade/${sSymbolShowName.replace('/', '_')}`;
          }, false);
          groupNode.appendChild(itemNode);
        });
        this.$recommendWrap.appendChild(groupNode);
      });
      if (this.len > 1) {
        this.setAutoScroll();
      }
    }

    resloveRecommendData(data) {
      const { recommendDataList, coinList, coinTagLangs } = data;
      const keys = Object.keys(recommendDataList);
      keys.forEach((item) => {
        const coinLabel = (recommendDataList[item] && recommendDataList[item].symbol)
          ? this.getCoinLabel(recommendDataList[item].symbol.symbol, coinList, coinTagLangs)
          : '';
        recommendDataList[item].coinLabel = coinLabel;
      });
      this.dataList = recommendDataList;
      this.setView();
    }

    setView() {
      this.groupList.forEach((item, index) => {
        item.forEach((symbol) => {
          const $change = this.domTree[symbol + index].querySelector('.symbol-change');
          const $price = this.domTree[symbol + index].querySelector('.symbol-price');
          const $otcPrice = this.domTree[symbol + index].querySelector('.symbol-otcPrice');
          let change = '';
          let changeClass = '';
          let price = '--';
          let otcPrice = '--';
          if (this.dataList[symbol] && this.dataList[symbol].symbol) {
            change = this.dataList[symbol].rose.data || '';
            changeClass = this.dataList[symbol].rose.class || '';
            price = this.dataList[symbol].close.data || '--';
            otcPrice = this.dataList[symbol].close.price || '--';
          }
          $change.innerHTML = change;
          $change.className = `symbol-change ${changeClass}`;
          $price.innerHTML = price;
          $otcPrice.innerHTML = otcPrice;
        });
      });
    }

    setAutoScroll() {
      this.scrollTimer = setInterval(() => {
        this.$recommendWrap.style.transition = 'all 0.3s';
        this.num += 1;
        this.goPage();
      }, 5300);
    }

    bindEvent() {
      if (this.scrollTimer) {
        this.$recommendWrap.addEventListener('mouseenter', () => {
          clearInterval(this.scrollTimer);
          this.scrollTimer = null;
        });
        this.$recommendWrap.addEventListener('mouseleave', () => {
          this.setAutoScroll();
        });
      }
    }

    goPage() {
      this.$recommendWrap.style.transform = `translate3d(0, -${this.num * 76}px, 0)`;
      setTimeout(() => {
        if (this.num === this.len) {
          this.num = 0;
          this.$recommendWrap.style.transition = 'none';
          this.$recommendWrap.style.transform = 'translate3d(0, 0, 0)';
        }
      }, 300);
    }

    setData(coin) {
      const coinC = coin.replace('-c', '');
      let color = this.klineColor;
      if (this.roseConfig) {
        if (this.dataList[coinC]) {
          if (this.dataList[coinC].rose) {
            if (this.dataList[coinC].rose.class) {
              color = colorMap[this.dataList[coinC].rose.class];
            }
          }
        }
      }
      if (this.cusKlineColor) {
        color = this.cusKlineColor;
      }
      if (this.cusTomKline) {
        this.cusTomKline(color, coinC);
      }
      let { lineWidth } = this;
      if (this.cusLineWidth) {
        lineWidth = this.cusLineWidth;
      }
      let data = this.klineDataList[coinC]
        ? JSON.parse(JSON.stringify(this.klineDataList[coinC])) : {};
      this.myEcharts[coin].resize();
      this.myEcharts[coin].setOption({
        series: [
          {
            data,
            type: 'line',
            lineStyle: {
              normal: {
                color,
                width: lineWidth,
              },
            },
          },
        ],
      });
      data = null;
    }

    getCoinLabel(name, coinList = {}, coinTagLangs) {
      if (coinList && coinList[name.toUpperCase()]) {
        const { coinTag = '' } = coinList[name.toUpperCase()];
        return coinTag ? coinTagLangs[coinTag] : '';
      }

      return '';
    }

    labelShow(coinLabel, coin, len, index) {
      if (this.domTree[coin]['coin-text']) {
        if (coinLabel) {
          this.domTree[coin]['coin-text'].innerHTML = coinLabel;
          this.domTree[coin]['coin-label'].style.display = 'inline-block';
        }
        if (index === len - 1) {
          this.labelisShow = true;
        }
      }
    }
  }

  window.RecommendExtend = RecommendExtend;
})();
