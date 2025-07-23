<template>
  <div>
    Nuxt module playground!
  </div>
</template>

<script setup>
if (!process.client) {
  const logger = useNuxtApp().$logger // or useNuxtApp().$<yourName> if you set a custom name
  logger.info('Playground app mounted!')
}
</script>
