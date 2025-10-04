<template>
  <div class="login-screen">
    <div class="login-card">
      <h2>Registrar usuario</h2>
      <form @submit.prevent="onRegister">
        <input v-model="email" type="email" placeholder="Email" required />
        <input v-model="password" type="password" placeholder="Contraseña" required />
        <div class="actions">
          <button class="btn btn-success" type="submit">Registrar</button>
          <button class="btn" type="button" @click="$emit('back')">Volver</button>
        </div>
      </form>
      <p class="msg" v-if="msg">{{ msg }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { api } from '../api'

const emit = defineEmits(['registered','back'])

const email = ref('')
const password = ref('')
const msg = ref('')

const onRegister = async () => {
  try {
    await api.register({ email: email.value, password: password.value })
    msg.value = 'Registrado OK. Ahora inicia sesión.'
    emit('registered')
  } catch (e) {
    console.error('register error', e)
    msg.value = e?.response?.data?.error || 'Error en registro'
  }
}
</script>

<style scoped>
.login-screen { min-height: 100vh; display:flex; align-items:center; justify-content:center; }
.login-card { background: white; padding: 2rem; border-radius: 12px; width:320px; box-shadow: 0 8px 24px rgba(0,0,0,0.15); }
.login-card h2 { margin:0 0 1rem 0 }
.login-card input { width:100%; padding:0.75rem; margin-bottom:0.5rem; border-radius:8px; border:1px solid #ddd }
.actions { display:flex; gap:0.5rem }
.msg { margin-top:0.5rem; color:#0a0 }
</style>
