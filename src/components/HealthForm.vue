<template>
  <div>
    <h2>Health Questionnaire</h2>
    <form @submit.prevent="submitForm" class="form">
      <!-- 姓名 -->
      <label for="nameInput">
        Name:
        <input id="nameInput" v-model="form.name" required />
      </label>
      <br />

      <!-- 年龄 -->
      <label for="ageInput">
        Age:
        <input id="ageInput" type="number" v-model="form.age" required />
      </label>
      <br />

      <!-- 健康问题 -->
      <label for="issueInput">
        Health Issues:
        <textarea id="issueInput" v-model="form.issue"></textarea>
      </label>
      <br />

      <button type="submit">Submit</button>
    </form>

    <div v-if="responseMessage" class="result" aria-live="polite">
      <h3>Submission Result:</h3>
      <p>{{ responseMessage }}</p>
    </div>

    <div v-if="errorMessage" class="error" aria-live="polite">
      <h3>Error:</h3>
      <p>{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";

const form = ref({
  name: "",
  age: "",
  issue: "",
});

const responseMessage = ref("");
const errorMessage = ref("");

const submitForm = async () => {
  responseMessage.value = "";
  errorMessage.value = "";

  // Print form data before submission
  console.log("Form data before submit:", form.value);

  try {
    const res = await axios.post(
      "https://health-alobmhjpen.cn-hongkong.fcapp.run", // Your FC endpoint
      JSON.stringify(form.value), // Send as JSON string
      { headers: { "Content-Type": "application/json" } }
    );

    // Print server response
    console.log("Server response:", res.data);

    responseMessage.value = res.data.message;
  } catch (err) {
    errorMessage.value = "Submission failed: " + err.message;
    console.error(err);
  }
};
</script>

<style scoped>
.form {
  margin-bottom: 20px;
}
.result {
  margin-top: 15px;
  padding: 10px;
  border: 1px solid green;
  background: #f0fff0;
}
.error {
  margin-top: 15px;
  padding: 10px;
  border: 1px solid red;
  background: #fff0f0;
  color: red;
}
</style>
