<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDisplay, useTheme } from 'vuetify'
import axios from 'axios'

const { t, locale } = useI18n()
const { smAndDown } = useDisplay()
const theme = useTheme()

const step = ref(1)
const loading = ref(false)
const submitted = ref(false)
const alreadyResponded = ref(false)
const error = ref('')

const STORAGE_KEY = 'survey_form_data'

const form = ref({
  faro_rating: 5,
  faro_flaws: [] as string[],
  faro_flaws_other: '',
  faro_suggestions: '',
  smartphone_os: '',
  os_satisfaction: 3,
  duolingo_rating: 4,
  duolingo_flaw: '',
  willing_to_pay: '',
  faro_residence_duration: '',
  business_plan: '',
  business_field: '',
  business_field_other: '',
  app_help_business: '',
  most_used_app: '',
  most_used_app_other: '',
  most_used_app_reason: '',
  most_used_app_reason_other: '',
  subject_to_study: '',
  subject_to_study_other: ''
})

// History sync handler
const handlePopState = (event: PopStateEvent) => {
  if (event.state && event.state.step) {
    step.value = event.state.step
  } else {
    step.value = 1
  }
}

// Persistence: Load from localStorage
onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      form.value = { ...form.value, ...parsed }
    } catch (e) {
      console.error('Error loading saved form data', e)
    }
  }
  
  const savedLocale = localStorage.getItem('survey_locale')
  if (savedLocale) {
    locale.value = savedLocale
  }

  // Initial history state check
  if (window.history.state && window.history.state.step) {
    step.value = window.history.state.step
  } else {
    // Set initial state for step 1
    window.history.replaceState({ step: 1 }, '')
  }

  window.addEventListener('popstate', handlePopState)
})

onUnmounted(() => {
  window.removeEventListener('popstate', handlePopState)
})

// Persistence: Save to localStorage
watch(form, (newVal) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newVal))
}, { deep: true })

