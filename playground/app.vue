<template>
  <div>
    Nuxt module playground!
  </div>
</template>

<script setup>
const logger = useLogger()
logger.info('Hello %s', 'world');
</script>
