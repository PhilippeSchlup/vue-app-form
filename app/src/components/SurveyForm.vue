<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import axios from 'axios'

const { t, locale } = useI18n()

const step = ref(1)
const loading = ref(false)
const submitted = ref(false)
const alreadyResponded = ref(false)
const error = ref('')

const form = ref({
  q2: 5,
  q3: [] as string[],
  q4: '',
  q5: '',
  q6: '',
  q7: 3,
  q8: 4,
  q9: '',
  q10: ''
})

const languages = [
  { label: 'survey.language_selection.en', value: 'en' },
  { label: 'survey.language_selection.fr', value: 'fr' },
  { label: 'survey.language_selection.es', value: 'es' },
  { label: 'survey.language_selection.pt', value: 'pt' }
]

const q3Options = [
  { value: 'transport', labelKey: 'survey.questions.q3_options.transport' },
  { value: 'entertainment', labelKey: 'survey.questions.q3_options.entertainment' },
  { value: 'cost', labelKey: 'survey.questions.q3_options.cost' },
  { value: 'cleanliness', labelKey: 'survey.questions.q3_options.cleanliness' },
  { value: 'infrastructure', labelKey: 'survey.questions.q3_options.infrastructure' },
  { value: 'other', labelKey: 'survey.questions.q3_options.other' }
]

const q6Options = [
  { value: 'android', labelKey: 'survey.questions.q6_options.android' },
  { value: 'ios', labelKey: 'survey.questions.q6_options.ios' }
]

const q9Options = [
  { value: 'repetitive', labelKey: 'survey.questions.q9_options.repetitive' },
  { value: 'depth', labelKey: 'survey.questions.q9_options.depth' },
  { value: 'ads', labelKey: 'survey.questions.q9_options.ads' },
  { value: 'gamification', labelKey: 'survey.questions.q9_options.gamification' },
  { value: 'inaccurate', labelKey: 'survey.questions.q9_options.inaccurate' },
  { value: 'none', labelKey: 'survey.questions.q9_options.none' }
]

const q10Options = [
  { value: 'yes', labelKey: 'survey.questions.q10_options.yes' },
  { value: 'maybe', labelKey: 'survey.questions.q10_options.maybe' },
  { value: 'no', labelKey: 'survey.questions.q10_options.no' }
]

const changeLanguage = (lang: string) => {
  locale.value = lang
  step.value = 2
}