watch(locale, (newVal) => {
  localStorage.setItem('survey_locale', newVal)
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
  { value: 'pay', labelKey: 'survey.questions.q10_options.pay' },
  { value: 'ads', labelKey: 'survey.questions.q10_options.ads' }
]

const q11Options = [
  { value: 'less_1', labelKey: 'survey.questions.q11_options.less_1' },
  { value: '1_year', labelKey: 'survey.questions.q11_options.1_year' },
  { value: '2_years', labelKey: 'survey.questions.q11_options.2_years' },
  { value: '3_years', labelKey: 'survey.questions.q11_options.3_years' },
  { value: 'more_3', labelKey: 'survey.questions.q11_options.more_3' }
]

const q12Options = [
  { value: 'yes', labelKey: 'survey.questions.q12_options.yes' },
  { value: 'maybe', labelKey: 'survey.questions.q12_options.maybe' },
  { value: 'no', labelKey: 'survey.questions.q12_options.no' }
]

const q13Options = [
  { value: 'tourism', labelKey: 'survey.questions.q13_options.tourism' },
  { value: 'food', labelKey: 'survey.questions.q13_options.food' },
  { value: 'engineering', labelKey: 'survey.questions.q13_options.engineering' },
  { value: 'healthcare', labelKey: 'survey.questions.q13_options.healthcare' },
  { value: 'other', labelKey: 'survey.questions.q13_options.other' }
]

const q14Options = [
  { value: 'yes', labelKey: 'survey.questions.q14_options.yes' },
  { value: 'no', labelKey: 'survey.questions.q14_options.no' },
  { value: 'not_sure', labelKey: 'survey.questions.q14_options.not_sure' }
]

const q15Options = [
  { value: 'youtube', labelKey: 'survey.questions.q15_options.youtube' },
  { value: 'chatgpt', labelKey: 'survey.questions.q15_options.chatgpt' },
  { value: 'netflix', labelKey: 'survey.questions.q15_options.netflix' },
  { value: 'duolingo', labelKey: 'survey.questions.q15_options.duolingo' },
  { value: 'other', labelKey: 'survey.questions.q15_options.other' }
]

const q16Options = [
  { value: 'entertainment', labelKey: 'survey.questions.q16_options.entertainment' },
  { value: 'education', labelKey: 'survey.questions.q16_options.education' },
  { value: 'productivity', labelKey: 'survey.questions.q16_options.productivity' },
  { value: 'shopping', labelKey: 'survey.questions.q16_options.shopping' },
  { value: 'finance', labelKey: 'survey.questions.q16_options.finance' },
  { value: 'other', labelKey: 'survey.questions.q16_options.other' }
]

const q17Options = [
  { value: 'languages', labelKey: 'survey.questions.q17_options.languages' },
  { value: 'math', labelKey: 'survey.questions.q17_options.math' },
  { value: 'communication', labelKey: 'survey.questions.q17_options.communication' },
  { value: 'finance', labelKey: 'survey.questions.q17_options.finance' },
  { value: 'programming', labelKey: 'survey.questions.q17_options.programming' },
  { value: 'other', labelKey: 'survey.questions.q17_options.other' }
]

const changeLanguage = (lang: string) => {
  locale.value = lang
  step.value = 2
  window.history.pushState({ step: 2 }, '')
}

const goBack = () => {
  window.history.back()
}

const goBackToStart = () => {
  step.value = 1
  submitted.value = false
  alreadyResponded.value = false
  window.history.pushState({ step: 1 }, '')
}

const submitForm = async () => {
  loading.value = true
  error.value = ''
  try {
    const apiUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
    
    // Create a copy of the form data to modify for submission
    const submissionData = { 
      ...form.value,
      language: locale.value,
    }

    // Merge 'other' values for radio groups if 'other' is selected and text is provided
    if (submissionData.business_field === 'other' && form.value.business_field_other.trim()) {
      submissionData.business_field = form.value.business_field_other.trim()
    }
    if (submissionData.most_used_app === 'other' && form.value.most_used_app_other.trim()) {
      submissionData.most_used_app = form.value.most_used_app_other.trim()
    }
    if (submissionData.most_used_app_reason === 'other' && form.value.most_used_app_reason_other.trim()) {
      submissionData.most_used_app_reason = form.value.most_used_app_reason_other.trim()
    }
    if (submissionData.subject_to_study === 'other' && form.value.subject_to_study_other.trim()) {
      submissionData.subject_to_study = form.value.subject_to_study_other.trim()
    }

    const response = await axios.post(`${apiUrl}/api/submit`, submissionData)
    if (response.data.success) {
      submitted.value = true
      step.value = 3
      window.history.pushState({ step: 3 }, '')
      // Clear persistence on success
      localStorage.removeItem(STORAGE_KEY)
    }
  } catch (err: any) {
    if (err.response && err.response.status === 403) {
      alreadyResponded.value = true
      step.value = 3
      window.history.pushState({ step: 3 }, '')
    } else {
      error.value = 'An error occurred. Please try again.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <v-container class="fill-height justify-center py-10 d-flex align-center w-100 main-container" max-width="100%" color="background">
    <!-- Hidden Admin Access Button -->
    <v-btn
      icon="mdi-shield-lock"
      variant="flat"
      color="transparent"
      class="admin-access-btn"
      title="Admin Access"
      @click="$emit('toggle-admin')"
    ></v-btn>
    <v-card width="100%" max-width="850" class="pa-0 rounded-xl overflow-hidden mx-2" elevation="10">
      <div class="text-center mb-6 pt-6 px-4">
        <h1 class="text-h4 font-weight-bold text-primary mb-2">{{ t('survey.title') }}</h1>
        <p class="text-subtitle-1 text-medium-emphasis">{{ t('survey.subtitle') }}</p>
      </div>

      <v-divider class="mb-8"></v-divider>

      <v-window v-model="step" :touch="false">
        <!-- Step 1: Language Selection -->
        <v-window-item :value="1">
          <!-- <div class="text-h6 mb-6 text-center">{{ t('survey.language_selection.question') }}</div> -->
          <v-row justify="center">
            <v-col cols="12" sm="8">
              <v-list class="bg-transparent mx-4 pb-8">
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
          <div class="mb-4 px-6">
            <v-btn
              variant="text"
              color="primary"
              prepend-icon="mdi-arrow-left"
              @click="goBack"
              class="font-weight-bold"
            >
              {{ t('survey.labels.back') }}
            </v-btn>
          </div>
          <v-form @submit.prevent="submitForm" >
            <!-- Section: Faro Experience -->
            <v-sheet class="pa-6 mb-8 border-b">

              <div class="d-flex align-center mb-6">
                <v-icon icon="mdi-map-marker" color="primary" class="mr-2"></v-icon>
                <div class="text-h6 font-weight-bold text-primary text-uppercase">{{ t('survey.sections.faro_experience') }}</div>
              </div>
              
              <div class="mb-8">
                <p class="text-body-1 font-weight-medium mb-4">1. {{ t('survey.questions.q2') }}</p>
                <div v-if="smAndDown" class="d-flex justify-space-between mb-2 px-4">
                  <span class="text-caption font-weight-bold">{{ t('survey.labels.very_poor') }} (0)</span>
                  <span class="text-caption font-weight-bold">{{ t('survey.labels.excellent') }} (10)</span>
                </div>
                <v-slider
                  v-model="form.faro_rating"
                  min="0"
                  max="10"
                  step="1"
                  thumb-label="always"
                  color="primary"
                  track-color="primary-lighten-3"
                  class="px-4"
                  :show-ticks="smAndDown ? 'always' : false"
                >
                  <template v-if="!smAndDown" v-slot:prepend>
                    <span class="text-caption font-weight-bold">{{ t('survey.labels.very_poor') }} (0)</span>
                  </template>
                  <template v-if="!smAndDown" v-slot:append>
                    <span class="text-caption font-weight-bold">{{ t('survey.labels.excellent') }} (10)</span>
                  </template>
                </v-slider>
              </div>

              <div class="mb-6">
                <p class="text-body-1 font-weight-medium mb-3">2. {{ t('survey.questions.q3') }}</p>
                <v-row dense>
                  <v-col v-for="option in q3Options" :key="option.value" cols="12" sm="6">
                    <v-checkbox
                      v-model="form.faro_flaws"
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
                  v-if="form.faro_flaws.includes('other')"
                  v-model="form.faro_flaws_other"
                  :label="'4. ' + t('survey.questions.q4')"
                  rows="2"
                  variant="outlined"
                  class="mb-6 mt-2"
                  rounded="lg"
                ></v-textarea>
              </v-expand-transition>

              <v-textarea
                v-model="form.faro_suggestions"
                :label="'5. ' + t('survey.questions.q5')"
                rows="3"
                variant="outlined"
                rounded="lg"
                class="mb-6"
              ></v-textarea>

              <div class="mb-6">
                <p class="text-body-1 font-weight-medium mb-3">3. {{ t('survey.questions.q11') }}</p>
                <v-radio-group v-model="form.faro_residence_duration">
                  <v-radio
                    v-for="option in q11Options"
                    :key="option.value"
                    :label="t(option.labelKey)"
                    :value="option.value"
                    color="primary"
                    class="mb-1"
                  ></v-radio>
                </v-radio-group>
              </div>

              <div class="mb-6">
                <p class="text-body-1 font-weight-medium mb-3">4. {{ t('survey.questions.q12') }}</p>
                <v-radio-group v-model="form.business_plan" inline>
                  <v-radio
                    v-for="option in q12Options"
                    :key="option.value"
                    :label="t(option.labelKey)"
                    :value="option.value"
                    color="primary"
                    class="mr-4"
                  ></v-radio>
                </v-radio-group>
              </div>

              <v-expand-transition>
                <div v-if="form.business_plan === 'yes' || form.business_plan === 'maybe'">
                  <div class="mb-6">
                    <p class="text-body-1 font-weight-medium mb-3">5. {{ t('survey.questions.q13') }}</p>
                    <v-radio-group v-model="form.business_field">
                      <v-radio
                        v-for="option in q13Options"
                        :key="option.value"
                        :label="t(option.labelKey)"
                        :value="option.value"
                        color="primary"
                        class="mb-1"
                      ></v-radio>
                    </v-radio-group>
                    <v-expand-transition>
                      <v-text-field
                        v-if="form.business_field === 'other'"
                        v-model="form.business_field_other"
                        :label="t('survey.labels.please_specify')"
                        variant="outlined"
                        class="mb-4 mt-n2"
                        rounded="lg"
                        density="comfortable"
                      ></v-text-field>
                    </v-expand-transition>
                  </div>

                  <div class="mb-6">
                    <p class="text-body-1 font-weight-medium mb-3">6. {{ t('survey.questions.q14') }}</p>
                    <v-radio-group v-model="form.app_help_business" inline>
                      <v-radio
                        v-for="option in q14Options"
                        :key="option.value"
                        :label="t(option.labelKey)"
                        :value="option.value"
                        color="primary"
                        class="mr-4"
                  ></v-radio>
                    </v-radio-group>
                  </div>
                </div>
              </v-expand-transition>
            </v-sheet>

            <!-- Section: Tech & Learning -->
            <v-sheet class="pa-6 mb-8 border-b">
              <div class="d-flex align-center mb-6">
                <v-icon icon="mdi-cellphone-cog" color="secondary" class="mr-2"></v-icon>
                <div class="text-h6 font-weight-bold text-secondary text-uppercase">{{ t('survey.sections.tech_learning') }}</div>
              </div>

              <div class="mb-8">
                <p class="text-body-1 font-weight-medium mb-3">7. {{ t('survey.questions.q6') }}</p>
                <v-radio-group v-model="form.smartphone_os" inline>
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
                <p class="text-body-1 font-weight-medium mb-3">8. {{ t('survey.questions.q7') }}</p>
                <div class="d-flex justify-center">
                  <v-rating
                    v-model="form.os_satisfaction"
                    length="10"
                    color="amber-darken-2"
                    active-color="amber-darken-2"
                    hover
                    :size="smAndDown ? 'small' : 'large'"
                    :density="smAndDown ? 'compact' : 'default'"
                  ></v-rating>
                </div>
              </div>

              <div class="mb-8">
                <p class="text-body-1 font-weight-medium mb-3">9. {{ t('survey.questions.q15') }}</p>
                <v-radio-group v-model="form.most_used_app">
                  <v-radio
                    v-for="option in q15Options"
                    :key="option.value"
                    :label="t(option.labelKey)"
                    :value="option.value"
                    color="secondary"
                    class="mb-1"
                  ></v-radio>
                </v-radio-group>
                <v-expand-transition>
                  <v-text-field
                    v-if="form.most_used_app === 'other'"
                    v-model="form.most_used_app_other"
                    :label="t('survey.labels.please_specify')"
                    variant="outlined"
                    class="mb-4 mt-n2"
                    rounded="lg"
                    density="comfortable"
                  ></v-text-field>
                </v-expand-transition>
              </div>

              <div class="mb-8">
                <p class="text-body-1 font-weight-medium mb-3">10. {{ t('survey.questions.q16') }}</p>
                <v-radio-group v-model="form.most_used_app_reason">
                  <v-radio
                    v-for="option in q16Options"
                    :key="option.value"
                    :label="t(option.labelKey)"
                    :value="option.value"
                    color="secondary"
                    class="mb-1"
                  ></v-radio>
                </v-radio-group>
                <v-expand-transition>
                  <v-text-field
                    v-if="form.most_used_app_reason === 'other'"
                    v-model="form.most_used_app_reason_other"
                    :label="t('survey.labels.please_specify')"
                    variant="outlined"
                    class="mb-4 mt-n2"
                    rounded="lg"
                    density="comfortable"
                  ></v-text-field>
                </v-expand-transition>
              </div>

              <div class="mb-8">
                <p class="text-body-1 font-weight-medium mb-3">11. {{ t('survey.questions.q17') }}</p>
                <v-radio-group v-model="form.subject_to_study">
                  <v-radio
                    v-for="option in q17Options"
                    :key="option.value"
                    :label="t(option.labelKey)"
                    :value="option.value"
                    color="secondary"
                    class="mb-1"
                  ></v-radio>
                </v-radio-group>
                <v-expand-transition>
                  <v-text-field
                    v-if="form.subject_to_study === 'other'"
                    v-model="form.subject_to_study_other"
                    :label="t('survey.labels.please_specify')"
                    variant="outlined"
                    class="mb-4 mt-n2"
                    rounded="lg"
                    density="comfortable"
                  ></v-text-field>
                </v-expand-transition>
              </div>

              <div class="mb-8">
                <p class="text-body-1 font-weight-medium mb-3">12. {{ t('survey.questions.q8') }}</p>
                <div class="d-flex justify-center">
                  <v-rating
                    v-model="form.duolingo_rating"
                    length="10"
                    color="green-darken-1"
                    active-color="green-darken-1"
                    hover
                    :size="smAndDown ? 'small' : 'large'"
                    :density="smAndDown ? 'compact' : 'comfortable'"
                  ></v-rating>
                </div>
              </div>

              <div class="mb-8">
                <p class="text-body-1 font-weight-medium mb-3">13. {{ t('survey.questions.q9') }}</p>
                <v-radio-group v-model="form.duolingo_flaw">
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
                <p class="text-body-1 font-weight-medium mb-3">14. {{ t('survey.questions.q10') }}</p>
                <v-radio-group v-model="form.willing_to_pay">
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
              class="mb-6 rounded-lg mx-6"
            >
              {{ error }}
            </v-alert>

            <div class="d-flex justify-center px-4 pb-8">

              <v-btn
                block
                color="primary"
                type="submit"
                :loading="loading"
                :disabled="loading"
                class="rounded-xl font-weight-bold text-uppercase elevation-4 py-4"
                :class="smAndDown ? 'w-100' : 'w-50'"
                height="46"
              >
                {{ t('survey.labels.submit') }}
                <v-icon end icon="mdi-send" class="ml-2"></v-icon>
              </v-btn>
            </div>
          </v-form>
        </v-window-item>

        <!-- Final Step: Success/Already Responded -->
        <v-window-item :value="3" v-if="submitted || alreadyResponded">
          <v-sheet class="text-center py-12 ma-4 rounded-xl border-dashed border-md border-opacity-25" :color="alreadyResponded ? (theme.global.current.value.dark ? 'amber-darken-4' : 'amber-lighten-5') : (theme.global.current.value.dark ? 'success-darken-4' : 'success-lighten-5')">
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
              color="btn-color"
              class="mt-10 rounded-xl"
              prepend-icon="mdi-home"
              @click="goBackToStart"
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
.main-container {
  min-height: calc(100vh - 128px);
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
  background-color: rgba(var(--v-theme-primary), 0.1);
  transform: translateY(-2px);
  transition: all 0.2s ease;
}

.admin-access-btn {
  position: fixed;
  bottom: 20px;
  right: 20px;
  opacity: 0.1;
  transition: all 0.3s;
  z-index: 100;
}

.admin-access-btn:hover {
  opacity: 1;
  background-color: rgb(var(--v-theme-surface)) !important;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
}
</style>