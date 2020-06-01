<template>
    <div class="lobby-settings">
        <p class="caption">Game settings:</p>
        <v-form>
            <v-select :readonly="readOnly" label="Rounds" v-model="settings.rounds" :items="roundOptions"/>
            <v-select :readonly="readOnly" label="Time limit" v-model="settings.time" :items="timeOptions"/>
            <v-select :readonly="readOnly" label="Language" v-model="settings.language" :items="languageOptions"/>
        </v-form>
    </div>
</template>

<script>
    export default {
        name: "LobbySettings",
        props: {
            readOnly: {
                type: Boolean,
                default: false,
            },
            updateSettings: {
                type: Object,
                default: null,
            },
        },
        data: () => ({
            roundOptions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            timeOptions: [
                {text: '10 seconds', value: 10,},
                {text: '30 seconds', value: 30,},
                {text: '50 seconds', value: 50,},
                {text: '70 seconds', value: 70,},
                {text: '90 seconds', value: 90,},
                {text: '100 seconds', value: 100,},
                {text: '120 seconds', value: 120,},
                {text: '140 seconds', value: 140,},
                {text: '160 seconds', value: 160,},
                {text: '180 seconds', value: 180,},
                {text: '200 seconds', value: 200,},
            ],
            languageOptions: ['English', 'Dutch'],
            settings: {
                rounds: 5,
                time: 100,
                language: 'English',
            },
        }),
        methods: {
            getSettings() {
                let {rounds, time, language} = this.settings;
                return {rounds, time, language};
            }
        },
        watch: {
            updateSettings() {
                if (this.updateSettings !== null) {
                    this.settings = this.updateSettings;
                }
            },
            settings: {
                deep: true,
                handler() {
                    this.$emit('change', this.settings);
                }
            }
        }
    }
</script>

<style scoped>
    .lobby-settings {
        padding: 20px;
    }
</style>