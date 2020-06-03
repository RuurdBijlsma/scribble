import Vue from 'vue'
import VueRouter from 'vue-router'
import Lobby from '../views/Lobby.vue'
import Home from '../views/Home'

Vue.use(VueRouter);

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home
    },
    {
        path: '/lobby',
        name: 'Lobby',
        component: () => import( '../views/Lobby')
    },
    {
        path: '/game',
        name: 'Game',
        component: () => import( '../views/Game')
    },
    {
        path: '/kicked',
        name: 'Kicked',
        component: () => import( '../views/Kicked')
    },
];

const router = new VueRouter({
    routes
});

export default router
