import { createApp } from "vue";
import { createPinia } from "pinia";
import * as VueApexChartsModule from "vue3-apexcharts";

import App from "./App.vue";
import router from "./router";
import "./assets/styles.css";

const app = createApp(App);

app.use(createPinia());
app.use(router);

// Evita el error de import default en Safari/Vite
const VueApexCharts =
  VueApexChartsModule.default ||
  VueApexChartsModule.VueApexCharts ||
  VueApexChartsModule;

app.use(VueApexCharts);

app.mount("#app");