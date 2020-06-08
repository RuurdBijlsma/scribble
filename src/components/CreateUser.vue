<template>
    <div class="create-user">
        <p class="caption">Draw your avatar (right click to erase):</p>
        <div class="draw-container">
            <v-btn icon @click="$refs.draw.skipColor(-1)">
                <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
            <simple-draw class="draw-avatar"
                         :show-controls="false"
                         :brush-size="7"
                         ref="draw"
                         @colorChange="highlightColor"
                         :style="`box-shadow: 0 0 0px 5px ${color}, 0 0 30px 0 rgba(0,0,0,0.3)`"
            />
            <v-btn icon @click="$refs.draw.skipColor(1)">
                <v-icon>mdi-arrow-right</v-icon>
            </v-btn>
        </div>
        <v-text-field :rules="rules"
                      label="Username"
                      v-model="userName"
                      outlined
                      name="username"/>
    </div>
</template>

<script>
    import SimpleDraw from "@/components/SimpleDraw";

    export default {
        name: 'CreateUser',
        components: {SimpleDraw},
        props: {
            readOnly: {
                type: Boolean,
                default: false,
            },
        },
        data: () => ({
            color: 'black',
            userName: '',
            rules: [v => v.length <= 25 || 'Max 25 characters'],
            saveInterval: -1,
        }),
        mounted() {
            if (localStorage.getItem('lastAvatar') !== null) {
                this.$refs.draw.drawImage(localStorage.lastAvatar, 0, 0);
            }

            this.saveInterval = setInterval(() => {
                localStorage.lastAvatar = this.$refs.draw.$refs.canvas.toDataURL();
            }, 1000);
        },
        methods: {
            highlightColor(color) {
                this.color = this.$refs.draw.toRgb(...color);
            },
            getStream() {
                return this.$refs.draw.getStream();
            },
            getUser() {
                let avatar = this.$refs.draw.$refs.canvas.toDataURL();
                return {name: this.userName, avatar};
            },
        },
        watch: {
            userName(val, old) {
                console.log('user emit');
                this.userName = val.substr(0, 25);
                this.$emit('userChange', this.userName);
            }
        },
        onBeforeDestroy() {
            clearInterval(this.saveInterval);
        }
    }
</script>
<style scoped>
    .create-user {
        padding: 20px;
        text-align: center;
    }

    .draw-container {
        display: flex;
        /*width:220px;*/
    }

    .draw-container > .v-btn {
        margin: 100px 10px;
    }

    .draw-avatar {
        height: 200px;
        width: 200px;
        border-radius: 50%;
        overflow: hidden;
        box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.3);
        margin: 20px 0;
        display: inline-block;
    }
</style>
