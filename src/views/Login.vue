<template>
  <div>
    <h1>Login</h1>
    <form @submit.prevent="login">

      <!-- Email 输入框 -->
      <label for="email">Email</label>
      <input id="email" v-model="email" type="email" placeholder="Email" required />

      <!-- Password 输入框 -->
      <label for="password">Password</label>
      <input id="password" v-model="password" type="password" placeholder="Password" required />

      <!-- 错误提示 -->
      <p id="errorMsg" aria-live="polite" style="color:red;">{{ error }}</p>

      <button type="submit">Login</button>
    </form>
  </div>
</template>

<script>
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

export default {
  data() {
    return {
      email: '',
      password: '',
      error: ''
    };
  },
  methods: {
    async login() {
      const auth = getAuth();
      this.error = "";

      try {
        await signInWithEmailAndPassword(auth, this.email, this.password);
        alert('登录成功');
        this.$router.push('/dashboard');
      } catch (err) {
        console.error("Login error:", err);
        this.error = err.message; // 自动播报
      }
    }
  }
}
</script>
