<script>
  import Light from "./Light.svelte";
  let name = "world";

  function uvaisFunction(node) {
    console.log(node);

    return {
      destroy() {
        console.log("Node is destroyed");
      },
    };
  }
</script>

<div class="light">
  <Light />
</div>

<style>
  .light {
    background-color: #f8f8f8;
    display: flex;
    flex-direction: row;
    justify-content: center;
    width: 1440px;
  }
</style>
