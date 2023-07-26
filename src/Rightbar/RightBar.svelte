<script>
  import Bar1 from ".//Bar1.svelte";
  import Bar2 from ".//Bar2.svelte";
  import themeColor from "../storeThemes";
</script>

<div class="right-bar">
  <div class="bar-1 {$themeColor}">
    <Bar1 />
  </div>
  <div class="bar-2">
    <Bar2 />
  </div>
</div>

<style>
  .dark {
    background-color: #2c2d31;
  }
  .light {
    background-color: #fefefe;
  }
  .bar-1 {
    width: 1344px;
    height: 80px;
  }
  .bar-2 {
    width: 1344px;
    height: 100%;
    height: 944px;
    top: 80px;
    position: absolute;
  }
</style>
