import Vue from 'vue'
import Vuex from 'vuex'
import MultiPeerMesh from "multi-peer-mesh";

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        game: {},
        mesh: new MultiPeerMesh('scribble'),
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
