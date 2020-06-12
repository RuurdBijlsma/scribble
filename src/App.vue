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
    // * let player join mid game
    // * adjust rounds in user object when this happens
    // * When new player joins on the lobby screen, the host should tell that player that the game is active, the new player then goes to /game (how to do the canvas stream?) (new user gets 2 events in lobby screen ['stream'(from each player), 'gameActive'(to indicate active game, param is relevant game state)
    // * Testing
    // * Remove bugs
    // * BIG BUG ALERT 1 person guesses right, then the time runs out, no one gets points
    // * Highlight when lobby is public on lobby screen
    // * Find out why it's not centered in production version
    //Far away todo:
    // * No more bugs :)
    // * Get words from chat guesses?

    //---------------DONE---------------

    // * point system [DONE]
    // * Kick players in game screen [DONE]
    // * Room browser (allow public lobbies) [DONE]
    // * Kick disconnects player [DONE]
    // * Add sounds [DONE]
    // * Spatie niet een streepje maken [DONE]
    // * save name to localhost [DONE]
    // * je mag niet nog een keer goed raden als je het goed hebt geraden in dezelfde ronde [DONE]
    // * niet het antwoord loggen naar console want sommige mensen kunnen zichzelf niet tegenhouden [DONE]
    // * Add next round after end round screen [DONE]
    // * Add game overview when all rounds are complete [DONE]
    // * Create end of round screen with points added per person and the correct word [DONE]
    // * When everyone guessed correctly, show end of round screen [DONE]
    // * When time runs out show end of round screen [DONE]
    // * Improve information shown in users thing in game page [DONE]
    //Who is drawing now [DONE]
    //clear word after round [DONE]
    //end of game screen [DONE]
    //visible round niet baseren op player count want die kan veranderen [DONE]

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
