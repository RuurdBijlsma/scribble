<template>
    <div class="create-user">
        <p class="caption">Draw your avatar (right click to erase):</p>
        <simple-draw class="draw-avatar" :show-controls="false" :brush-size="7" ref="draw"/>
        <v-text-field label="Username" v-model="user" name="username"/>
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
            user: '',
        }),
        methods: {
            getUser() {
                return {
                    image: this.$refs.draw.$refs.canvas.toDataURL(),
                    user: this.user,
                    stream: this.$refs.draw.$refs.canvas.captureStream()
                };
            },
        },
        watch: {
            user() {
                console.log('emitting change', this.user);
                this.$emit('userChange', this.user);
            }
        }
    }
</script>
<style scoped>
    .create-user {
        padding: 20px;
    }

    .draw-avatar {
        height: 200px;
        width: 200px;
        border-radius: 50%;
        overflow: hidden;
        box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.3);
        margin: 20px 0;
    }
</style>
