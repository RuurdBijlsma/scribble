<template>
    <div class="create-user">
        <video v-if="!host" ref="streamViewer" controls autoplay class="stream-viewer" width="800" height="420"/>
        <simple-draw v-show="host" class="draw" @change="sendChange" ref="simpleDraw" :updateCanvas="host"/>
    </div>
</template>

<script>
    import SimpleDraw from "@/components/SimpleDraw";
    import SimplePeerMesh from "@/js/SimplePeerMesh";

    export default {
        name: 'Home',
        components: {SimpleDraw},
        data: () => ({
            me: '',
            host: false,
            activePlayer: '',
            mesh: new SimplePeerMesh('scribble')
        }),
        async mounted() {
            let socket = await this.mesh.connect('http://localhost:3000');

            this.me = socket.id;
            this.host = this.$route.query.host === 'true';
            console.log(this.host);
            this.activePlayer = this.me;

            this.mesh.on('data', (id, data) => {
                // if (this.activePlayer === id)
                this.updateCanvas(data);
            });

            this.mesh.on('stream', (id, stream) => {
                let video = this.$refs.streamViewer;
                video.srcObject = stream;
                console.log("set sourc object");
                video.oncanplay = async () => {
                    await video.play();
                    console.log('received stream', video, id, stream);
                }
            });

            await this.mesh.join('bye', false);

            this.start();
        },
        methods: {
            start() {
                if (this.host) {
                    let draw = this.$refs.simpleDraw;
                    let canvas = draw.$refs.canvas;
                    let stream = canvas.captureStream();
                    this.mesh.broadcastStream(stream)
                }
            },
            sendChange() {
                // this.mesh.broadcast(['change', {data: 'data'}])
            },
        },
        onBeforeDestroy() {
            this.mesh.destroy();
        }
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
