<script>
  import themeColor from "../storeThemes";
</script>

<div class="logo-bg {$themeColor}">
  <img class="img {$themeColor}" alt="Logo" src=".//static/img/cone.svg" />
</div>

<style>
  .logo-bg {
    width: 40px;
    height: 40px;
    top: 36px;
    left: 29px;
    border-radius: 9px;
    position: absolute;
  }
  .img {
    position: absolute;
    top: 8px;
    left: 8px;
  }
  .light {
    background-color: #fefaed;
  }
  .dark {
    background-color: #723dec;
  }
</style>
