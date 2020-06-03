<template>
    <div class="create-user">
        <p class="caption">Draw your avatar (right click to erase):</p>
        <simple-draw class="draw-avatar" :show-controls="false" :brush-size="7" ref="draw"/>
        <v-text-field :rules="rules"
                      label="Username"
                      v-model="user"
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
            user: '',
            rules: [v => v.length <= 25 || 'Max 25 characters'],
        }),
        mounted() {
        },
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
            user(val, old) {
                this.user = val.substr(0, 25);
                this.$emit('userChange', this.user);
            }
        }
    }
</script>
<style scoped>
    .create-user {
        padding: 20px;
        text-align: center;
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
