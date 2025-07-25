import { useNuxtApp } from '#app'

export function useLogger() {
    return useNuxtApp().$logger
}