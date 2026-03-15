import { defineStore } from "pinia";
import api from "../services/api";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    token: localStorage.getItem("token") || null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === "admin",
    isCashier: (state) => state.user?.role === "cashier",
  },

  actions: {
    async login(email, password) {
      const { data } = await api.post("/login", { email, password });

      this.user = data.user;
      this.token = data.token;

      localStorage.setItem("token", data.token);
    },

    async fetchMe() {
      if (!this.token) return;
      const { data } = await api.get("/me");
      this.user = data.user;
    },

    async logout() {
      try {
        await api.post("/logout");
      } catch (error) {
        //
      }

      this.user = null;
      this.token = null;
      localStorage.removeItem("token");
    },
  },
});