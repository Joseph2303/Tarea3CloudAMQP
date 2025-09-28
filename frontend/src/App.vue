<template>
  <div class="app">
    <!-- Header -->
    <header class="header">
      <div class="container">
        <h1 class="title">
          <span class="icon">📚</span>
          Gestión de Autores y Editoriales
        </h1>
        <button 
          class="btn btn-primary btn-update" 
          @click="onProcessQueue"
          :disabled="isProcessing"
          :class="{ 'processing': isProcessing }"
        >
          <span class="btn-icon">{{ isProcessing ? '⏳' : '🔄' }}</span>
          {{ isProcessing ? 'Procesando...' : 'Actualizar datos' }}
        </button>
      </div>
    </header>

    <div class="container">
      <!-- Status Message -->
      <div class="status-bar" v-if="msg">
        <div class="alert" :class="alertType">
          <span class="alert-icon">{{ alertIcon }}</span>
          <span>{{ msg }}</span>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-number">{{ authors.length }}</div>
          <div class="stat-label">Autores</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ publishers.length }}</div>
          <div class="stat-label">Editoriales</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ queuedOperations }}</div>
          <div class="stat-label">En cola</div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="content-grid">
        <!-- Authors Section -->
        <section class="card">
          <div class="card-header">
            <h2 class="card-title">
              <span class="section-icon">✍️</span>
              Autores
            </h2>
          </div>
          <div class="card-body">
            <form @submit.prevent="addAuthor" class="form-section">
              <div class="input-group">
                <input 
                  v-model="authorName" 
                  placeholder="Nombre del autor" 
                  class="input"
                  maxlength="100"
                />
                <button 
                  type="submit" 
                  class="btn btn-success"
                  :disabled="!authorName.trim()"
                >
                  <span class="btn-icon">➕</span>
                  Agregar
                </button>
              </div>
            </form>

            <div class="list-container">
              <div v-if="authors.length === 0" class="empty-state">
                <span class="empty-icon">📝</span>
                <p>No hay autores registrados</p>
              </div>
              <div v-else class="item-list">
                <div 
                  v-for="a in authors" 
                  :key="a._id" 
                  class="list-item"
                >
                  <div class="item-info">
                    <span class="item-icon">👤</span>
                    <strong class="item-name">{{ a.name }}</strong>
                  </div>
                  <button 
                    class="btn btn-danger btn-sm" 
                    @click="delAuthor(a._id)"
                    title="Eliminar autor"
                  >
                    <span class="btn-icon">🗑️</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Publishers Section -->
        <section class="card">
          <div class="card-header">
            <h2 class="card-title">
              <span class="section-icon">🏢</span>
              Editoriales
            </h2>
          </div>
          <div class="card-body">
            <form @submit.prevent="addPublisher" class="form-section">
              <div class="input-group">
                <input 
                  v-model="publisherName" 
                  placeholder="Nombre de la editorial" 
                  class="input"
                  maxlength="100"
                />
                <button 
                  type="submit" 
                  class="btn btn-success"
                  :disabled="!publisherName.trim()"
                >
                  <span class="btn-icon">➕</span>
                  Agregar
                </button>
              </div>
            </form>

            <div class="list-container">
              <div v-if="publishers.length === 0" class="empty-state">
                <span class="empty-icon">🏛️</span>
                <p>No hay editoriales registradas</p>
              </div>
              <div v-else class="item-list">
                <div 
                  v-for="p in publishers" 
                  :key="p._id" 
                  class="list-item"
                >
                  <div class="item-info">
                    <span class="item-icon">🏢</span>
                    <strong class="item-name">{{ p.name }}</strong>
                  </div>
                  <button 
                    class="btn btn-danger btn-sm" 
                    @click="delPublisher(p._id)"
                    title="Eliminar editorial"
                  >
                    <span class="btn-icon">🗑️</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { api } from './api'

const authors = ref([])
const publishers = ref([])
const msg = ref('')
const authorName = ref('')
const publisherName = ref('')
const isProcessing = ref(false)
const queuedOperations = ref(0)

const alertType = computed(() => {
  if (msg.value.includes('✅')) return 'success'
  if (msg.value.includes('❌')) return 'error'
  if (msg.value.includes('🔄')) return 'info'
  return 'info'
})

const alertIcon = computed(() => {
  if (msg.value.includes('✅')) return '✅'
  if (msg.value.includes('❌')) return '❌'
  if (msg.value.includes('🔄')) return '🔄'
  return 'ℹ️'
})

