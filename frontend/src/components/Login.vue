<template>
  <div class="login-screen">
    <div class="login-card">
      <div class="login-header">
        <h2>Bienvenido</h2>
        <p class="subtitle">Ingresa tus credenciales para continuar</p>
      </div>
      
      <form @submit.prevent="onLogin">
        <div class="input-group">
          <label for="email">Correo electrónico</label>
          <input 
            id="email"
            v-model="email" 
            type="email" 
            placeholder="ejemplo@correo.com" 
            required 
            autocomplete="email"
          />
        </div>
        
        <div class="input-group">
          <label for="password">Contraseña</label>
          <input 
            id="password"
            v-model="password" 
            type="password" 
            placeholder="••••••••" 
            required 
            autocomplete="current-password"
          />
        </div>

        <p class="error-msg" v-if="msg">{{ msg }}</p>

        <div class="actions">
          <button class="btn btn-primary" type="submit" :disabled="loading">
            <span v-if="!loading">Iniciar sesión</span>
            <span v-else>Cargando...</span>
          </button>
          <button class="btn btn-secondary" type="button" @click="$emit('show-register')" :disabled="loading">
            Crear cuenta
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { api } from '../api'

const emit = defineEmits(['authenticated', 'show-register'])

const email = ref('')
const password = ref('')
const msg = ref('')
const loading = ref(false)

const onLogin = async () => {
  msg.value = ''
  loading.value = true
  
  try {
    const res = await api.login({ email: email.value, password: password.value })
    const token = res.token
    localStorage.setItem('auth_token', token)
    emit('authenticated', token)
  } catch (e) {
    console.error('login error', e)
    msg.value = e?.response?.data?.error || 'Error al iniciar sesión. Verifica tus credenciales.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-screen { 
  min-height: 100vh; 
  display: flex; 
  align-items: center; 
  justify-content: center;
  padding: 1rem;
}

.login-card { 
  background: white; 
  padding: 2.5rem; 
  border-radius: 16px; 
  width: 100%;
  max-width: 420px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.login-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.12);
}

.login-header {
  margin-bottom: 2rem;
  text-align: center;
}

.login-header h2 { 
  margin: 0 0 0.5rem 0;
  font-size: 1.75rem;
  font-weight: 600;
  color: #1a1a1a;
}

.subtitle {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.input-group {
  margin-bottom: 1.25rem;
}

.input-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: #333;
}

.login-card input { 
  width: 100%; 
  padding: 0.875rem 1rem; 
  border-radius: 10px; 
  border: 2px solid #e5e5e5;
  font-size: 1rem;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.login-card input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.login-card input::placeholder {
  color: #999;
}

.actions { 
  display: flex; 
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.btn {
  width: 100%;
  padding: 0.875rem 1.5rem;
  border-radius: 10px;
  border: none;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover:not(:disabled) {
  background: #e5e7eb;
  transform: translateY(-1px);
}

.error-msg { 
  margin: 1rem 0 0 0;
  padding: 0.75rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  font-size: 0.9rem;
  text-align: center;
}

@media (max-width: 480px) {
  .login-card {
    padding: 2rem 1.5rem;
  }
  
  .login-header h2 {
    font-size: 1.5rem;
  }
}
</style>