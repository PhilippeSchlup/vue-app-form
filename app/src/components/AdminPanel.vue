<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTheme } from 'vuetify'
import axios from 'axios'

const { t } = useI18n()
const theme = useTheme()
const password = ref('')
const authenticated = ref(false)
const stats = ref<any>(null)
const responses = ref<any[]>([])
const loading = ref(false)
const error = ref('')
const selectedResponse = ref<any>(null)
const detailsDialog = ref(false)

const exportToCSV = () => {
  if (responses.value.length === 0) return

  const headers = ['Timestamp', 'IP Address', 'Language', 'Faro Rating', 'Faro Flaws', 'Other Flaws', 'Suggestions', 'Faro Duration', 'Business Plan', 'Business Field', 'App Help Business', 'OS', 'OS Satisfaction', 'Most Used App', 'Reason', 'Subject', 'Duolingo Rating', 'Duo Flaw', 'Willing to Pay']
  
  const csvRows = responses.value.map(res => [
    new Date(res.timestamp).toLocaleString(),
    res.ip,
    res.language,
    res.faro_rating,
    Array.isArray(res.faro_flaws) ? res.faro_flaws.join('; ') : res.faro_flaws,
    res.faro_flaws_other || '',
    res.faro_suggestions || '',
    res.faro_residence_duration || '',
    res.business_plan || '',
    res.business_field || '',
    res.app_help_business || '',
    res.smartphone_os,
    res.os_satisfaction,
    res.most_used_app || '',
    res.most_used_app_reason || '',
    res.subject_to_study || '',
    res.duolingo_rating,
    res.duolingo_flaw,
    res.willing_to_pay
  ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))

  const csvContent = [headers.join(','), ...csvRows].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `survey_export_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const viewDetails = (response: any) => {
  selectedResponse.value = response
  detailsDialog.value = true
}

const login = async () => {
  loading.value = true
  error.value = ''
  try {
    const apiUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
    const response = await axios.post(`${apiUrl}/api/admin/login`, { password: password.value })
    if (response.data.success) {
      authenticated.value = true
      localStorage.setItem('admin_password', password.value)
      fetchData()
    }
  } catch (err) {
    error.value = 'Invalid password'
  } finally {
    loading.value = false
  }
}

const fetchData = async () => {
  try {
    const apiUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
    const response = await axios.get(`${apiUrl}/api/admin/data`, {
      headers: { Authorization: `Bearer ${password.value}` }
    })
    stats.value = response.data.stats
    responses.value = response.data.responses
  } catch (err) {
    error.value = 'Failed to fetch data'
  }
}
</script>

<template>
  <v-container class="d-flex align-center justify-center mx-0 px-0 w-100 fill-height main-container" max-width="100%">
    <v-card class="mx-6 pa-8 rounded-xl w-100" max-width="1200px" elevation="8">
      <div class="d-flex align-center mb-8">
        <v-icon icon="mdi-shield-lock" color="primary" size="x-large" class="mr-3"></v-icon>
        <h1 class="text-h4 font-weight-bold text-primary">{{ t('survey.labels.admin') }}</h1>
      </div>

      <v-divider class="mb-10"></v-divider>

      <div v-if="!authenticated">
        <v-row justify="center">
          <v-col cols="12" sm="8" md="6">
            <v-card rounded="lg" class="pa-6" variant="flat">
              <v-form @submit.prevent="login">
                <v-text-field
                  v-model="password"
                  :label="t('survey.labels.password')"
                  type="password"
                  variant="outlined"
                  rounded="lg"
                  prepend-inner-icon="mdi-lock"
                  class="mb-4"
                ></v-text-field>
                <v-alert
                  v-if="error"
                  type="error"
                  variant="tonal"
                  density="compact"
                  class="mb-6 rounded-lg"
                >
                  {{ error }}
                </v-alert>
                <v-btn
                  color="btn-color"
                  block
                  size="large"
                  @click="login"
                  :loading="loading"
                  class="rounded-lg font-weight-bold"
                >
                  {{ t('survey.labels.login') }}
                </v-btn>
              </v-form>
            </v-card>
          </v-col>
        </v-row>
      </div>

      <div v-else>
        <v-row>
          <v-col cols="12" md="4">
            <v-card border flat class="pa-6 text-center rounded-lg h-100" :color="theme.global.current.value.dark ? 'blue-darken-4' : 'blue-lighten-5'">
              <v-icon icon="mdi-account-group" color="primary" class="mb-2"></v-icon>
              <div class="text-subtitle-1 text-medium-emphasis font-weight-medium">Total Responses</div>
              <div class="text-h2 font-weight-bold text-primary">{{ responses.length }}</div>
            </v-card>
          </v-col>
          <v-col cols="12" md="4">
            <v-card border flat class="pa-6 text-center rounded-lg h-100" :color="theme.global.current.value.dark ? 'green-darken-4' : 'green-lighten-5'">
              <v-icon icon="mdi-star-outline" color="success" class="mb-2"></v-icon>
              <div class="text-subtitle-1 text-medium-emphasis font-weight-medium">Avg. Faro Rating</div>
              <div class="text-h2 font-weight-bold text-success">{{ stats?.avgFaroRating?.toFixed(1) || 0 }}</div>
            </v-card>
          </v-col>
          <v-col cols="12" md="4">
            <v-card border flat class="pa-6 text-center rounded-lg h-100" :color="theme.global.current.value.dark ? 'purple-darken-4' : 'purple-lighten-5'">
              <v-icon icon="mdi-cellphone-link" color="purple" class="mb-2"></v-icon>
              <div class="text-subtitle-1 text-medium-emphasis font-weight-medium">OS Share</div>
              <div class="text-h2 font-weight-bold text-purple">{{ stats?.osCount?.android || 0 }} <span class="text-h5">/</span> {{ stats?.osCount?.ios || 0 }}</div>
            </v-card>
          </v-col>
        </v-row>

        <v-divider class="my-10"></v-divider>

        <div class="d-flex align-center justify-space-between mb-6">
          <div class="d-flex align-center">
            <v-icon icon="mdi-table" class="mr-2" color="secondary"></v-icon>
            <h2 class="text-h5 font-weight-bold">Detailed Responses</h2>
          </div>
          <v-btn
            prepend-icon="mdi-download"
            color="success"
            variant="flat"
            class="rounded-lg"
            @click="exportToCSV"
            :disabled="responses.length === 0"
          >
            Export CSV
          </v-btn>
        </div>

        <v-card border class="rounded-lg overflow-hidden">
          <v-table hover>
            <thead>
              <tr :class="theme.global.current.value.dark ? 'bg-grey-darken-4' : 'bg-grey-lighten-4'">
                <th class="font-weight-bold">Language</th>
                <th class="font-weight-bold">Faro Rating</th>
                <th class="font-weight-bold">OS</th>
                <th class="font-weight-bold">Timestamp</th>
                <th class="font-weight-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(res, i) in responses" :key="i">
                <td>
                  <v-chip size="small" variant="outlined" color="primary">{{ res.language }}</v-chip>
                </td>
                <td>
                  <v-rating
                    :model-value="res.faro_rating"
                    readonly
                    density="compact"
                    length="10"
                    size="small"
                    color="amber"
                  ></v-rating>
                </td>
                <td>
                  <v-icon :icon="res.smartphone_os === 'ios' ? 'mdi-apple' : 'mdi-android'" size="small" class="mr-1"></v-icon>
                  {{ res.smartphone_os }}
                </td>
                <td class="text-medium-emphasis">{{ new Date(res.timestamp).toLocaleDateString() }}</td>
                <td class="text-center">
                  <v-btn
                    icon="mdi-eye"
                    variant="text"
                    color="primary"
                    size="small"
                    @click="viewDetails(res)"
                  ></v-btn>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </div>
    </v-card>

    <!-- Response Details Dialog -->
    <v-dialog v-model="detailsDialog" max-width="700px">
      <v-card v-if="selectedResponse" class="rounded-xl pa-4">
        <v-card-title class="d-flex align-center justify-space-between text-h5 font-weight-bold">
          Full Response Details
          <v-btn icon="mdi-close" variant="text" @click="detailsDialog = false"></v-btn>
        </v-card-title>
        <v-divider class="mb-4"></v-divider>
        <v-card-text>
          <div class="mb-6">
            <div class="d-flex mb-4">
              <v-chip class="mr-2" label size="small" color="primary">Lang: {{ selectedResponse.language }}</v-chip>
              <v-chip class="mr-2" label size="small" color="secondary">OS: {{ selectedResponse.smartphone_os }}</v-chip>
              <v-chip label size="small" color="grey">{{ new Date(selectedResponse.timestamp).toLocaleString() }}</v-chip>
            </div>
            
            <div class="mb-4 pa-3 rounded-lg border">
              <div class="text-caption text-primary font-weight-bold mb-1">Faro Rating</div>
              <v-rating :model-value="selectedResponse.faro_rating" readonly length="10" size="x-small" color="amber"></v-rating>
              <span class="ml-2">({{ selectedResponse.faro_rating }}/10)</span>
            </div>

            <div class="mb-4 pa-3 rounded-lg border">
              <div class="text-caption text-primary font-weight-bold mb-1">Faro Flaws</div>
              <v-chip v-for="opt in selectedResponse.faro_flaws" :key="opt" size="x-small" class="mr-1 mb-1" color="blue">{{ opt }}</v-chip>
              <div v-if="selectedResponse.faro_flaws_other" class="mt-2 text-body-2 font-italic">
                Other: {{ selectedResponse.faro_flaws_other }}
              </div>
            </div>

            <div class="mb-4 pa-3 rounded-lg border">
              <div class="text-caption text-primary font-weight-bold mb-1">Faro Suggestions</div>
              <div class="text-body-1">{{ selectedResponse.faro_suggestions || 'No suggestions' }}</div>
            </div>

            <div class="mb-4 pa-3 rounded-lg border">
              <div class="text-caption text-primary font-weight-bold mb-1">Faro Duration</div>
              <div class="text-body-1">{{ selectedResponse.faro_residence_duration || 'No answer' }}</div>
            </div>

            <div class="mb-4 pa-3 rounded-lg border">
              <div class="text-caption text-primary font-weight-bold mb-1">Business Plan</div>
              <div class="text-body-1">{{ selectedResponse.business_plan || 'No answer' }}</div>
              <div v-if="selectedResponse.business_field" class="mt-1 text-body-2">Field: {{ selectedResponse.business_field }}</div>
              <div v-if="selectedResponse.app_help_business" class="mt-1 text-body-2">App Help: {{ selectedResponse.app_help_business }}</div>
            </div>

            <div class="mb-4 pa-3 rounded-lg border">
              <div class="text-caption text-primary font-weight-bold mb-1">OS Satisfaction</div>
              <v-rating :model-value="selectedResponse.os_satisfaction" readonly length="5" size="x-small" color="amber"></v-rating>
              <span class="ml-2">({{ selectedResponse.os_satisfaction }}/5)</span>
            </div>

            <div class="mb-4 pa-3 rounded-lg border">
              <div class="text-caption text-primary font-weight-bold mb-1">Most Used App & Reason</div>
              <div class="text-body-1">{{ selectedResponse.most_used_app || 'No answer' }}</div>
              <div v-if="selectedResponse.most_used_app_reason" class="mt-1 text-body-2">Reason: {{ selectedResponse.most_used_app_reason }}</div>
              <div v-if="selectedResponse.subject_to_study" class="mt-1 text-body-2">Subject: {{ selectedResponse.subject_to_study }}</div>
            </div>

            <div class="mb-4 pa-3 rounded-lg border">
              <div class="text-caption text-primary font-weight-bold mb-1">Duolingo Rating</div>
              <v-rating :model-value="selectedResponse.duolingo_rating" readonly length="10" size="x-small" color="green"></v-rating>
              <span class="ml-2">({{ selectedResponse.duolingo_rating }}/10)</span>
            </div>

            <div class="mb-4 pa-3 rounded-lg border">
              <div class="text-caption text-primary font-weight-bold mb-1">Duolingo Flaw</div>
              <div class="text-body-1">{{ selectedResponse.duolingo_flaw || 'No flaw specified' }}</div>
            </div>

            <div class="mb-4 pa-3 rounded-lg border">
              <div class="text-caption text-primary font-weight-bold mb-1">Willing to Pay</div>
              <div class="text-body-1">{{ selectedResponse.willing_to_pay || 'No answer' }}</div>
            </div>

            <div class="mt-4 pt-4 border-t">
              <div class="text-caption text-medium-emphasis">IP Address</div>
              <div class="text-body-2 font-italic">{{ selectedResponse.ip }}</div>
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="btn-color" variant="tonal" class="rounded-lg" @click="detailsDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
<style scoped>
.main-container {
  min-height: calc(100vh - 64px);
}
</style>