<template>
    <div class="home">
        <v-card>
            <v-form @submit="join">
                <v-card-title class="headline">Join game</v-card-title>
                <v-card-subtitle>Join an existing lobby using a code.</v-card-subtitle>
                <v-content>
                    <v-text-field label="Game Code" v-model="gameCode"/>
                </v-content>
                <v-card-actions>
                    <v-btn text type="submit">Join lobby</v-btn>
                </v-card-actions>
            </v-form>
        </v-card>
        <v-card>
            <v-card-title class="headline">Start private match</v-card-title>
            <v-card-subtitle>Play with friends in a private lobby.</v-card-subtitle>
            <v-card-actions>
                <v-btn text to="lobby">Create lobby</v-btn>
            </v-card-actions>
        </v-card>
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
        methods: {
            join(e) {
                e.preventDefault();
                this.$router.push(`lobby?game=${this.gameCode}`);
            }
        },
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
