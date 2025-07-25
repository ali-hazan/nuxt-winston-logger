<template>
  <div>
    Nuxt module playground!
  </div>
</template>

<script setup>
if (!process.client) {
  const logger = useLogger()
  logger.info('Hello %s', 'world'); // Outputs: Hello world
}
</script>
