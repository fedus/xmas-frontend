import Vue from 'vue'
import App from './App.vue'
import VueMqtt from 'vue-mqtt';

Vue.use(VueMqtt, 'wss://broker:9002', {username: 'user', password: 'pass', clientId: 'xmasweb-' + parseInt(Math.random() * 100000)});

new Vue({
  el: '#app',
  render: h => h(App)
})
