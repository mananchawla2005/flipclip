// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@nuxtjs/tailwindcss", "@nuxt/fonts", "nuxt-icon"],
  runtimeConfig: {
    auth0Domain: '',
    auth0ClientId: '',
    auth0ClientSecret: '',
    googleApiKey: '',
    azureIndex: '',
    azureTTS: '',
    cloudflareAccountId: '',
    cloudflareAccountSecret: '',
    dbUri: ''
  },

  compatibilityDate: "2025-01-10",
    routeRules: {
    // when someone hits "/", send them to "/login"
    '/': { 
      redirect: '/login'         // 307 Temporary by default
      // or, for a permanent (301) redirect:
      // redirect: { to: '/login', statusCode: 301 }
    },
  },
})