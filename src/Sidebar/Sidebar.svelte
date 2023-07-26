<script>
  import themeColor, { storeThemes } from "../storeThemes.js";
  import LogoCone from ".//LogoCone.svelte";
  function ThemeToggler(e) {
    if ($themeColor === "dark") {
      storeThemes.update((themeColor) => "light");
    } else {
      storeThemes.update((themeColor) => "dark");
    }
  }
</script>

<div class="side-bar {$themeColor}">
  <LogoCone />

  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div
    class="market-bg"
    on:click={() => {
      console.log("Market Button Clicked");
    }}
  >
    <img class="market" alt="Market" src=".//static/img/market.svg" />
  </div>

  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <img
    class="language"
    alt="Language"
    src=".//static/img/language.svg"
    on:click={() => {
      console.log("Language Button Clicked");
    }}
  />
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <img
    class="security"
    alt="Security"
    src=".//static/img/security.svg"
    on:click={() => {
      console.log("Security Button Clicked");
    }}
  />
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <img
    class="settings"
    alt="Settings"
    src=".//static/img/settings.svg"
    on:click={() => {
      console.log("Settings Button Clicked");
    }}
  />
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <img
    class="exchange"
    alt="Exchange"
    src=".//static/img/exchange.svg"
    on:click={() => {
      console.log("Exchange Button Clicked");
    }}
  />
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <img
    class="wallet"
    alt="Language"
    src=".//static/img/wallet.svg"
    on:click={() => {
      console.log("Wallet Button Clicked");
    }}
  />
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <img
    class="dashboard"
    alt="dashboard"
    src=".//static/img/dashboard.svg"
    on:click={() => {
      console.log("Dashboard Button Clicked");
    }}
  />
  <div class="switch1">
    <input
      type="checkbox"
      name="checkbox"
      id="toggle"
      on:click={ThemeToggler}
    />
    <label for="toggle" class="switch" />
  </div>
</div>

<style>
  .side-bar {
    width: 96px;
    height: 1024px;
    left: 0;
    top: 0;
    position: absolute;
  }
  .dark {
    background-color: #2c2d31;
  }
  .light {
    background-color: #fefefe;
  }
  .language {
    width: 24px;
    height: 24px;
    top: 832px;
    left: 37px;
    padding: 3px;
    position: absolute;
    cursor: pointer;
  }
  .settings {
    width: 24px;
    height: 24px;
    top: 896px;
    left: 36px;
    position: absolute;
  }

  .security {
    width: 24px;
    height: 24px;
    top: 416px;
    left: 36px;
    position: absolute;
    cursor: pointer;
  }
  .exchange {
    width: 24px;
    height: 24px;
    top: 352px;
    left: 36px;
    cursor: pointer;
    position: absolute;
  }
  .wallet {
    width: 24px;
    height: 24px;
    top: 288px;
    left: 36px;
    padding: 3px;
    position: absolute;
    cursor: pointer;
  }
  .market {
    width: 24px;
    height: 24px;
    top: 8px;
    left: 8px;
    position: absolute;
    cursor: pointer;
  }
  .market-bg {
    width: 40px;
    height: 40px;
    top: 216px;
    position: absolute;
    left: 28px;
    border-radius: 9px;
    text-align: center;
    cursor: pointer;
  }
  .dashboard {
    width: 24px;
    height: 24px;
    top: 160px;
    left: 36px;
    position: absolute;
    cursor: pointer;
  }

  .switch1 {
    width: 40px;
    height: 24px;
    position: absolute;
    border-radius: 12px;
    left: 28px;
    top: 960px;
  }
  .switch {
    position: relative;
    display: inline-block;
    width: 40px;
    height: 24px;
    background-color: #f0f5fa;
    border-radius: 12px;
  }

  .switch::after {
    content: " ";
    position: absolute;
    height: 18px;
    width: 18px;
    background-color: #0085ff;
    border-radius: 50%;
    top: 3px;
    left: 3px;
    transition: all 0.3s linear;
  }

  input[type="checkbox"]:checked + .switch:after {
    translate: 17px 0;
    background-color: #ffffff;
  }

  input[type="checkbox"]:checked + .switch {
    background-color: #5fd46d;
  }

  #toggle {
    display: none;
  }
</style>
