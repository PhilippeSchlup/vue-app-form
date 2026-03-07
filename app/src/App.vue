<script setup lang="ts">
import { ref } from 'vue'
import { useTheme } from 'vuetify'
import SurveyForm from './components/SurveyForm.vue'
import AdminPanel from './components/AdminPanel.vue'

const theme = useTheme()
const showAdmin = ref(false)

// Toggle theme
const toggleTheme = () => {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
}

// Toggle admin view
const toggleAdmin = () => {
  showAdmin.value = !showAdmin.value
}
</script>

<template>
  <v-app>
    <!-- Simple Top Bar -->
    <v-app-bar flat border density="comfortable">
      <v-btn
        icon
        variant="text"
        class="ml-2 theme-toggle-btn"
        @click="toggleTheme"
        :title="theme.global.current.value.dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
      >
        <v-icon :key="theme.global.name.value" class="theme-icon">
          {{ theme.global.current.value.dark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}
        </v-icon>
      </v-btn>
      
      <v-spacer></v-spacer>
      
      <v-btn
        :prepend-icon="showAdmin ? 'mdi-arrow-left' : 'mdi-shield-lock-outline'"
        variant="text"
        class="rounded-lg mr-4"
        @click="toggleAdmin"
      >
        {{ showAdmin ? 'Back to Survey' : 'Admin Panel' }}
      </v-btn>
    </v-app-bar>

    <v-main>
      <div v-if="!showAdmin">
        <SurveyForm @toggle-admin="toggleAdmin" />
      </div>
      <div v-else>
        <AdminPanel />
      </div>
    </v-main>
  </v-app>
</template>

<style>
.theme-icon {
  animation: theme-icon-spin 0.4s ease-out;
}

@keyframes theme-icon-spin {
  from {
    transform: rotate(-90deg) scale(0);
    opacity: 0;
  }
  to {
    transform: rotate(0) scale(1);
    opacity: 1;
  }
}

.theme-toggle-btn:hover .theme-icon {
  color: rgb(var(--v-theme-primary));
}
</style>
