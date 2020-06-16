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
    // Change to not update every frame, use canvas restore coolio boolio

    // * let player join mid game
    // * adjust rounds in user object when this happens
    // * When new player joins on the lobby screen, the host should tell that player that the game is active, the new player then goes to /game (how to do the canvas stream?) (new user gets 2 events in lobby screen ['stream'(from each player), 'gameActive'(to indicate active game, param is relevant game state)

    // * Testing
    // * Remove bugs

    // * Highlight when lobby is public on lobby screen
    // * Find out why it's not centered in production version
    //Far away todo:
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

    * {
        /*font-family: 'Fredoka One', cursive;*/
    }

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
