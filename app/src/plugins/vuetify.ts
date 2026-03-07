import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import '@mdi/font/css/materialdesignicons.css'

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        dark: false,
        colors: {
          primary: '#1867C0',
          'btn-color': '#1867C0',
          secondary: '#5CBBF6',
        },
      },
      dark: {
        dark: true,
        colors: {
          primary: '#2196F3',
          'btn-color': '#1867C0',
          secondary: '#424242',
          background: '#302e2e',
          surface: '#252222',
          'surface-variant': '#333333',
        },
      },
    },
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
})

export default vuetify
