// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './app'

import VueI18n from 'vue-i18n'

import csMessages from './assets/cs'

Vue.config.productionTip = false
Vue.use(VueI18n)

const i18n = new VueI18n({
    locale: 'cs',
    messages: {
        cs: csMessages,
    },
})

/* eslint-disable no-new */
new Vue({
    el: '#app',
    components: { App },
    i18n,
    template: '<App/>',
})
