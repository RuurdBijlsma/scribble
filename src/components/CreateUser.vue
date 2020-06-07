<template>
    <div class="create-user">
        <p class="caption">Draw your avatar (right click to erase):</p>
        <simple-draw class="draw-avatar" :show-controls="false" :brush-size="7" ref="draw"/>
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
            userName: '',
            rules: [v => v.length <= 25 || 'Max 25 characters'],
        }),
        mounted() {
        },
        methods: {
            getStream() {
                return this.$refs.draw.getStream();
            },
            getUser() {
                let avatar = this.$refs.draw.$refs.canvas.toDataURL();
                return {name: this.userName, avatar};
            },
        },
        watch: {
            user(val, old) {
                this.userName = val.substr(0, 25);
                this.$emit('userChange', this.userName);
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
