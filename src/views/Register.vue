<template>
  <div>
    <h1>Register</h1>
    <form @submit.prevent="register">
      <!-- Username -->
      <label for="name">Username</label>
      <input id="name" v-model="name" placeholder="Enter your username" />

      <!-- Email -->
      <label for="email">Email</label>
      <input id="email" v-model="email" type="email" placeholder="Enter your email" />

      <!-- Password -->
      <label for="password">Password</label>
      <input id="password" v-model="password" type="password" placeholder="Enter your password" />

      <!-- Error message: accessibility live region -->
      <p id="errorMsg" aria-live="polite" style="color:red;">
        {{ errorMessage }}
      </p>

      <!-- Submit button -->
      <button type="submit">Register</button>
    </form>
  </div>
</template>

<script>
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { sendEmail } from "../services/email.js"; // import email.js

export default {
  data() {
    return {
      name: "",
      email: "",
      password: "",
      errorMessage: "" // store error message
    };
  },
  methods: {
    async register() {
      const auth = getAuth();
      this.errorMessage = "";

      if (!this.name || !this.email || !this.password) {
        this.errorMessage = "Please fill in all fields";
        return;
      }

      try {
        // 1. Firebase registration
        await createUserWithEmailAndPassword(auth, this.email, this.password);
        alert("Registration successful!");

        // 2. Send confirmation email via EmailJS
        await sendEmail(this.name, this.email, "Welcome to HealthCharityApp!");

        // 3. Redirect to login page
        this.$router.push("/login");
      } catch (err) {
        this.errorMessage = err.message; // error message for aria-live
      }
    }
  }
};
</script>
