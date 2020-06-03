<template>
    <div class="kicked">
        <h1>KICKED >:(</h1>
        <h2>{{$route.query.msg}}</h2>
        <v-btn to="/" text>Return to home page</v-btn>
    </div>
</template>
<style scoped>
    .kicked {
        text-align: center;
        padding: 100px;
    }

    h1 {
        font-size: 150px;
    }
</style>
