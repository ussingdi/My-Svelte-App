<script>
  import SideBar from "./Sidebar/Sidebar.svelte";
  import RightBar from "../src/Rightbar/RightBar.svelte";
  import themeColor from ".//storeThemes";
</script>

<div class="div">
  <SideBar />
  <div class="right-bar {$themeColor}">
    <RightBar />
  </div>
</div>

<style>
  .div {
    width: 1440px;
    height: 1024px;
    border: 1px none;
  }
  .right-bar {
    display: flex;
    flex-direction: column;
    height: 1024px;
    left: 96px;
    position: absolute;
    top: 0;
    width: 1344px;
  }
  .light {
    background-color: #f8f8f8;
  }
  .dark {
    background-color: #242627;
  }
</style>
