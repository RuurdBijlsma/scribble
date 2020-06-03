<template>
    <div class="home">
        <div class="join">
            <h2>Join game</h2>
            <v-text-field filled label="Game Code" v-model="gameCode"/>
            <v-btn :to="`lobby?game=${gameCode}`">Join game</v-btn>
        </div>
        <div class="create">
            <h2>Create new game</h2>
            <v-btn to="lobby">Create game</v-btn>
        </div>
    </div>
</template>

<script>

    export default {
        name: 'Home',
        components: {},
        data: () => ({
            gameCode: '',
        }),
        async mounted() {
        },
        methods: {},
    }
</script>
<style scoped>
    .home {
        width: 100%;
        max-width: 1500px;
        margin: 0 auto;
        padding: 30px;
        display: flex;
        text-align: center;
        justify-content: space-evenly;
    }

    .home > div {
        padding: 15px;
        margin: 20px;
    }
</style>
