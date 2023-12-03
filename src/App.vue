<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="main-contant">
    <RouterView />
  </div>
</template>

<style lang="sass" scoped>
.main-contant
  min-width: 1200px
  padding: 10px 15px
  background: rgba(#999, .15)
  border: 1px solid rgba(#999, .2)
  margin-top: 1rem
</style>
