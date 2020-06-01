<template>
    <div class="users">
        <p class="caption">Users in lobby:</p>
        <div class="user" v-for="user in users" :key="user.id">
            <video class="video"
                   :srcObject.prop="user.stream"
                   ref="videos"
                   @canplay="playVideo($event)"
                   autoplay/>
            <p v-if="user.name">{{user.name}}</p>
            <p v-else><i>Unnamed</i></p>
        </div>
    </div>
</template>

<script>
    export default {
        name: "LobbyUsers",
        props: {
            users: {
                type: Array,
                default: [],
            },
        },
        data: () => ({}),
        mounted() {
        },
        methods: {
            async playVideo(e) {
                let video = e.target;
                try {
                    await video.play();
                } catch (e) {
                    //interact first -.-
                    let interval;
                    interval = setInterval(async () => {
                        try {
                            await video.play();
                            clearInterval(interval);
                            console.log("Video is playing")
                        } catch (e) {
                            //try again
                        }
                    }, 300);
                }
            }
        },
        watch: {
            users: {
                deep: true,
                handler() {
                    console.log("users change")
                }
            }
        }
    }
</script>

<style scoped>
    .users {
        padding: 20px;
    }

    .user {
        display: inline-block;
        margin: 10px;
        text-align: center;
    }

    .video {
        border-radius: 50%;
        height: 120px;
        width: 120px;
        background-color: white;
        box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.3);
    }
</style>