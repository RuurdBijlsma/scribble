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
    //* A lot
    //* Flow: go to domain.com
    // -> click join game or start game
    // -> click start game (go to domain.com/lobby) / click join game, fill in code (and go to domain.com/lobby?game=)
    // -> you instantly start a party
    // -> share link, someone joins as non-host
    // -> you change settings, you both change avatar and username
    // -> host starts game, everyone goes to domain.com/play (vuex will remember game id)
    // -> everyone plays game :)
    //* Play game page
    //* Don't take pageX, take screenx or something for simple-draw

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
