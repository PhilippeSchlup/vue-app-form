<script setup lang="ts">
import { ref } from 'vue'
import SurveyForm from './components/SurveyForm.vue'
import AdminPanel from './components/AdminPanel.vue'

const showAdmin = ref(false)

// Toggle admin view
const toggleAdmin = () => {
  showAdmin.value = !showAdmin.value
}
</script>

<template>
  <v-app>
    <!-- Simple Top Bar -->
    <v-app-bar flat border color="white" density="comfortable">
      <v-spacer></v-spacer>
      <v-btn
        :prepend-icon="showAdmin ? 'mdi-arrow-left' : 'mdi-shield-lock-outline'"
        variant="tonal"
        color="primary"
        class="rounded-lg mr-4"
        @click="toggleAdmin"
      >
        {{ showAdmin ? 'Back to Survey' : 'Admin Panel' }}
      </v-btn>
    </v-app-bar>

    <v-main class="bg-grey-lighten-4">
      <div v-if="!showAdmin">
        <SurveyForm />
      </div>
      <div v-else>
        <AdminPanel />
      </div>
    </v-main>
  </v-app>
</template>

<style>
/* Remove old absolute styles if any */
</style>
