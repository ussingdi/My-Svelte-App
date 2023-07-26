<script>
  import Overview from "./Overview.svelte";
  import INTC from "./INTC.svelte";
  import News from "./News.svelte";
  import StockDetail from "./StockDetail.svelte";
  import Recommendation from "./Recommendation.svelte";
  import themeColor from "../storeThemes";
</script>

<div class="INTC {$themeColor}">
  <INTC />
</div>

<div class="overview {$themeColor}">
  <Overview />
</div>

<div class="news">
  <News />
</div>

<div class="stockDetail {$themeColor}">
  <StockDetail />
</div>
<div class="recommendation {$themeColor}">
  <Recommendation />
</div>

<style>
  .dark {
    background-color: #2c2d31;
  }
  .light {
    background-color: #fefefe;
  }
  .INTC {
    width: 818px;
    height: 172px;
    left: 32px;
    top: 32px;
    position: absolute;
  }
  .overview {
    width: 818px;
    height: 557px;
    top: 235px;
    left: 32px;
    border-radius: 9px;
    position: absolute;
  }
  .news {
    width: 1280px;
    height: 98px;
    left: 32px;
    top: 814px;
    position: absolute;
  }
  .stockDetail {
    position: absolute;
    width: 430px;
    height: 345px;
    top: 32px;
    left: 882px;
    border-radius: 9px;
  }
  .recommendation {
    width: 430px;
    height: 373px;
    top: 408px;
    left: 880px;
    border-radius: 9px;
    position: absolute;
  }
</style>
