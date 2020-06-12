<template>
    <div class="home">
        <v-card>
            <v-card-title class="headline">Server Browser</v-card-title>
            <v-card-text v-if="servers.length === 0">No servers active</v-card-text>
            <v-list v-else>
                <v-list-item-group color="primary">
                    <v-list-item v-for="(server, i) in servers"
                                 :key="i"
                                 :to="'lobby?game=' + server.id">
                        <v-list-item-icon>
                            <v-icon>mdi-earth</v-icon>
                        </v-list-item-icon>
                        <v-list-item-content>
                            <v-list-item-title>{{server.id}}</v-list-item-title>
                            <v-list-item-subtitle>Users in lobby: {{server.userCount}}</v-list-item-subtitle>
                        </v-list-item-content>
                    </v-list-item>
                </v-list-item-group>
            </v-list>
        </v-card>
        <v-card>
            <v-form @submit="start">
                <v-card-title class="headline">Start match</v-card-title>
                <v-card-subtitle>Create a private or public lobby.
                </v-card-subtitle>
                <v-card-text>
                    <v-switch label="Public lobby" v-model="isPublic"/>
                    <v-text-field name="server name" v-if="isPublic" label="Server name" placeholder="Leave empty for random name"
                                  v-model="serverName"/>
                </v-card-text>
                <v-card-actions>
                    <v-btn text :to="url" type="submit">Create lobby</v-btn>
                </v-card-actions>
            </v-form>
        </v-card>
    </div>
</template>

<script>

    export default {
        name: 'Home',
        components: {},
        data: () => ({
            serverName: '',
            servers: [],
            server: null,
            isPublic: false,
        }),
        async mounted() {
            this.servers = (await (await fetch("https://api.ruurd.dev/rooms")).json()).filter(r => r.appName === 'scribble');
        },
        methods: {
            start(e) {
                e.preventDefault();
                this.$router.push(this.url);
            },
        },
        computed: {
            url() {
                return 'lobby?public=' + this.isPublic + (this.serverName === '' ? '' : '&game=' + this.serverName);
            }
        },
    }
</script>
<style scoped>
    .home {
        width: 100%;
        max-width: 700px;
        margin: 0 auto;
        padding: 30px;
        display: flex;
        /*text-align: center;*/
        justify-content: space-evenly;
        flex-direction: column;
    }

    .home > div {
        padding: 15px;
        margin: 20px;
    }
</style>
