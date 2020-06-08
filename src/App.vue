<template>
    <v-app class="app">
        <div class="background"></div>
        <v-content class="app-content">
            <router-view/>
        </v-content>
    </v-app>
</template>

<script>
    //todo:
    // * Create end of round screen with points added per person and the correct word
    // * When everyone guessed correctly, show end of round screen
    // * When time runs out show end of round screen
    // * Improve information shown in users thing in game page
    // * Add sounds
    // * Add next round after end round screen
    // * Add game overview when all rounds are complete
    //Far away todo:
    // * Room browser (allow public lobbies)
    // * No more bugs :)
    // * Get words from chat guesses?

    export default {
        name: 'App',

        components: {},

        data: () => ({
            //
        }),
    };
</script>
<style>
    @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap');

    html, body {
        /*overflow-y: auto;*/
        -webkit-touch-callout: none; /* iOS Safari */
        -webkit-user-select: none; /* Safari */
        -khtml-user-select: none; /* Konqueror HTML */
        -moz-user-select: none; /* Old versions of Firefox */
        -ms-user-select: none; /* Internet Explorer/Edge */
        user-select: none;
    }

    .background {
        /*background-image: url(assets/background5.png);*/
        /*background-size: 256px;*/
        background-image: url(assets/background4.png);
        background-size: 400px;
        background-position: center;
        background-repeat: repeat;
        pointer-events: none;
        position: fixed;
        width: 100%;
        height: 100%;
        opacity: 0.17;
    }

    .app-content {
        background-image: linear-gradient(0deg, #6955a7 0%, #46469c 100%);
    }
</style>
