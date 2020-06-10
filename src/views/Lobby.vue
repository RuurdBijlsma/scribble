<template>
    <div class="lobby">
        <v-card>
            <v-card-title class="headline">Game lobby - {{$route.query.game}}</v-card-title>
            <v-card-subtitle>Share the link with others to invite them.</v-card-subtitle>
            <div class="settings">
                <lobby-settings :read-only="!me.host" ref="settings" @change="updateSettings"
                                :updateSettings="settings"/>
                <create-user :read-only="!me.host" ref="createUser" @userChange="updateUserName"/>
                <lobby-users class="lobby-users" ref="lobbyUsers" :users="users" :me="me" @kick="kick"/>
            </div>
            <v-card-actions>
                <v-btn color="primary" v-if="me.host" @click="createLobby">Create lobby</v-btn>
            </v-card-actions>
        </v-card>
    </div>
</template>

<script>
    import SimpleDraw from "@/components/SimpleDraw";
    import CreateUser from "@/components/CreateUser";
    import LobbySettings from "@/components/LobbySettings";
    import LobbyUsers from "@/components/LobbyUsers";
    import User from "@/js/User";

    export default {
        name: 'Lobby',
        components: {LobbyUsers, LobbySettings, CreateUser, SimpleDraw},
        data: () => ({
            users: [],
            me: new User({me: true}),
            settings: null,
            mesh: null,
            hostInterval: -1,
        }),
        async mounted() {
            this.mesh = this.$store.state.mesh;
            console.log("MESH", this.mesh);
            let socket = await this.mesh.connect('https://api.ruurd.dev');
            console.log(socket);

            this.me.id = socket.id;
            this.me.stream = this.$refs.createUser.getStream();
            this.users.push(this.me);

            if (!this.$route.query.hasOwnProperty('game')) {
                console.log("HOST");
                this.me.host = true;
                let gameId = (Math.floor(Math.random() * 1679616)).toString(36).padStart(4, '0').toUpperCase();
                await this.$router.replace({query: {game: gameId}});
            }
            //TEMP::::
            // this.me.host = this.$route.query.host === 'true';
            let gameId = this.$route.query.game;

            let userMap = {};
            this.mesh.on('connect', id => {
                if (!userMap[id]) {
                    userMap[id] = new User({id});
                    this.users.push(userMap[id]);
                }
                console.log("userinfo", id, 'connect');

                this.mesh.send(id, ['user', this.me]);
                let settings = this.$refs.settings.getSettings();
                this.mesh.send(id, ['settings', settings]);

            });

            this.mesh.on('fullConnect', () => {
                console.log("FUlly connected");
                this.hostInterval = setInterval(() => {
                    this.chooseNewHost();
                }, 1000);
            });

            this.mesh.on('disconnect', id => {
                delete userMap[id];
                let userInfo = this.users.find(u => u.id === id);
                this.users.splice(this.users.indexOf(userInfo), 1);

                console.log("Disconnect trigger");
                this.chooseNewHost();
            });

            this.mesh.on('stream', (id, stream) => {
                if (!userMap[id]) {
                    userMap[id] = new User({id});
                    this.users.push(userMap[id]);
                }
                userMap[id].stream = stream;
                console.log("userinfo", id, 'stream', stream);
            });

            this.mesh.on('data', (id, data) => {
                if (!userMap[id]) {
                    userMap[id] = new User({id});
                    this.users.push(userMap[id]);
                }
                let [type, ...params] = JSON.parse(data);
                console.log("userinfo", id, 'data', type, params);
                if (type === 'user') {
                    userMap[id].name = params[0].name;
                    userMap[id].host = params[0].host;
                } else if (type === 'settings') {
                    if (!this.me.host)
                        this.settings = params[0];
                } else if (type === 'kicked') {
                    // console.log('kicked', params);
                    this.$router.push('/kicked?msg=' + params[0]);
                } else if (type === 'start') {
                    userMap[id].host = true;
                    this.createLobby();
                }
                console.log("userinfo", id, 'data', type, params);
            });

            await this.mesh.join(gameId, true);
            console.log("Joined room", gameId);
            this.mesh.broadcastStream(this.me.stream);
        },
        methods: {
            chooseNewHost() {
                //Check if there isn't a host connected already
                if (this.users.findIndex(user => user.host) === -1 && this.mesh.isFullyConnected()) {
                    console.log(this.users, JSON.stringify(this.users));
                    let newHost = this.users.sort((a, b) => a.id > b.id ? 1 : -1)[0];
                    newHost.host = true;
                    console.log("Host disconnected, migrating host", newHost);
                }
            },
            kick(user) {
                if (user === this.me) {
                    return;
                }

                let index = this.users.indexOf(user);
                if (index > -1) {
                    this.mesh.send(user.id, ['kicked', 'lmao get fukt']);
                    this.users.splice(index, 1);
                }
            },
            updateSettings(settings) {
                if (this.me.host)
                    this.mesh.broadcast(['settings', settings]);
            },
            updateUserName(userName) {
                this.me.name = userName;
                this.mesh.broadcast(['user', this.me]);
            },
            createLobby() {
                let settings = this.$refs.settings.getSettings();
                let users = this.$refs.lobbyUsers.getUsers();
                let {avatar} = this.$refs.createUser.getUser();
                this.me.avatar = avatar;
                this.$store.commit('game', {
                    me: this.me,
                    others: users.filter(user => user.me === false),
                    settings,
                });
                this.mesh.broadcastRemoveStream(this.me.stream);
                //Remove all listeners used on this page
                this.mesh.removeAllListeners();
                console.warn("Calling destroy");
                this.$router.push('/game');
                // console.log(gameId);
            }
        },
        watch: {
            me(val, old) {
                console.log("ME CHANGED from old to new", old, val);
            }
        },
        beforeDestroy() {
            // this.mesh.destroy();
            console.warn('DESTROY LOBBY');
            clearInterval(this.hostInterval);
        },
    }
</script>
<style scoped>
    .lobby {
        width: 100%;
        max-width: 1300px;
        margin: 0 auto;
        padding: 30px;
    }

    .settings {
        justify-content: space-evenly;
        display: flex;
    }

    .create-user {
        padding: 20px;
        width: 352px;
    }

    .lobby-settings {
        width: 300px;
    }

    .lobby-users {
        width: 460px;
    }
</style>
