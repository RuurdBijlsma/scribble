import Vue from 'vue'
import Vuex from 'vuex'
import SimplePeerMesh from "@/js/SimplePeerMesh";

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        gameSettings: {},
        userInfo: {},
        mesh: new SimplePeerMesh('scribble'),
        socket: null,
    },
    mutations: {
        socket(state, socket) {
            state.socket = socket;
        },
        gameSettings(state, gameSettings) {
            state.gameSettings = gameSettings;
        },
        userInfo(state, userInfo) {
            state.gameSettings = userInfo;
        },
    },
    actions: {},
    modules: {}
})
