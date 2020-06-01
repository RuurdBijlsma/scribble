<template>
    <div class="home">
        <h1>Game lobby - {{$route.query.game}}</h1>
        <p>Share the link with others to invite them</p>
        <div class="settings">
            <create-user :read-only="!host" ref="createUser" @userChange="updateUserName"/>
            <lobby-settings :read-only="!host" ref="settings" @change="updateSettings" :updateSettings="settings"/>
            <lobby-users :users="users"/>
        </div>
        <v-btn v-if="host" @click="createLobby">Create lobby</v-btn>
    </div>
</template>

<script>
    import SimpleDraw from "@/components/SimpleDraw";
    import CreateUser from "@/components/CreateUser";
    import LobbySettings from "@/components/LobbySettings";
    import LobbyUsers from "@/components/LobbyUsers";

    export default {
        name: 'Home',
        components: {LobbyUsers, LobbySettings, CreateUser, SimpleDraw},
        data: () => ({
            host: false,
            users: [],
            meInfo: {name: ''},
            settings: null,
        }),
        async mounted() {
            let socket = await this.$store.state.mesh.connect('http://localhost:3000');
            this.$store.commit('socket', socket);
            console.log(socket);

            this.meInfo.id = socket.id;
            this.meInfo.stream = this.$refs.createUser.getUser().stream;
            this.users.push(this.meInfo);

            if (this.$route.query.hasOwnProperty('game')) {
                this.host = false;
            } else {
                console.log("HOST");
                this.host = true;
                let gameId = (Math.floor(Math.random() * 1679616)).toString(36).padStart(4, '0').toUpperCase();
                await this.$router.push({query: {game: gameId}});
            }
            //TEMP::::
            this.host = this.$route.query.host === 'true';
            let gameId = this.$route.query.game;

            let users = {};
            this.$store.state.mesh.on('connect', id => {
                if (!users[id]) {
                    users[id] = {id, stream: null, name: ''};
                    this.users.push(users[id]);
                }
                console.log("userinfo", id, 'connect');

                let user = this.$refs.createUser.getUser();
                this.$store.state.mesh.send(id, ['user', user.name]);
                let settings = this.$refs.settings.getSettings();
                this.$store.state.mesh.send(id, ['settings', settings]);
            });

            this.$store.state.mesh.on('disconnect', id => {
                delete users[id];
                let userInfo = this.users.find(u => u.id === id);
                this.users.splice(this.users.indexOf(userInfo), 1);
            });

            this.$store.state.mesh.on('stream', (id, stream) => {
                if (!users[id]) {
                    users[id] = {id, stream: null, name: ''};
                    this.users.push(users[id]);
                }
                users[id].stream = stream;
                console.log("userinfo", id, 'stream', stream);
            });

            this.$store.state.mesh.on('data', (id, data) => {
                if (!users[id]) {
                    users[id] = {id, stream: null, name: ''};
                    this.users.push(users[id]);
                }
                let [type, ...params] = JSON.parse(data);
                console.log("userinfo", id, 'data', type, params);
                if (type === 'user') {
                    users[id].name = params[0];
                } else if (type === 'settings') {
                    if (!this.host)
                        this.settings = params[0];
                }
                console.log("userinfo", id, 'data', type, params);
            });

            await this.$store.state.mesh.join(gameId, true);
            console.log("Joined room", gameId);
            this.$store.state.mesh.broadcastStream(this.meInfo.stream);
        },
        methods: {
            updateSettings(settings) {
                if (this.host)
                    this.$store.state.mesh.broadcast(['settings', settings]);
            },
            updateUserName(user) {
                this.meInfo.name = user;
                this.$store.state.mesh.broadcast(['user', user]);
            },
            createLobby() {
                let user = this.$refs.createUser.getUser();
                let settings = this.$refs.settings.getSettings();
                this.$store.commit('userInfo', user);
                this.$store.commit('gameSettings', settings);
                // console.log(gameId);
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
    }

    .settings {
        display: flex;
    }

    .create-user {
        padding: 20px;
        width: 300px;
    }

    .lobby-settings {
        width: 300px;
    }
</style>
