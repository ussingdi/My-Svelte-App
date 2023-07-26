<script>
  import themeColor from "../storeThemes";
</script>

<div class="news1 n1 {$themeColor}">
  <img src=".//static/img/replace-image-1.png" alt="Bg-Img" class="n-img" />
  <p class="news-para">Vodafone to design chips with Intel for..</p>
  <div class="news-time">18h Ago</div>
</div>
<div class="news2 n1 {$themeColor}">
  <img src=".//static/img/replace-image-1.png" alt="Bg-Img" class="n-img" />
  <p class="news-para">Apple, Microsoft and Intel earnings give a..</p>
  <div class="news-time">20h Ago</div>
</div>
<div class="news3 n1 {$themeColor}">
  <img src=".//static/img/replace-image-1.png" alt="Bg-Img" class="n-img" />
  <p class="news-para {$themeColor}">
    Vodafone teams up with Intel on OpenRAN in..
  </p>
  <div class="news-time">1D Ago</div>
</div>
<div class="news4 {$themeColor}">
  <img src=".//static/img/replace-image-1.png" alt="Bg-Img" class="n4-img" />
  <p class="news4-para">The Real Risk To Growth Stock And 'Style' Investing</p>
  <div class="news-time">2D ago</div>
</div>
<div class="see-all {$themeColor}">
  <div class="see-all-text">See All</div>
</div>

<style>
  .dark {
    background-color: #2c2d31;
    color: #ffffff;
  }
  .light {
    background-color: #fefefe;
  }
  .n1 {
    width: 252px;
    height: 87px;
    top: 12px;
    position: absolute;
    border-radius: 9px;
  }
  .n-img {
    background-position: 50% 50%;
    background-size: cover;
    border-radius: 6px;
    height: 63px;
    left: 12px;
    position: absolute;
    top: 12px;
    width: 63px;
  }
  .n4-img {
    background-position: 50% 50%;
    background-size: cover;
    border-radius: 6px;
    height: 74px;
    width: 74px;
    position: absolute;
    left: 12px;
    top: 12px;
  }
  .news1 {
    left: 0px;
  }
  .news2 {
    left: 284px;
  }
  .news3 {
    left: 566px;
  }
  .news-para {
    width: 153px;
    height: 40px;
    top: 12px;
    position: absolute;
    left: 87px;
    font-family: Poppins;
    font-size: 12px;
    font-weight: 400;
    line-height: 20px;
    letter-spacing: 0em;
    text-align: left;
  }
  .news-time {
    width: 50px;
    height: 20px;
    top: 55px;
    left: 87px;
    font-family: Poppins;
    font-size: 12px;
    font-weight: 400;
    line-height: 20px;
    letter-spacing: 0em;
    text-align: left;
    position: absolute;
    color: rgba(131, 134, 144, 1);
  }
  .news4 {
    left: 850px;
    position: absolute;
    width: 352px;
    height: 98px;
    top: 0px;
    border-radius: 9px;
  }
  .news4-para {
    width: 237px;
    height: 40px;
    top: 17px;
    left: 98px;
    font-family: Poppins;
    font-size: 12px;
    font-weight: 400;
    line-height: 20px;
    letter-spacing: 0em;
    text-align: left;
    position: absolute;
  }
  .see-all {
    width: 46px;
    height: 98px;
    border-radius: 9px;
    right: 0px;
    top: 0px;
    position: absolute;
  }
  .see-all.light {
    background-color: #0085ff;
  }
  .see-all.dark {
    background-color: #2c2d31;
  }

  .see-all-text {
    width: 23px;
    height: 40px;
    top: 29px;
    left: 12px;
    color: #ffffff;
    font-family: Poppins;
    font-size: 12px;
    line-height: 20px;
    font-weight: 500;
    text-align: left;
    letter-spacing: 0em;
    position: absolute;
  }
</style>
