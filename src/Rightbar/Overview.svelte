<script>
  import themeColor from "../storeThemes";
</script>

<div class="group-3">
  <div class="info">
    <h1 class="h-1">48.82</h1>
    <div class="element">+1.09(+2.28&amp;)</div>
    <p class="p">Feb 01, 1:01:56 PM UTC+4, NASDAQ</p>
    <img class="polygon" alt="Polygon" src=".//static/img/polygon-1.svg" />
  </div>
  <div class="time">
    <div class="navbar-2 {$themeColor}">
      <div class="text-13">1D</div>
      <div class="text-14">1W</div>
      <div class="text-13">1M</div>
      <div class="text-13">6M</div>
      <div class="text-13">1Y</div>
      <div class="text-13">All</div>
    </div>
    <img
      class="frame-3 {$themeColor}"
      alt="Frame"
      src=".//static/img/frame-4.svg"
    />
    <img
      class="frame-4 {$themeColor}"
      alt="Frame"
      src=".//static/img/frame-5.svg"
    />
  </div>
</div>
<div class="chart">
  <div class="line">
    <div class="horizontal">
      <img
        class="line-2 horizontal-line"
        alt="Line"
        src=".//static/img/line-7.svg"
      />
      <img
        class="line-3 horizontal-line"
        alt="Line"
        src=".//static/img/line-7.svg"
      />
      <img
        class="line-4 horizontal-line"
        alt="Line"
        src=".//static/img/line-7.svg"
      />
      <img
        class="line-5 horizontal-line"
        alt="Line"
        src=".//static/img/line-7.svg"
      />
      <img
        class="line-6 horizontal-line"
        alt="Line"
        src=".//static/img/line-7.svg"
      />
      <img
        class="line-7 horizontal-line"
        alt="Line"
        src=".//static/img/line-7.svg"
      />
      <img
        class="line-8 horizontal-line"
        alt="Line"
        src=".//static/img/line-7.svg"
      />
    </div>
    <div class="vertical">
      <img
        class="line-9 vertical-line"
        alt="Line"
        src=".//static/img/line-8.svg"
      />
      <img
        class="line-10 vertical-line"
        alt="Line"
        src=".//static/img/line-14.svg"
      />
      <img
        class="line-11 vertical-line"
        alt="Line"
        src=".//static/img/line-14.svg"
      />
      <img
        class="line-12 vertical-line"
        alt="Line"
        src=".//static/img/line-14.svg"
      />
      <img
        class="line-13 vertical-line"
        alt="Line"
        src=".//static/img/line-14.svg"
      />
      <img
        class="line-14 vertical-line"
        alt="Line"
        src=".//static/img/line-14.svg"
      />
      <img
        class="line-15 vertical-line"
        alt="Line"
        src=".//static/img/line-14.svg"
      />
    </div>
  </div>
  <img class="chart-2" alt="Chart" src=".//static/img/chart.png" />
  <div class="date">
    <div class="date-element">26 Jan 22</div>
    <div class="date-element">27 Jan 22</div>
    <div class="date-element">28 Jan 22</div>
    <div class="date-element">29 Jan 22</div>
    <div class="date-element">30 Jan 22</div>
    <div class="date-element">31 Jan 22</div>
    <div class="date-element">01 Feb 22</div>
  </div>
  <div class="price">
    <div class="price-elem">56.00</div>
    <div class="price-elem">55.00</div>
    <div class="price-elem">54.00</div>
    <div class="price-elem">53.00</div>
    <div class="price-elem">52.00</div>
    <div class="price-elem">51.00</div>
    <div class="price-elem">50.00</div>
  </div>
</div>

