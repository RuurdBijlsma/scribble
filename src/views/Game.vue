<template>
    <div class="create-user">
        <div class="users">
            <div v-for="user in everyone">
                <img :src="user.avatar" alt="User avatar">
                <p v-if="user.name">{{user.name}}</p>
                <p v-else><i>Unnamed</i></p>
            </div>
        </div>
        <video v-if="!host" ref="streamViewer" controls autoplay class="stream-viewer" width="800" height="420"/>
        <simple-draw v-show="host" class="draw" ref="simpleDraw" :updateCanvas="host"/>
    </div>
</template>

<script>
    import SimpleDraw from "@/components/SimpleDraw";

    export default {
        name: 'Home',
        components: {SimpleDraw},
        data: () => ({
            host: false,
            settings: null,
            me: null,
            others: [],
            everyone: [],
            activePlayer: null,
        }),
        async mounted() {
            this.host = this.$store.state.game.host;
            this.settings = this.$store.state.game.settings;
            this.me = this.$store.state.game.me;
            this.others = this.$store.state.game.others;
            this.everyone = [this.me, ...this.others];

            if (this.host) {

            }
        },
        methods: {},
    }
</script>
<style scoped>
    .draw {
        width: 800px;
        height: 500px;
        background-color: rgba(255, 255, 255, 0.25);
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.3);
    }

    .stream-viewer {
        width: 800px;
        height: 420px;
        background-color: rgba(255, 255, 255, 0.25);
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.3);
    }
</style>
