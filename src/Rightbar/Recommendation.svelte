<script>
  import themeColor from "../storeThemes";
</script>

<div class="recom-head {$themeColor}">People Also Watch</div>
<div class="recom-stock-info">
  <div class="name">Name</div>
  <div class="recom-price">Price</div>
  <div class="recom-change">Change %</div>
</div>
<div class="stockk">
  <div class="stockk-info">
    <div class="stockk-symbol {$themeColor}">QCOM</div>
    <div class="stockk-name">Qualcomm Incorporate</div>
    <div class="stockk-price {$themeColor}">175.76</div>
    <div class="stockk-change1">+5.37%</div>
    <div class="stockk-change2">8.95%</div>
    <div class="stockk-star">
      <img
        class="star-3 star-3-select"
        alt="Star"
        src=".//static/img/star-1-3.svg"
      />
    </div>
  </div>
  <div class="stockk-info">
    <div class="stockk-name">Texas Instrument</div>
    <div class="stockk-symbol {$themeColor}">TXN</div>
    <div class="stockk-price {$themeColor}">179.49</div>
    <div class="stockk-change1">+1.24%</div>
    <div class="stockk-change2">+2.20%</div>
    <div class="stockk-star">
      <img class="star-3" alt="Star" src=".//static/img/Star.svg" />
    </div>
  </div>
  <div class="stockk-info">
    <div class="stockk-name">Nvidia Corporation</div>
    <div class="stockk-symbol {$themeColor}">NVDA</div>
    <div class="stockk-price {$themeColor}">244.86</div>
    <div class="stockk-change1">+7.21%</div>
    <div class="stockk-change2">+9.01%</div>
    <div class="stockk-star">
      <img class="star-3" alt="Star" src=".//static/img/Star.svg" />
    </div>
  </div>
  <div class="stockk-info">
    <div class="stockk-name">Tesla Inc</div>
    <div class="stockk-symbol {$themeColor}">TSLA</div>
    <div class="stockk-price {$themeColor}">936.72</div>
    <div class="stockk-change1">+10.24%</div>
    <div class="stockk-change2">+12.20%</div>
    <div class="stockk-star">
      <img class="star-3" alt="Star" src=".//static/img/Star.svg" />
    </div>
  </div>
</div>

<style>
  .recom-head {
    width: 169px;
    height: 27px;
    top: 32px;
    left: 32px;
    position: absolute;
    font-family: Poppins;
    font-size: 18px;
    font-weight: 500;
    line-height: 27px;
    letter-spacing: 0em;
    text-align: left;
  }
  .light {
    color: #202246;
  }
  .dark {
    color: #ffffff;
  }

  .recom-stock-info {
    position: absolute;
    width: 322px;
    height: 18px;
    top: 79px;
    left: 32px;
    font-family: Poppins;
    font-size: 12px;
    font-weight: 400;
    line-height: 18px;
    color: #838690;
    letter-spacing: 0em;
    text-align: left;
  }

  .recom-price {
    position: absolute;
    left: 193px;
    top: 0px;
  }
  .recom-change {
    position: absolute;
    top: 0px;
    right: 0px;
  }

  .stockk {
    width: 366px;
    height: 201px;
    position: absolute;
    top: 121px;
    left: 32px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .stockk-info {
    height: 40px;
    width: 100%;
    position: relative;
  }

  .stockk-symbol {
    height: 21px;
    position: absolute;
    top: 0px;
    left: 0px;
    font-family: Poppins;
    font-size: 12px;
    font-weight: 600;
    line-height: 18px;
    letter-spacing: 0em;
    text-align: left;
  }

  .stockk-name {
    height: 18px;
    bottom: 0px;
    position: absolute;
    font-family: Poppins;
    font-size: 12px;
    font-weight: 400;
    line-height: 18px;
    letter-spacing: 0em;
    text-align: left;
    color: #838690;
  }
  .stockk-price {
    height: 21px;
    position: absolute;
    left: 187px;
    font-family: Poppins;
    font-size: 14px;
    font-weight: 500;
    line-height: 21px;
    letter-spacing: 0em;
    text-align: left;
  }
  .stockk-change1 {
    position: absolute;
    height: 21px;
    color: #5fd46d;
    left: 261px;
    font-family: Poppins;
    font-size: 14px;
    font-weight: 600;
    line-height: 21px;
    letter-spacing: 0em;
    text-align: left;
  }

  .stockk-change2 {
    position: absolute;
    height: 18px;
    left: 274px;
    color: #5fd46d;
    font-family: Poppins;
    font-size: 12px;
    font-weight: 500;
    line-height: 18px;
    letter-spacing: 0em;
    text-align: left;
    bottom: 0px;
  }

  .star-3 {
    position: absolute;
    right: 0px;
    height: 22px;
    width: 22px;
    top: 9px;
  }
</style>
