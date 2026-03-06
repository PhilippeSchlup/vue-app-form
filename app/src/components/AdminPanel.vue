<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import axios from 'axios'

const { t } = useI18n()
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

  const headers = ['Timestamp', 'IP Address', 'Language', 'Q2 (Rating)', 'Q3 (Flaws)', 'Q4 (Other)', 'Q5 (Suggestions)', 'Q6 (OS)', 'Q7 (OS Satisfaction)', 'Q8 (Duolingo)', 'Q9 (Duo Flaw)', 'Q10 (Willing to Pay)']
  
  const csvRows = responses.value.map(res => [
    new Date(res.timestamp).toLocaleString(),
    res.ip,
    res.language,
    res.q2,
    Array.isArray(res.q3) ? res.q3.join('; ') : res.q3,
    res.q4 || '',
    res.q5 || '',
    res.q6,
    res.q7,
    res.q8,
    res.q9,
    res.q10
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
    const response = await axios.post('http://localhost:3001/api/admin/login', { password: password.value })
    if (response.data.success) {
      authenticated.value = true
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
    const response = await axios.get('http://localhost:3001/api/admin/data', {
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
  <v-container class="py-12">
    <v-card max-width="1200" class="mx-auto pa-8 rounded-xl" elevation="8">
      <div class="d-flex align-center mb-8">
        <v-icon icon="mdi-shield-lock" color="primary" size="x-large" class="mr-3"></v-icon>
        <h1 class="text-h4 font-weight-bold text-primary">{{ t('survey.labels.admin') }}</h1>
      </div>

      <v-divider class="mb-10"></v-divider>

      <div v-if="!authenticated">
        <v-row justify="center">
          <v-col cols="12" sm="8" md="6">
            <v-card border rounded="lg" class="pa-6 bg-grey-lighten-5">
              <v-form @submit.prevent="login">
                <v-text-field
                  v-model="password"
                  :label="t('survey.labels.password')"
                  type="password"
                  variant="outlined"
                  rounded="lg"
                  prepend-inner-icon="mdi-lock"
                  class="mb-4"
                  bg-color="white"
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
                  color="primary"
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
            <v-card border flat class="pa-6 text-center rounded-lg bg-blue-lighten-5 h-100">
              <v-icon icon="mdi-account-group" color="primary" class="mb-2"></v-icon>
              <div class="text-subtitle-1 text-grey-darken-1 font-weight-medium">Total Responses</div>
              <div class="text-h2 font-weight-bold text-primary">{{ responses.length }}</div>
            </v-card>
          </v-col>
          <v-col cols="12" md="4">
            <v-card border flat class="pa-6 text-center rounded-lg bg-green-lighten-5 h-100">
              <v-icon icon="mdi-star-outline" color="success" class="mb-2"></v-icon>
              <div class="text-subtitle-1 text-grey-darken-1 font-weight-medium">Avg. Faro Rating</div>
              <div class="text-h2 font-weight-bold text-success">{{ stats?.avgFaroRating?.toFixed(1) || 0 }}</div>
            </v-card>
          </v-col>
          <v-col cols="12" md="4">
            <v-card border flat class="pa-6 text-center rounded-lg bg-purple-lighten-5 h-100">
              <v-icon icon="mdi-cellphone-link" color="purple" class="mb-2"></v-icon>
              <div class="text-subtitle-1 text-grey-darken-1 font-weight-medium">OS Share</div>
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
              <tr class="bg-grey-lighten-4">
                <th class="font-weight-bold">Language</th>
                <th class="font-weight-bold">Faro Rating</th>
                <th class="font-weight-bold">OS</th>
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
                    :model-value="res.q2"
                    readonly
                    density="compact"
                    length="10"
                    size="small"
                    color="amber"
                  ></v-rating>
                </td>
                <td>
                  <v-icon :icon="res.q6 === 'ios' ? 'mdi-apple' : 'mdi-android'" size="small" class="mr-1"></v-icon>
                  {{ res.q6 }}
                </td>
                <td class="text-grey-darken-1">{{ new Date(res.timestamp).toLocaleDateString() }}</td>
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
              <v-chip class="mr-2" label size="small" color="secondary">OS: {{ selectedResponse.q6 }}</v-chip>
              <v-chip label size="small" color="grey">{{ new Date(selectedResponse.timestamp).toLocaleString() }}</v-chip>
            </div>
            
            <div v-for="n in 10" :key="n">
              <div v-if="n > 1" class="mb-4 pa-3 rounded-lg border bg-grey-lighten-5">
                <div class="text-caption text-primary font-weight-bold mb-1">Question {{ n }}</div>
                <div class="text-body-1">
                  <!-- Custom rendering for different question types -->
                  <div v-if="n === 2">
                    <v-rating :model-value="selectedResponse.q2" readonly length="10" size="x-small" color="amber"></v-rating>
                    <span class="ml-2">({{ selectedResponse.q2 }}/10)</span>
                  </div>
                  <div v-else-if="n === 3">
                    <v-chip v-for="opt in selectedResponse.q3" :key="opt" size="x-small" class="mr-1 mb-1" color="blue">{{ opt }}</v-chip>
                  </div>
                  <div v-else-if="n === 7 || n === 8">
                    <v-rating :model-value="selectedResponse['q'+n]" readonly length="7" size="x-small" color="green"></v-rating>
                    <span class="ml-2">({{ selectedResponse['q'+n] }})</span>
                  </div>
                  <div v-else>
                    {{ selectedResponse['q'+n] || 'No answer' }}
                  </div>
                </div>
              </div>
            </div>
            <div class="mt-4 pt-4 border-top">
              <div class="text-caption text-grey">IP Address</div>
              <div class="text-body-2 font-italic">{{ selectedResponse.ip }}</div>
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="tonal" class="rounded-lg" @click="detailsDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
