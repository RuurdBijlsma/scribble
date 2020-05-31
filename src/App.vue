<template>
    <v-app class="app">
        <v-content class="app-content">
            <router-view/>
        </v-content>
    </v-app>
</template>

<script>

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
