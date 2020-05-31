<template>
    <div class="home">
        <h1>Home</h1>
        <p>Create lobby</p>
        <div class="settings">

        </div>
        <v-btn>create</v-btn>
    </div>
</template>

<script>
    import SimpleDraw from "@/components/SimpleDraw";

    export default {
        name: 'Home',
        components: {SimpleDraw},
        data: () => ({
            activePlayer: 'someone',
        }),
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
</style>