const submitForm = async () => {
  loading.value = true
  error.value = ''
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
    const response = await axios.post(`${apiUrl}/api/submit`, {
      ...form.value,
      language: locale.value,
      adminPassword: localStorage.getItem('admin_password') // Optional: allow admin bypass if they have the password stored
    })
    if (response.data.success) {
      submitted.value = true
      step.value = 3
    }
  } catch (err: any) {
    if (err.response && err.response.status === 403) {
      alreadyResponded.value = true
      step.value = 3
    } else {
      error.value = 'An error occurred. Please try again.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <v-container class="fill-height justify-center py-10 d-flex align-center w-100" max-width="100%">
    <!-- Hidden Admin Access Button -->
    <v-btn
      icon="mdi-shield-lock"
      variant="flat"
      color="transparent"
      class="admin-access-btn"
      title="Admin Access"
      @click="$emit('toggle-admin')"
    ></v-btn>
    <v-card width="100%" max-width="850" class="pa-8 rounded-xl overflow-hidden" elevation="10">
      <div class="text-center mb-6">
        <h1 class="text-h4 font-weight-bold text-primary mb-2">{{ t('survey.title') }}</h1>
        <p class="text-subtitle-1 text-medium-emphasis">{{ t('survey.subtitle') }}</p>
      </div>

      <v-divider class="mb-8"></v-divider>

      <v-window v-model="step" :touch="false">
        <!-- Step 1: Language Selection -->
        <v-window-item :value="1">
          <div class="text-h6 mb-6 text-center">{{ t('survey.language_selection.question') }}</div>
          <v-row justify="center">
            <v-col cols="12" sm="8">
              <v-list class="bg-transparent">
                <v-list-item
                  v-for="lang in languages"
                  :key="lang.value"
                  @click="changeLanguage(lang.value)"
                  class="border rounded-xl mb-4 py-3"
                  active-color="primary"
                  hover
                >
                  <template v-slot:prepend>
                    <v-avatar color="primary-lighten-4" class="mr-3">
                      <v-icon icon="mdi-translate" color="primary"></v-icon>
                    </v-avatar>
                  </template>
                  <v-list-item-title class="text-h6 font-weight-medium">{{ t(lang.label) }}</v-list-item-title>
                  <template v-slot:append>
                    <v-icon icon="mdi-chevron-right"></v-icon>
                  </template>
                </v-list-item>
              </v-list>
            </v-col>
          </v-row>
        </v-window-item>

        <!-- Step 2: Survey Questions -->
        <v-window-item :value="2" >
          <div class="mb-4">
            <v-btn
              variant="text"
              color="primary"
              prepend-icon="mdi-arrow-left"
              @click="step = 1"
              class="font-weight-bold"
            >
              {{ t('survey.labels.back') }}
            </v-btn>
          </div>
          <v-form @submit.prevent="submitForm" >
            <!-- Section: Faro Experience -->
            <v-sheet border rounded="xl" class="pa-6 mb-8 bg-grey-lighten-5">

              <div class="d-flex align-center mb-6">
                <v-icon icon="mdi-map-marker" color="primary" class="mr-2"></v-icon>
                <div class="text-h6 font-weight-bold text-primary text-uppercase">{{ t('survey.sections.faro_experience') }}</div>
              </div>
              
              <div class="mb-8">
                <p class="text-body-1 font-weight-medium mb-4">2. {{ t('survey.questions.q2') }}</p>
                <v-slider
                  v-model="form.q2"
                  min="0"
                  max="10"
                  step="1"
                  thumb-label="always"
                  color="primary"
                  track-color="primary-lighten-3"
                  class="px-4"
                >
                  <template v-slot:prepend>
                    <span class="text-caption font-weight-bold">{{ t('survey.labels.very_poor') }} (0)</span>
                  </template>
                  <template v-slot:append>
                    <span class="text-caption font-weight-bold">{{ t('survey.labels.excellent') }} (10)</span>
                  </template>
                </v-slider>
              </div>

              <div class="mb-6">
                <p class="text-body-1 font-weight-medium mb-3">3. {{ t('survey.questions.q3') }}</p>
                <v-row dense>
                  <v-col v-for="option in q3Options" :key="option.value" cols="12" sm="6">
                    <v-checkbox
                      v-model="form.q3"
                      :label="t(option.labelKey)"
                      :value="option.value"
                      hide-details
                      density="comfortable"
                      color="primary"
                    ></v-checkbox>
                  </v-col>
                </v-row>
              </div>

              <v-expand-transition>
                <v-textarea
                  v-if="form.q3.includes('other')"
                  v-model="form.q4"
                  :label="'4. ' + t('survey.questions.q4')"
                  rows="2"
                  variant="outlined"
                  class="mb-6 mt-2"
                  rounded="lg"
                  bg-color="white"
                ></v-textarea>
              </v-expand-transition>

              <v-textarea
                v-model="form.q5"
                :label="'5. ' + t('survey.questions.q5')"
                rows="3"
                variant="outlined"
                rounded="lg"
                bg-color="white"
              ></v-textarea>
            </v-sheet>

            <!-- Section: Tech & Learning -->
            <v-sheet border rounded="xl" class="pa-6 mb-8 bg-grey-lighten-5">
              <div class="d-flex align-center mb-6">
                <v-icon icon="mdi-cellphone-cog" color="secondary" class="mr-2"></v-icon>
                <div class="text-h6 font-weight-bold text-secondary text-uppercase">{{ t('survey.sections.tech_learning') }}</div>
              </div>

              <div class="mb-8">
                <p class="text-body-1 font-weight-medium mb-3">6. {{ t('survey.questions.q6') }}</p>
                <v-radio-group v-model="form.q6" inline>
                  <v-radio
                    v-for="option in q6Options"
                    :key="option.value"
                    :label="t(option.labelKey)"
                    :value="option.value"
                    color="secondary"
                    class="mr-8"
                  ></v-radio>
                </v-radio-group>
              </div>

              <div class="mb-8">
                <p class="text-body-1 font-weight-medium mb-3">7. {{ t('survey.questions.q7') }}</p>
                <div class="d-flex justify-center">
                  <v-rating
                    v-model="form.q7"
                    length="5"
                    color="amber-darken-2"
                    active-color="amber-darken-2"
                    hover
                    size="large"
                  ></v-rating>
                </div>
              </div>

              <div class="mb-8">
                <p class="text-body-1 font-weight-medium mb-3">8. {{ t('survey.questions.q8') }}</p>
                <div class="d-flex justify-center">
                  <v-rating
                    v-model="form.q8"
                    length="7"
                    color="green-darken-1"
                    active-color="green-darken-1"
                    hover
                    size="large"
                    density="comfortable"
                  ></v-rating>
                </div>
              </div>

              <div class="mb-8">
                <p class="text-body-1 font-weight-medium mb-3">9. {{ t('survey.questions.q9') }}</p>
                <v-radio-group v-model="form.q9">
                  <v-radio
                    v-for="option in q9Options"
                    :key="option.value"
                    :label="t(option.labelKey)"
                    :value="option.value"
                    color="secondary"
                    class="mb-2"
                  ></v-radio>
                </v-radio-group>
              </div>

              <div class="mb-8">
                <p class="text-body-1 font-weight-medium mb-3">10. {{ t('survey.questions.q10') }}</p>
                <v-radio-group v-model="form.q10">
                  <v-radio
                    v-for="option in q10Options"
                    :key="option.value"
                    :label="t(option.labelKey)"
                    :value="option.value"
                    color="secondary"
                    class="mb-2"
                  ></v-radio>
                </v-radio-group>
              </div>
            </v-sheet>

            <v-alert
              v-if="error"
              type="error"
              variant="tonal"
              closable
              class="mb-6 rounded-lg"
            >
              {{ error }}
            </v-alert>

            <v-btn
              block
              color="primary"
              size="x-large"
              type="submit"
              :loading="loading"
              :disabled="loading"
              class="rounded-xl font-weight-bold text-uppercase elevation-4 py-4"
              height="64"
            >
              {{ t('survey.labels.submit') }}
              <v-icon end icon="mdi-send" class="ml-2"></v-icon>
            </v-btn>
          </v-form>
        </v-window-item>

        <!-- Final Step: Success/Already Responded -->
        <v-window-item :value="3" v-if="submitted || alreadyResponded">
          <v-sheet class="text-center py-12 rounded-xl border-dashed border-md border-opacity-25" :color="alreadyResponded ? 'amber-lighten-5' : 'success-lighten-5'">
            <v-icon
              :icon="alreadyResponded ? 'mdi-alert-circle' : 'mdi-check-circle-outline'"
              size="120"
              :color="alreadyResponded ? 'warning' : 'success'"
              class="mb-6 pulse-icon"
            ></v-icon>
            <h2 class="text-h3 font-weight-bold mb-4" :class="alreadyResponded ? 'text-warning' : 'text-success'">
              {{ alreadyResponded ? t('survey.labels.already_responded') : t('survey.labels.success') }}
            </h2>
            <p class="text-h6 text-medium-emphasis px-10">
              {{ alreadyResponded ? t('survey.labels.already_responded_msg') : t('survey.labels.success_msg') }}
            </p>
            <v-btn
              variant="outlined"
              color="primary"
              class="mt-10 rounded-xl"
              prepend-icon="mdi-home"
              @click="step = 1; submitted = false; alreadyResponded = false;"
            >
              {{ t('survey.labels.back_to_start') }}
            </v-btn>
          </v-sheet>
        </v-window-item>
      </v-window>
    </v-card>
  </v-container>
</template>

<style scoped>
.v-container {
  background: radial-gradient(circle at top left, #f8f9fa 0%, #e9ecef 100%);
  min-height: 100vh;
}

.pulse-icon {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.v-list-item--hover:hover {
  background-color: rgba(var(--v-theme-primary), 0.05);
  transform: translateY(-2px);
  transition: all 0.2s ease;
}

.admin-access-btn {
  position: fixed;
  bottom: 20px;
  right: 20px;
  opacity: 0.3;
  transition: all 0.3s;
  z-index: 100;
}

.admin-access-btn:hover {
  opacity: 1;
  background-color: white !important;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}
</style>
