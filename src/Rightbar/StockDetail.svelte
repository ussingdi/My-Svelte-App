<script>
  import themeColor from "../storeThemes";
</script>

<div class="detail-head {$themeColor}">Stock Detail</div>
<div class="detail">
  <div class="prev-close grid-elem">
    <div class="prop">Prev Close</div>
    <div class="value {$themeColor}">47.73</div>
  </div>
  <div class="days-range grid-elem">
    <div class="prop">Day’s Range</div>
    <div class="value {$themeColor}">47.71 - 48.87</div>
  </div>
  <div class="open grid-elem">
    <div class="prop">Open</div>
    <div class="value {$themeColor}">47.68</div>
  </div>
  <div class="52-week-change grid-elem">
    <div class="prop">52 wk Range</div>
    <div class="value {$themeColor}">46.3 - 68.48</div>
  </div>
  <div class="volume grid-elem">
    <div class="prop">Volume</div>
    <div class="value {$themeColor}">50,368,874</div>
  </div>
  <div class="market-cap grid-elem">
    <div class="prop">Market Cap</div>
    <div class="value {$themeColor}">198.8B</div>
  </div>
  <div class="avg-volume grid-elem">
    <div class="prop">Avg. Vol.</div>
    <div class="value {$themeColor}">34,599,178</div>
  </div>
  <div class="p-e-ratio grid-elem">
    <div class="prop">P/E Ratio</div>
    <div class="value {$themeColor}">9.82</div>
  </div>
  <div class="year-changegrid-elem grid-elem">
    <div class="prop">1-Year Change</div>
    <div class="value {$themeColor}">-12.05%</div>
  </div>

  <div class="dividend grid-elem">
    <div class="prop">Dividend</div>
    <div class="value {$themeColor}">1.46</div>
  </div>
  <div class="revenue grid-elem">
    <div class="prop">Revenue</div>
    <div class="value {$themeColor}">79.02B</div>
  </div>

  <div class="beta grid-elem">
    <div class="prop">Beta</div>
    <div class="value {$themeColor}">0.55</div>
  </div>
  <div class="eps grid-elem">
    <div class="prop">EPS</div>
    <div class="value {$themeColor}">4.68</div>
  </div>
  <div class="next-earning-date grid-elem">
    <div class="prop">Next Earning Rate</div>
    <div class="value {$themeColor}">Apr 28</div>
  </div>
</div>

<style>
  .detail-head {
    position: absolute;
    width: 107px;
    height: 27px;
    top: 22px;
    left: 32px;
    color: #202246;
    font-family: Poppins;
    font-size: 18px;
    font-weight: 500;
    line-height: 27px;
    letter-spacing: 0em;
    text-align: left;
  }
  .detail {
    width: 367px;
    height: 222px;
    top: 81px;
    position: absolute;
    left: 31px;
    display: grid;
    grid-template-columns: auto auto;
  }
  .dark {
    color: #fff;
  }
  .grid-elem {
    width: 167px;
    height: 18px;
    display: flex;
    justify-content: space-between;
  }
  .prop {
    font-family: Poppins;
    font-size: 12px;
    font-weight: 400;
    line-height: 18px;
    letter-spacing: 0em;
    text-align: left;
    color: #838690;
  }
  .value {
    font-family: Poppins;
    font-size: 12px;
    font-weight: 500;
    line-height: 18px;
    letter-spacing: 0em;
    text-align: left;
  }
</style>
