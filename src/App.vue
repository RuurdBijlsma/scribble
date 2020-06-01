<template>
    <v-app class="app">
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
    html, body {
        overflow-y: auto;
    }

    .app-content {
        background: linear-gradient(0deg, rgba(63, 215, 206, 1) 0%, rgba(244, 0, 255, 1) 100%);
    }
</style>