const loadData = async () => {
  try {
    authors.value = await api.listAuthors()
    publishers.value = await api.listPublishers()
  } catch (error) {
    msg.value = 'Error al cargar los datos'
    console.error('Error loading data:', error)
  }
}

onMounted(loadData)

const queueOk = () => { 
  msg.value = 'Operación agregada a la cola. Presiona "Actualizar datos" para aplicar cambios.'
  queuedOperations.value++
  setTimeout(() => {
    msg.value = ''
  }, 5000)
}

const addAuthor = async () => {
  if (!authorName.value.trim()) return
  
  try {
    await api.createAuthor({ name: authorName.value.trim() })
    authorName.value = ''
    queueOk()
  } catch (error) {
    msg.value = 'Error al agregar el autor'
    console.error('Error adding author:', error)
  }
}

const delAuthor = async (_id) => {
  if (!confirm('¿Estás seguro de que deseas eliminar este autor?')) return
  
  try {
    await api.deleteAuthor(_id)
    queueOk()
  } catch (error) {
    msg.value = 'Error al eliminar el autor'
    console.error('Error deleting author:', error)
  }
}

const addPublisher = async () => {
  if (!publisherName.value.trim()) return
  
  try {
    await api.createPublisher({ name: publisherName.value.trim() })
    publisherName.value = ''
    queueOk()
  } catch (error) {
    msg.value = 'Error al agregar la editorial'
    console.error('Error adding publisher:', error)
  }
}

const delPublisher = async (_id) => {
  if (!confirm('¿Estás seguro de que deseas eliminar esta editorial?')) return
  
  try {
    await api.deletePublisher(_id)
    queueOk()
  } catch (error) {
    msg.value = 'Error al eliminar la editorial'
    console.error('Error deleting publisher:', error)
  }
}

const onProcessQueue = async () => {
  isProcessing.value = true
  
  try {
    const res = await api.processQueue()
    msg.value = `Procesados: ${res.processed} elementos`
    queuedOperations.value = 0
    await loadData()
    
    setTimeout(() => {
      msg.value = ''
    }, 5000)
  } catch (error) {
    msg.value = 'Error al procesar la cola'
    console.error('Error processing queue:', error)
  } finally {
    isProcessing.value = false
  }
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.app {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Header */
.header {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1.5rem 0;
  margin-bottom: 2rem;
}

.header .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: white;
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
}

.icon {
  font-size: 2rem;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: 12px;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn:active {
  transform: translateY(0);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
}

.btn-success {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

.btn-sm {
  padding: 0.5rem 0.75rem;
  font-size: 0.8rem;
}

.btn-update {
  min-width: 180px;
  justify-content: center;
}

.btn.processing {
  animation: pulse 2s infinite;
}

.btn-icon {
  font-size: 1.1em;
}

/* Status Bar */
.status-bar {
  margin-bottom: 2rem;
}

.alert {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-radius: 12px;
  font-weight: 500;
  animation: slideIn 0.3s ease;
}

.alert.success {
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  color: #047857;
  border: 1px solid #a7f3d0;
}

.alert.error {
  background: linear-gradient(135deg, #fee2e2, #fca5a5);
  color: #dc2626;
  border: 1px solid #fca5a5;
}

.alert.info {
  background: linear-gradient(135deg, #dbeafe, #93c5fd);
  color: #1d4ed8;
  border: 1px solid #93c5fd;
}

.alert-icon {
  font-size: 1.2em;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 1.5rem;
  text-align: center;
  color: white;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Content Grid */
.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

/* Cards */
.card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
}

.card-header {
  background: linear-gradient(135deg, #f8fafc, #e2e8f0);
  padding: 1.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.card-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.section-icon {
  font-size: 1.5rem;
}

.card-body {
  padding: 1.5rem;
}

/* Forms */
.form-section {
  margin-bottom: 1.5rem;
}

.input-group {
  display: flex;
  gap: 0.75rem;
}

.input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Lists */
.list-container {
  max-height: 400px;
  overflow-y: auto;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
}

.empty-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.item-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: linear-gradient(135deg, #f9fafb, #f3f4f6);
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
}

.list-item:hover {
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.item-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.item-icon {
  font-size: 1.2rem;
  opacity: 0.7;
}

.item-name {
  color: #1f2937;
  font-weight: 500;
}

/* Animations */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
  
  .header .container {
    flex-direction: column;
    text-align: center;
  }
  
  .title {
    font-size: 1.5rem;
  }
  
  .input-group {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 0.75rem;
  }
  
  .card-body,
  .card-header {
    padding: 1rem;
  }
  
  .stat-card {
    padding: 1rem;
  }
  
  .stat-number {
    font-size: 2rem;
  }
}
</style>