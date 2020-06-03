import Vue from 'vue'
import Vuex from 'vuex'
import SimplePeerMesh from "@/js/SimplePeerMesh";

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        game: {},
        mesh: new SimplePeerMesh('scribble'),
        socket: null,
    },
    mutations: {
        game(state, game) {
            console.log("game", game);
            state.game = game;
        },
        socket(state, socket) {
            state.socket = socket;
        },
    },
    actions: {},
    modules: {}
})
