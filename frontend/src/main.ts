import { createApp } from 'vue';
import { Workbox } from 'workbox-window';
import App from './App.vue';
import router from './router';
import { pinia } from './stores';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './app.css';

const app = createApp(App);
app.use(pinia);
app.use(router);
app.mount('#app');

if ('serviceWorker' in navigator) {
  const wb = new Workbox('/service-worker.js');
  wb.register().catch((error) => {
    console.error('Failed to register service worker', error);
  });
}
