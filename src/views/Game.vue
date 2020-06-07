<template>
    <div class="game">
        <div class="game-content">
            <div class="users">
                <div v-for="user in everyone">
                    <img :src="user.avatar" alt="User avatar">
                    <p v-if="user.name">{{user.name}}</p>
                    <p v-else><i>Unnamed</i></p>
                </div>
            </div>
            <div class="draw-content">
                <video v-if="!me.host" ref="streamViewer" controls autoplay class="stream-viewer" width="800"
                       height="420"/>
                <simple-draw v-show="me.host" class="draw" ref="simpleDraw" :updateCanvas="me.host"/>
            </div>
            <div class="chat">

            </div>
        </div>
    </div>
</template>

<script>
    import SimpleDraw from "@/components/SimpleDraw";
    import User from "@/js/User";

    export default {
        name: 'Game',
        components: {SimpleDraw},
        data: () => ({
            host: false,
            settings: null,
            me: new User({}),
            others: [],
            everyone: [],
            activePlayer: null,
            currentRound: 0,
        }),
        async mounted() {
            //debug
            if (true) {
                this.$store.commit('game', {
                    host: true,
                    me: new User({
                        avatar: 'data:image/png;base64,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',
                        name: 'RuteNL',
                        id: '12308950175',
                        host: true,
                        me: true,
                    }),
                    others: [],
                    settings: {rounds: 5, time: 100, language: 'English'},
                });
            }

            this.settings = this.$store.state.game.settings;
            this.me = this.$store.state.game.me;
            this.others = this.$store.state.game.others;
            this.everyone = [this.me, ...this.others];

            let loadRemaining = this.others.length;
            if (loadRemaining === 0)
                this.startGame();

            this.$store.state.mesh.on('data', (id, data) => {
                let user = this.everyone.find(user => user.id === id);
                let [type, ...params] = JSON.parse(data);
                switch (type) {
                    case 'loaded':
                        if (!this.me.host)
                            break;
                        if (--loadRemaining <= 0) {
                            //done loading
                            this.startGame();
                        }
                        console.log('id', id, 'user', user, 'loaded', params, 'loadRemaining', loadRemaining);
                        break;
                }
            });
            if (this.me.host) {
                console.log("me is host", this.me, this.me.host);
                //send start signal to peers now to make sure the host is first on this page
                this.$store.state.mesh.broadcast(['start', this.settings]);
            } else {
                //Tell host that this peer is loaded
                let hostUser = this.others.find(user => user.host);
                console.log("me is not host", this.me, this.me.host, 'found host:', hostUser);
                this.$store.state.mesh.send(hostUser.id, ['loaded']);
            }
        },
        methods: {
            startGame() {
                //All users are loaded in at this point
                console.log("start game");
                this.activePlayer = this.me;
                //give everyone eveyone else's stream :) for the entire game
                this.startRound();
            },
            async startRound() {
                this.currentRound++;
                let chosenWord = await this.showWord();
                this.mesh.broadcast(['word', chosenWord]);
                this.mesh.broadcastStream(this.$refs.draw.getStream());
            },
            async showWord() {
                return new Promise(resolve => {
                    resolve('ladder');
                });
            }
        },
    }
</script>
<style scoped>
    .game-content {
        min-width: 1210px;
        margin: 10px;
    }

    .game-content > div {
        display: inline-block;
    }

    .users {
        background-color: rgba(255, 255, 255, 0.5);
        vertical-align: top;
        padding: 20px;
        text-align: center;
        border-top-left-radius: 10px;
        border-bottom-left-radius: 10px;
        margin-top: 20px;
    }

    .users img {
        border-radius: 50%;
        width: 70px;
        height: 70px;
    }

    .draw-content {
        margin: 0 auto;
        width: 800px;
    }

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

    .chat {
        background-color: rgba(255, 255, 255, 0.5);
        height: 460px;
        width: 300px;
        border-top-right-radius: 10px;
        border-bottom-right-radius: 10px;
        margin: 20px 0;
        vertical-align: top;
    }
</style>
