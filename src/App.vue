<template>
<img :src="src"/>
</template>

<script lang="ts" setup>

import {onMounted, ref} from "vue";
import {getImages, loadAndSaveImages} from "./service/attachments";
const src = ref('')



onMounted(async () => {
await loadAndSaveImages();
const attachment = await getImages();
  var urlCreator = window.URL || window.webkitURL;
  src.value = urlCreator.createObjectURL(attachment.value);
})

</script>
<style>
button {
  width: 100px;
  height: 100px;
  background: red;
}
</style>