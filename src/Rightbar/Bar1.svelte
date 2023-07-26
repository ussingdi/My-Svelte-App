<script>
  import themeColor from "../storeThemes";
</script>

<div class="search">
  <div class="search-rectangle {$themeColor}">
    <img class="search-box" alt="search-box" src=".//static/img/box-1.svg" />
    <div class="text">Search Something</div>
  </div>
</div>
<div class="tabs">
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <img
    class="notif-img"
    alt="Notif img"
    src=".//static/img/notif.svg"
    on:click={() => {
      console.log("Notifications Button Clicked");
    }}
  />
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <img
    class="message"
    alt="message"
    src=".//static/img/message.svg"
    on:click={() => {
      console.log("Message Button Clicked");
    }}
  />
  <div class="profile">
    <!-- svelte-ignore a11y-img-redundant-alt -->
    <img
      class="user-img"
      alt="User Image"
      src=".//static/img/replace-image.png"
    />

    <div class="user-name {$themeColor}">Uvais Singdi</div>
    <div class="user-email {$themeColor}">uvais@Greenmusk.com</div>
  </div>
</div>

<style>
  .search {
    width: 390px;
    height: 44px;
    position: absolute;
    top: 18px;
    left: 32px;
  }
  .light {
    background-color: #f8f8f8;
    color: #838690;
  }
  .dark {
    background-color: #35373b;
    color: #838690;
  }
  .search-rectangle {
    border-radius: 9px;
    height: 44px;
    position: relative;
    width: 390px;
  }
  .search-box {
    width: 24px;
    height: 24px;
    top: 8px;
    left: 16px;
    border: 1.5px;
    position: absolute;
  }
  .uvais {
    color: red;
  }
  .text {
    font-size: 12px;
    line-height: 18px;
    font-weight: 400;
    top: 13px;
    left: 48px;
    position: absolute;
  }

  .tabs {
    width: 268px;
    height: 40px;
    position: absolute;
    top: 20px;
    left: 1044px;
  }

  .notif-img {
    top: 8px;
    position: absolute;
    height: 24px;
    width: 24px;
    color: #202246;
    cursor: pointer;
  }
  .message {
    top: 8px;
    position: absolute;
    height: 24px;
    width: 24px;
    left: 40px;
    cursor: pointer;
  }
  .profile {
    height: 40px;
    width: 180px;
    left: 88px;
    position: absolute;
  }

  .user-img {
    height: 40px;
    width: 40px;
    border-radius: 50%;
  }
  .user-name {
    font-family: Poppins;
    font-size: 14px;
    font-weight: 400;
    line-height: 21px;
    letter-spacing: 0em;
    text-align: left;
    left: 52px;
    position: absolute;
    top: 0px;
  }
  .user-name.light {
    color: #202246;
    background-color: #fefefe;
  }
  .user-name.dark {
    color: #ffffff;
    background-color: #2c2d31;
  }
  .user-email {
    font-family: Poppins;
    font-size: 12px;
    font-weight: 400;
    line-height: 18px;
    letter-spacing: 0em;
    text-align: left;
    top: 22px;
    left: 52px;
    position: absolute;
    background-color: #2c2d31;
  }
  .user-email.light {
    color: #c1c9cf;
    background-color: #fefefe;
  }
  .user-email.dark {
    color: #838690;
    background-color: #2c2d31;
  }
</style>
