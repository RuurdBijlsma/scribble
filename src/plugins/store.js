import Vue from 'vue'
import Vuex from 'vuex'
import SimplePeerMesh from "@/js/SimplePeerMesh";

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        game: {},
        mesh: new SimplePeerMesh('scribble'),
    },
    mutations: {
        game(state, game) {
            console.log("game", game);
            state.game = game;
        },
    },
    actions: {},
    modules: {}
})
