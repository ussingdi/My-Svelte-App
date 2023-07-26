<script>
  import themeColor from "../storeThemes";
</script>

<div class="group-1">
  <!-- svelte-ignore a11y-img-redundant-alt -->
  <img
    class="replace-img1"
    src=".//static/img/replace-image-1.png"
    alt=" replace-image"
  />
  <div class="stock-info {$themeColor}">
    <div class="stock-name">Greenmusk Inc</div>
    <img class="index-img" alt="index-img" src=".//static/img/frame-2.svg" />
    <div class="NASDAQ">
      <span class="index-name {$themeColor}">NASDAQ:</span>
      <span class="span {$themeColor}">GMUSK</span>
    </div>
  </div>
  <div class="watchlist">
    <div class="star">
      <img class="starIn" alt="Star" src=".//static/img/star-1-4.svg" />
    </div>
    <div class="text-watch">Add to WatchList</div>
  </div>
  <img class="frame" alt="Frame" src=".//static/img/frame-2.svg" />

  <div class="group-2">
    <div class="navigation">
      <div class="navbar">
        <div class="nav-1">General</div>
        <div class="nav-2">Chart</div>
        <div class="nav-3">Analysis</div>
        <div class="nav-4">News</div>
        <div class="nav-5">Financials</div>
        <div class="nav-">Forum</div>
      </div>
      <img class="line" alt="Line" src=".//static/img/line-17.svg" />
    </div>
  </div>
</div>

<style>
  .replace-img1 {
    top: 32px;
    position: absolute;
    left: 32px;
    height: 58px;
    width: 58px;
  }
  .stock-info {
    position: absolute;
    width: 173px;
    height: 58px;
    top: 32px;
    left: 106px;
  }
  .stock-name {
    font-family: Poppins;
    font-size: 20px;
    font-weight: 600;
    line-height: 30px;
    letter-spacing: 0em;
    text-align: left;
  }
  .index-img {
    width: 20px;
    height: 14px;
    left: 0px;
    top: 44px;
    position: absolute;
  }

  .NASDAQ {
    position: absolute;
    left: 24px;
    height: 18px;
    top: 42px;
  }
  .index-name {
    font-family: Poppins;
    font-size: 12px;
    font-weight: 600;
    line-height: 18px;
    letter-spacing: 0em;
    text-align: left;
  }
  .span {
    font-family: Poppins;
    font-size: 12px;
    font-weight: 400;
    line-height: 18px;
    letter-spacing: 0em;
    text-align: left;
  }
  .light {
    color: #202246;
  }
  .dark {
    color: #ffffff;
  }
  .span.light {
    color: #0085ff;
  }
  .span.dark {
    color: #fff;
  }
  .watchlist {
    width: 149px;
    height: 30px;
    top: 60px;
    position: absolute;
    left: 595px;
    background-color: #0085ff;
    display: flex;
    gap: 8px;
    justify-content: center;
    padding: 6px 12px;
    border-radius: 4px;
    width: fit-content;
  }
  .star {
    width: 18px;
    height: 18px;
    padding: 0.5px 0.75px 0px 0.75px;
  }
  .starIn {
    height: 16.5px;
    top: 1.5px;
    left: 0.75px;
    border: 1.125px;
    color: #ffffff;
    width: Hug (149px);
    height: Hug (30px);
  }

  .text-watch {
    font-family: Poppins;
    font-size: 12px;
    font-weight: 400;
    line-height: 18px;
    letter-spacing: 0em;
    text-align: left;
  }

  .frame {
    top: 60px;
    left: 756px;
    position: absolute;
  }

  .group-2 {
    position: absolute;
    width: 502px;
    height: 50px;
    top: 112px;
    left: 32px;
  }
  .navbar {
    display: flex;
    justify-content: space-between;
    color: #838690;
    font-family: Poppins;
    font-size: 12px;
    font-weight: 400;
    line-height: 18px;
    letter-spacing: 0em;
    text-align: left;
  }
  .nav-1 {
    color: #202246;
  }

  .line {
    height: 2px;
    left: 0;
    position: absolute;
    top: 49px;
    width: 48px;
  }
</style>
