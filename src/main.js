if (process.env.NODE_ENV === 'production') {
    console.log("%cZIE IK EEN ZIELIGE BITCH CHEATER IN MN CONSOLE?", "background: orange; color: black; font-size: x-large");
    window.console.log = () => ({});
    window.console.warn = () => ({});
}

import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import store from './plugins/store'
import router from './plugins/router'
import vuetify from './plugins/vuetify';


Vue.config.productionTip = false;

new Vue({
    router,
    store,
    vuetify,
    render: h => h(App)
}).$mount('#app');

