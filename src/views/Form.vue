<template>
  <div>
    <h1>Add Item</h1>
    <form @submit.prevent="addItem">

      <!-- Name 输入框 -->
      <label for="name">Name</label>
      <input id="name" v-model="name" placeholder="Name" required />

      <!-- Email 输入框 -->
      <label for="email">Email</label>
      <input id="email" v-model="email" placeholder="Email" required />

      <!-- Notes 输入框 -->
      <label for="notes">Notes</label>
      <input id="notes" v-model="notes" placeholder="Notes" />

      <!-- 错误提示 -->
      <p id="errorMsg" aria-live="polite" style="color:red;">{{ error }}</p>

      <button type="submit">Save</button>
    </form>
  </div>
</template>

<script>
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";

export default {
  data() {
    return {
      name: "",
      email: "",
      notes: "",
      error: ""
    }
  },
  methods: {
    async addItem() {
      // 非空验证
      if (!this.name || !this.email) {
        this.error = "Name 和 Email 必填";
        return;
      }

      try {
        await addDoc(collection(db, "items"), {
          name: this.name,
          email: this.email,
          notes: this.notes
        });

        alert("Item added!");

        // 清空表单
        this.name = "";
        this.email = "";
        this.notes = "";
        this.error = "";

        // 跳回 Dashboard
        this.$router.push("/dashboard");

      } catch (err) {
        console.error("Error adding item:", err);
        this.error = "添加失败：" + err.message;
      }
    }
  }
}
</script>