<style>
  .info {
    height: 61px;
    left: 31px;
    position: absolute;
    top: 33px;
    width: 202px;
  }

  .h-1 {
    color: #5db466;
    font-family: "Poppins", Helvetica;
    font-size: 24px;
    font-weight: 600;
    left: 16px;
    letter-spacing: 0;
    line-height: normal;
    position: absolute;
    top: 0;
  }

  .element {
    color: #5db466;
    font-family: "Poppins", Helvetica;
    font-size: 12px;
    font-weight: 600;
    left: 91px;
    letter-spacing: 0;
    line-height: normal;
    position: absolute;
    top: 13px;
  }

  .p {
    color: #838690;
    font-family: "Poppins", Helvetica;
    font-size: 12px;
    font-weight: 400;
    left: 0;
    letter-spacing: 0;
    line-height: normal;
    position: absolute;
    top: 43px;
  }

  .polygon {
    height: 9px;
    left: 1px;
    position: absolute;
    top: 14px;
    width: 10px;
  }

  .time {
    height: 30px;
    left: 422px;
    position: absolute;
    top: 64px;
    width: 364px;
  }

  .navbar-2 {
    align-items: flex-start;
    background-color: #f4f7fa;
    border-radius: 9px;
    display: flex;
    gap: 32px;
    left: 42px;
    padding: 6px 16px;
    position: absolute;
    top: 0;
    width: fit-content;
  }
  .light {
    background-color: #f4f7fa;
  }
  .dark {
    background-color: #242627;
  }
  .frame-3 {
    position: absolute;
    left: 0px;
  }
  .frame-4 {
    position: absolute;
    right: 0px;
  }
  .text-13 {
    color: #919ca6;
    font-family: "Poppins", Helvetica;
    font-size: 12px;
    font-weight: 400;
    letter-spacing: 0;
    line-height: normal;
    margin-top: -1px;
    position: relative;
    width: fit-content;
  }

  .text-14 {
    color: #0084ff;
    font-family: "Poppins", Helvetica;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0;
    line-height: normal;
    margin-top: -1px;
    position: relative;
    width: fit-content;
  }
  .chart {
    width: 754px;
    height: 400px;
    top: 126px;
    left: 31px;
    position: absolute;
  }

  .line {
    width: 668px;
    height: 294px;
    position: absolute;
    left: 0px;
    top: 33px;
    width: 668px;
  }
  .date {
    width: 632px;
    height: 18px;
    top: 350px;
    left: 32px;
    position: absolute;
    font-family: Poppins;
    font-size: 12px;
    font-weight: 400;
    line-height: 18px;
    letter-spacing: 0em;
    text-align: left;
    display: flex;
    justify-content: space-between;
    color: #838690;
  }
  .price {
    width: 33px;
    height: 294px;
    position: absolute;
    font-family: Poppins;
    font-size: 12px;
    font-weight: 400;
    line-height: 18px;
    letter-spacing: 0em;
    text-align: left;
    display: flex;
    justify-content: space-between;
    color: #838690;
    top: 32px;
    left: 689px;
    flex-direction: column;
  }

  .horizontal {
    width: 668px;
    height: 276px;
    border: 1px;
    bottom: 0px;
    position: absolute;
  }
  .horizontal-line {
    height: 1px;
    left: 0;
    object-fit: cover;
    position: absolute;
    width: 668px;
    color: #0000001a;
    border: 1px solid #0000001a;
  }
  .line-2 {
    bottom: 0px;
  }
  .line-3 {
    bottom: 46px;
  }
  .line-4 {
    bottom: 92px;
  }
  .line-5 {
    bottom: 138px;
  }
  .line-6 {
    bottom: 184px;
  }
  .line-7 {
    bottom: 230px;
  }
  .line-8 {
    bottom: 276px;
  }

  .vertical {
    width: 576px;
    height: 294px;
    left: 61px;
    border: 1px;
    position: absolute;
  }
  .vertical-line {
    height: 293px;
    object-fit: cover;
    position: absolute;
    top: 0;
    width: 1px;
    background: #0000001a;
    border: 1px dotted #0000001a;
  }
  .line-9 {
    left: -1px;
  }
  .line-10 {
    left: 95px;
  }
  .line-11 {
    left: 192px;
  }
  .line-12 {
    left: 289px;
  }
  .line-13 {
    left: 386px;
  }
  .line-14 {
    left: 481px;
  }

  .chart-2 {
    height: 247px;
    left: 0;
    position: absolute;
    top: 83px;
    width: 670px;
  }
</style>
