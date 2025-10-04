<template>
  <div class="login-screen">
    <div class="login-card">
      <div class="login-header">
        <h2>Crear cuenta</h2>
        <p class="subtitle">Completa el formulario para registrarte</p>
      </div>
      
      <form @submit.prevent="onRegister">
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
            placeholder="Mínimo 6 caracteres" 
            required 
            autocomplete="new-password"
            minlength="6"
          />
        </div>

        <p class="success-msg" v-if="msg && !error">{{ msg }}</p>
        <p class="error-msg" v-if="error">{{ msg }}</p>

        <div class="actions">
          <button class="btn btn-success" type="submit" :disabled="loading">
            <span v-if="!loading">Crear cuenta</span>
            <span v-else>Registrando...</span>
          </button>
          <button class="btn btn-secondary" type="button" @click="$emit('back')" :disabled="loading">
            Volver al inicio
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { api } from '../api'

const emit = defineEmits(['registered', 'back'])

const email = ref('')
const password = ref('')
const msg = ref('')
const error = ref(false)
const loading = ref(false)

const onRegister = async () => {
  msg.value = ''
  error.value = false
  loading.value = true
  
  try {
    await api.register({ email: email.value, password: password.value })
    error.value = false
    msg.value = '¡Registro exitoso! Redirigiendo al inicio de sesión...'
    
    setTimeout(() => {
      emit('registered')
    }, 1500)
  } catch (e) {
    console.error('register error', e)
    error.value = true
    msg.value = e?.response?.data?.error || 'Error al crear la cuenta. Intenta nuevamente.'
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
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
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

.btn-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover:not(:disabled) {
  background: #e5e7eb;
  transform: translateY(-1px);
}

.success-msg { 
  margin: 1rem 0 0 0;
  padding: 0.75rem;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  color: #15803d;
  font-size: 0.9rem;
  text-align: center;
  animation: slideIn 0.3s ease;
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
  animation: slideIn 0.3s ease;
}

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

@media (max-width: 480px) {
  .login-card {
    padding: 2rem 1.5rem;
  }
  
  .login-header h2 {
    font-size: 1.5rem;
  }
}
</style>