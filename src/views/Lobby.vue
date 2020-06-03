<template>
    <div class="home">
        <h1>Game lobby - {{$route.query.game}}</h1>
        <p>Share the link with others to invite them</p>
        <div class="settings">
            <lobby-settings :read-only="!host" ref="settings" @change="updateSettings" :updateSettings="settings"/>
            <create-user :read-only="!host" ref="createUser" @userChange="updateUserName"/>
            <lobby-users class="lobby-users" ref="lobbyUsers" :users="users" :me="meInfo" :host="host" @kick="kick"/>
        </div>
        <v-btn color="primary" v-if="host" @click="createLobby">Create lobby</v-btn>
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
            console.log("MESH", this.$store.state.mesh);
            let socket = await this.$store.state.mesh.connect('https://api.ruurd.dev');
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
                await this.$router.replace({query: {game: gameId}});
            }
            //TEMP::::
            // this.host = this.$route.query.host === 'true';
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
                } else if (type === 'kicked') {
                    // console.log('kicked', params);
                    this.$router.push('/kicked?msg=' + params[0]);
                } else if (type === 'start') {
                    this.createLobby();
                }
                console.log("userinfo", id, 'data', type, params);
            });

            await this.$store.state.mesh.join(gameId, true);
            console.log("Joined room", gameId);
            this.$store.state.mesh.broadcastStream(this.meInfo.stream);
        },
        methods: {
            kick(user) {
                if (user === this.meInfo) {
                    return;
                }

                let index = this.users.indexOf(user);
                if (index > -1) {
                    this.$store.state.mesh.send(user.id, ['kicked', 'lmao get fukt']);
                    this.users.splice(index, 1);
                }
            },
            updateSettings(settings) {
                if (this.host)
                    this.$store.state.mesh.broadcast(['settings', settings]);
            },
            updateUserName(user) {
                this.meInfo.name = user;
                this.$store.state.mesh.broadcast(['user', user]);
            },
            createLobby() {
                let settings = this.$refs.settings.getSettings();
                let users = this.$refs.lobbyUsers.getUsers();
                console.log(users);
                this.$store.commit('game', {
                    host: this.host,
                    me: this.meInfo,
                    others: users.filter(user => user.me === false),
                    settings,
                });
                this.$store.state.mesh.broadcastRemoveStream(this.meInfo.stream);
                if (this.host) {
                    this.$store.state.mesh.broadcast(['start', settings]);
                }
                //Remove all listeners used on this page
                this.$store.state.mesh.removeAllListeners();
                this.$router.push('/game');
                // console.log(gameId);
            }
        },
        onBeforeDestroy(){
            this.$store.state.mesh.destroy();
        }
    }
</script>
<style scoped>
    .home {
        width: 100%;
        max-width: 1500px;
        margin: 0 auto;
        padding: 30px;
        text-align: center;
    }

    .settings {
        justify-content: space-evenly;
        display: flex;
    }

    .create-user {
        padding: 20px;
        width: 300px;
    }

    .lobby-settings {
        width: 300px;
    }

    .lobby-users {
        width: 460px;
    }
</style>
