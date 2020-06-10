<template>
    <div class="game">
        <div class="game-content">
            <div class="users">
                <div v-for="user in everyone">
                    <img :src="user.avatar" alt="User avatar">
                    <p v-if="user.name">{{user.name}}: {{Math.round(user.rounds.map(r=>r.points).reduce((a,b)=>a+b,
                        0))}}</p>
                    <p v-else><i>Unnamed</i></p>
                </div>
            </div>
            <div class="center-content">
                <div class="top-info">
                    <div class="time-left">
                        <span>{{secondsLeft}} second{{secondsLeft !== 1 ? 's' : ''}} left</span>
                    </div>
                    <div class="word">
                        <span v-if="activePlayer === me">{{guessWord}}</span>
                        <span v-else>{{wordHint}}</span>
                    </div>
                    <div class="round-info">
                        <span v-if="settings && settings.rounds">Round {{Math.ceil(currentRound / everyone.length)}} / {{settings.rounds}}</span>
                    </div>
                </div>
                <div class="time-left-bar"
                     v-if="settings"
                     :style="`width:calc(${Math.ceil(timeLeft / settings.time * 1000)/10}% - 20px)`"></div>
                <div class="draw-content">
                    <div class="other-choosing" v-if="otherChoosing">
                        A player is choosing a word to draw
                    </div>

                    <div class="round-end" v-if="showEndRound">
                        <p class="round-info-reveal">The word was</p>
                        <p class="round-info-guess-word">{{guessWord}}</p>
                        <p class="round-info-reveal">Scores</p>
                        <div v-for="user in everyoneSorted"
                             class="round-info-user" :key="user.id">
                            <span class="round-info-name">{{user.name}}:</span>
                            <span class="round-info-total">
                            {{Math.round(user.rounds.slice(0, currentRound - 1).map(r=>r.points).reduce((a,b)=>a+b, 0))}}
                            </span>
                            <span class="round-info-plus">+</span>
                            <span class="round-info-new">{{Math.round(user.rounds[currentRound-1].points)}}</span>
                        </div>
                    </div>

                    <video :srcObject.prop="activePlayer !== null ? activePlayer.stream : null"
                           v-else-if="activePlayer !== me && !otherChoosing"
                           ref="streamViewer"
                           autoplay class="stream-viewer"
                           width="800"
                           height="500"/>

                    <div class="choose-word" v-else-if="choosingWord && activePlayer === me">
                        <p class="headline">Choose a word to draw</p>
                        <div class="word-choices">
                            <div v-for="word in wordChoices">
                                <v-btn @click="startRound(word)" x-large dark text>{{word}}</v-btn>
                            </div>
                        </div>
                    </div>

                    <simple-draw v-show="activePlayer === me && !choosingWord && !showEndRound && !otherChoosing"
                                 class="draw"
                                 ref="draw"
                                 :updateCanvas="activePlayer === me && !choosingWord && !showEndRound && !otherChoosing"/>
                </div>
            </div>
            <div class="chat">
                <v-form @submit="sendChat" autocomplete="off">
                    <div class="chat-content" ref="chatContent">
                        <p v-for="message in chatMessages" :key="message.id" class="chat-message">
                            <span :style="`color: ${stringToColor(message.user.id)}`"
                                  class="chat-message-user">{{message.user.name}}</span>
                            <span class="chat-message-text" v-if="message.type==='guess'">{{message.text}}</span>
                            <span class="chat-message-correct"
                                  v-else-if="message.type==='correct'">Guessed correctly!</span>
                        </p>
                    </div>
                    <v-text-field placeholder="Make guess" class="chat-field" auto filled v-model="chatText"/>
                    <v-btn type="submit" icon class="chat-icon">
                        <v-icon>mdi-send</v-icon>
                    </v-btn>
                </v-form>
            </div>
        </div>
    </div>
</template>

<script>
    import SimpleDraw from "@/components/SimpleDraw";
    import User from "@/js/User";
    import words from '@/assets/words.json';

    export default {
        name: 'Game',
        components: {SimpleDraw},
        data: () => ({
            host: false,
            settings: null,
            me: new User({}),
            others: [],
            everyone: [],
            mesh: null,
            activePlayer: null,
            currentRound: 0,
            guessWord: '',
            wordHint: '',
            chatText: '',
            chatMessages: [],
            roundTimeouts: [],
            roundIntervals: [],
            timeLeft: 0,
            choosingWord: false,
            wordChoices: [],
            chooseTimeout: -1,
            showEndRound: false,
            roundStartTime: 0,
            otherChoosing: false,
        }),
        async mounted() {
            console.log('-------------{MOUNTED}--------------');
            //debug
            if (false) {
                this.$store.commit('game', {
                    host: true,
                    me: new User({
                        avatar: 'data:image/png;base64,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',
                        name: 'RuteNL',
                        id: '12308950175',
                        host: true,
                        me: true,
                    }),
                    others: [],
                    settings: {rounds: 5, time: 10, language: 'English'},
                });
            }

            this.mesh = this.$store.state.mesh;
            this.settings = this.$store.state.game.settings;
            this.me = this.$store.state.game.me;
            this.others = this.$store.state.game.others;
            this.everyone = [this.me, ...this.others].sort((a, b) => a > b ? 1 : -1);

            this.everyone.forEach(u => u.rounds = [...new Array(this.settings.rounds * this.everyone.length)].map(() => ({
                done: false,
                guessTime: -1,
                points: 0
            })));
            console.log(this.everyone);

            let loadRemaining = this.others.length;
            if (loadRemaining === 0)
                this.hostStart();

            this.mesh.on('data', (id, data) => {
                let user = this.everyone.find(user => user.id === id);
                let [type, ...params] = JSON.parse(data);
                console.log("Received data", type, params);
                switch (type) {
                    case 'loaded':
                        if (!this.me.host)
                            break;
                        if (--loadRemaining <= 0) {
                            //done loading
                            this.hostStart();
                        }
                        console.log('id', id, 'user', user, 'loaded', params, 'loadRemaining', loadRemaining);
                        break;
                    case 'start':
                        this.clientStart();
                        break;
                    case 'startRound':
                        let player = this.everyone.find(user => user.id === params[0]);
                        this.generalStartRound(player);
                        break;
                    case 'word':
                        this.setGuessWord(params[0]);
                        this.generalStartRoundAfterWordChoice();
                        break;
                    case 'wordHint':
                        this.setWordHint(params[0]);
                        break;
                    case 'chat':
                        this.submitChatText(user, params[0]);
                        break;
                    case 'endRound':
                        console.log("Endround", params[0]);
                        for (let {id: userId, rounds} of params[0]) {
                            let user = this.everyone.find(u => u.id === userId);
                            user.rounds = rounds;
                        }
                        this.endRound();
                        break;
                }
            });
            this.mesh.on('disconnect', id => {
                let user = this.everyone.findIndex(u => u.id === id);
                this.everyone.splice(this.everyone.indexOf(user), 1);
                this.others.splice(this.others.indexOf(user), 1);
                this.chooseNewHost();
            });
            this.mesh.on('stream', (id, stream) => {
                console.log("Received stream", id, stream);
                let user = this.everyone.find(user => user.id === id);
                user.stream = stream;
            });
            if (this.me.host) {
                console.log("me is host", this.me, this.me.host);
                //send start signal to peers now to make sure the host is first on this page
                this.mesh.broadcast(['start', this.settings]);
            } else {
                //Tell host that this peer is loaded
                let hostUser = this.others.find(user => user.host);
                console.log("me is not host", this.me, this.me.host, 'found host:', hostUser);
                this.mesh.send(hostUser.id, ['loaded']);
            }
            // let wordHint;
            // let chosenWord = 'ladder';
            // for (let i = 0; i < 10; i++) {
            //     wordHint = this.getWordHint(chosenWord, 1 / 4, wordHint);
            // }
        },
        methods: {
            hostStart() {
                console.log("[HOST START]");
                //All users are loaded in at this point
                this.generalStart();
                this.generalStartRound(this.everyone[0]);

                this.mesh.broadcast(['start']);
                this.mesh.broadcast(['startRound', this.activePlayer.id]);
            },
            clientStart() {
                console.log("[clientStart]");
                this.generalStart();
            },
            generalStart() {
                console.log("[generalStart]");
                this.mesh.broadcastStream(this.$refs.draw.getStream());
            },
            async generalStartRound(player) {
                this.showEndRound = false;
                console.log("[generalStartRound]");
                this.currentRound++;
                this.activePlayer = player;
                this.timeLeft = this.settings.time;

                if (this.activePlayer === this.me) {
                    this.chooseWord();
                } else {
                    this.otherChoosing = true;
                }
            },
            async generalStartRoundAfterWordChoice() {
                this.otherChoosing = false;
                this.$refs.draw.resetCanvas();
                this.roundStartTime = performance.now();
                let interval;
                interval = setInterval(() => {
                    let timePassed = performance.now() - this.roundStartTime;
                    this.timeLeft = this.settings.time - timePassed / 1000;
                    if (this.timeLeft < 0) {
                        this.timeLeft = 0;
                        this.endRound();
                        clearInterval(interval);
                    }
                }, 1000 / 30);
                this.roundIntervals.push(interval);
            },
            //Only call this on the person that is drawing this round
            async startRound(chosenWord) {
                clearTimeout(this.chooseTimeout);
                this.generalStartRoundAfterWordChoice();
                this.choosingWord = false;
                console.log("[startRound]");
                this.mesh.broadcast(['word', chosenWord]);

                this.setGuessWord(chosenWord);

                let wordHint = this.getWordHint(chosenWord, 1 / 20);
                this.mesh.broadcast(['wordHint', wordHint]);
                //After 1/4 of the total time give the first hint
                this.roundTimeouts.push(setTimeout(() => {
                    wordHint = this.getWordHint(chosenWord, 1 / 5, wordHint);
                    this.setWordHint(wordHint);
                    this.mesh.broadcast(['wordHint', wordHint]);
                }, this.settings.time * 1000 * (1 / 5)));
                //After 2/4 of the total time give the second hint
                this.roundTimeouts.push(setTimeout(() => {
                    wordHint = this.getWordHint(chosenWord, 1 / 5, wordHint);
                    this.setWordHint(wordHint);
                    this.mesh.broadcast(['wordHint', wordHint]);
                }, this.settings.time * 1000 * (2 / 5)));
                //After 3/4 of the total time give the third hint
                this.roundTimeouts.push(setTimeout(() => {
                    wordHint = this.getWordHint(chosenWord, 1 / 5, wordHint);
                    this.setWordHint(wordHint);
                    this.mesh.broadcast(['wordHint', wordHint]);
                }, this.settings.time * 1000 * (3 / 5)));
                //After 3/4 of the total time give the third hint
                this.roundTimeouts.push(setTimeout(() => {
                    wordHint = this.getWordHint(chosenWord, 1 / 5, wordHint);
                    this.setWordHint(wordHint);
                    this.mesh.broadcast(['wordHint', wordHint]);
                }, this.settings.time * 1000 * (4 / 5)));
            },
            endRound() {
                for (let timeout of this.roundTimeouts)
                    clearTimeout(timeout);
                for (let interval of this.roundIntervals)
                    clearInterval(interval);
                this.showEndRound = true;
                if (this.me.host) {
                    this.roundTimeouts.push(setTimeout(() => {
                        let currentPlayerIndex = this.everyone.indexOf(this.activePlayer);
                        let nextPlayerIndex = (currentPlayerIndex + 1) % this.everyone.length;
                        if (nextPlayerIndex < 0)
                            nextPlayerIndex += this.everyone.length;
                        this.generalStartRound(this.everyone[nextPlayerIndex]);
                        this.mesh.broadcast(['startRound', this.activePlayer.id]);
                    }, 1000 * 10));
                }
            },
            getRandom(arr, n) {
                const result = new Array(n);
                let len = arr.length;
                const taken = new Array(len);
                if (n > len)
                    throw new RangeError("getRandom: more elements taken than available");
                while (n--) {
                    const x = Math.floor(Math.random() * len);
                    result[n] = arr[x in taken ? taken[x] : x];
                    taken[x] = --len in taken ? taken[len] : len;
                }
                return result;
            },
            chooseWord() {
                this.choosingWord = true;
                this.wordChoices = this.getRandom(words, 4);
                this.chooseTimeout = setTimeout(() => {
                    let choice = this.wordChoices[Math.floor(Math.random() * this.wordChoices.length)];
                    this.startRound(choice);
                }, 15000);
            },
            getWordHint(word, revealPercentage, hiddenWord = '_'.repeat(word.length)) {
                revealPercentage = Math.max(0, Math.min(1, revealPercentage));

                if (word.length !== hiddenWord.length)
                    return console.warn("word.length does not match hiddenWord.length", {word, hiddenWord});

                const hiddenChar = '_';
                let letterBag = word.split('').map((letter, index) => ({letter, index}));
                let removeLetters = hiddenWord.split('').map((letter, index) => ({
                    letter,
                    index
                })).filter(l => l.letter !== hiddenChar);
                for (let letter of removeLetters)
                    letterBag.splice(letterBag.findIndex(l => l.index === letter.index), 1);

                const amountOfLettersToReveal = Math.round(letterBag.length * revealPercentage);
                let revealedLetters = [];
                for (let i = 0; i < amountOfLettersToReveal; i++) {
                    let letter = letterBag[Math.floor(Math.random() * letterBag.length)];
                    revealedLetters.push(letter);
                }
                let wordHint = hiddenWord.split('');
                for (let {letter, index} of revealedLetters)
                    wordHint[index] = letter;

                return wordHint.join('');
            },
            setGuessWord(word) {
                this.guessWord = word;
            },
            setWordHint(wordHint) {
                this.wordHint = wordHint;
            },
            calculateScore(isArtist, guessTime, totalTime, rank, guesses, total) {
                //Rank 1 to total, rank of guess
                //Total is amount of users with correct guesses there are
                if (isArtist) {
                    return (total / guesses) * 10;
                } else {
                    let timeScore = guessTime / totalTime;
                    let rankScore = rank / total;
                    return 1 / (timeScore * rankScore);
                }
            },
            sendChat(e) {
                e.preventDefault();
                this.mesh.broadcast(['chat', this.chatText]);
                this.submitChatText(this.me, this.chatText);
                this.chatText = '';
            },
            submitChatText(user, text) {
                if (text.toLowerCase() === this.guessWord.toLowerCase() && user !== this.activePlayer) {
                    this.chatMessages.push({
                        id: Math.floor(Math.random() * 1000000),
                        type: 'correct',
                        user,
                    });
                    //todo record time of completion for the user
                    if (this.me.host) {
                        let roundI = this.currentRound - 1;
                        let guessTime = (performance.now() - this.roundStartTime) / 1000;
                        user.rounds[roundI].guessTime = guessTime;
                        user.rounds[roundI].done = true;
                        // if no one is not done:
                        if (!this.everyone.filter(u => u !== this.activePlayer).some(u => !u.rounds[roundI].done)) {
                            this.everyone.forEach(user => {
                                let userGuessTime = user.rounds[roundI].guessTime;
                                //How many users guessed right before me + 1:
                                let userRank = this.everyone.filter(u => u.rounds[roundI].guessTime < userGuessTime).length + 1;
                                let totalGuesses = this.everyone.filter(u => u.rounds[roundI].done).length;
                                user.rounds[roundI].points = this.calculateScore(user === this.activePlayer, guessTime, this.settings.time, userRank, totalGuesses, this.everyone.length);
                            });
                            let usersInfo = this.everyone.map(u => ({id: u.id, rounds: u.rounds}));
                            console.log("Broadcast endround", usersInfo);
                            this.mesh.broadcast(['endRound', usersInfo]);
                            this.endRound();
                        }
                    }
                } else {
                    this.chatMessages.push({
                        id: Math.floor(Math.random() * 1000000),
                        type: 'guess',
                        text,
                        user,
                    });
                }

                const chat = this.$refs.chatContent;
                setTimeout(() => {
                    chat.scrollTo({
                        top: chat.scrollHeight,
                        left: 0,
                        behavior: "smooth",
                    });
                }, 50);
            },
            stringToColor(str) {
                const hashCode = str => {
                    let hash = 0;
                    for (let i = 0; i < str.length; i++) {
                        hash = str.charCodeAt(i) + ((hash << 5) - hash);
                    }
                    return hash;
                };
                const intToRGB = i => {
                    const c = (i & 0x00FFFFFF)
                        .toString(16)
                        .toUpperCase();

                    return "00000".substring(0, 6 - c.length) + c;
                };
                return '#' + intToRGB(hashCode(str));
            },
            chooseNewHost() {
                if (this.everyone.findIndex(user => user.host) === -1 && this.mesh.isFullyConnected()) {
                    console.log(this.everyone, JSON.stringify(this.everyone));
                    let newHost = this.everyone.sort((a, b) => a.id > b.id ? 1 : -1)[0];
                    newHost.host = true;
                    console.log("Host disconnected, migrating host", newHost);
                }
            },
        },
        computed: {
            secondsLeft() {
                return Math.round(this.timeLeft);
            },
            everyoneSorted() {
                return this.everyone.sort((a, b) => b.rounds[this.currentRound - 1].points - a.rounds[this.currentRound - 1].points);
            }
        },
        beforeDestroy() {
            clearTimeout(this.chooseTimeout);
            for (let timeout of this.roundTimeouts)
                clearTimeout(timeout);
            for (let interval of this.roundIntervals)
                clearInterval(interval);
        }
    }
</script>
<style scoped>
    .time-left-bar {
        height: 8px;
        background-color: lime;
        border-top-right-radius: 8px;
        border-top-left-radius: 8px;
        margin: 0 auto;
    }

    .top-info {
        display: flex;
        justify-content: space-evenly;
        font-family: 'Fredoka One', cursive !important;
        padding: 15px 15px 5px;
        margin-top: 25px;
        font-size: 20px;
        color: white;
    }

    .top-info > div {
        width: 160px;
        text-align: center;
    }

    .word {
        font-size: 30px;
        letter-spacing: 3px;
        flex-grow: 1;
        display: inline-block;
        word-wrap: break-word;
    }

    .time-left, .round-info {
        padding-top: 10px;
    }

    .game-content[data-v-3614b62c] {
        /*min-width: 1237px;*/
        margin: auto 10px;
        display: flex;
        justify-content: center;
    }

    .game-content > div {
        display: inline-block;
    }

    .users {
        background-color: rgba(255, 255, 255, 0.5);
        vertical-align: top;
        padding: 20px;
        text-align: center;
        border-top-left-radius: 10px;
        border-bottom-left-radius: 10px;
        margin-top: 110px;
        max-height: 460px;
    }

    .users img {
        border-radius: 50%;
        width: 70px;
        height: 70px;
    }

    .center-content {
        display: flex;
        flex-direction: column;
    }

    .other-choosing {
        height: 500px;
        width: 800px;
        background-color: rgba(0, 0, 0, 0.8);
        border-radius: 10px;
        box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.3);
        padding: 50px;
        font-size: 40px;
        font-family: 'Fredoka One', cursive !important;
        color: white;
        text-align: center;
        overflow-y: auto;
    }

    .choose-word {
        width: 800px;
        height: 500px;
        background-color: rgba(0, 0, 0, 0.8);
        border-radius: 10px;
        box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.3);
        padding: 50px;
        font-size: 40px;
        font-family: 'Fredoka One', cursive !important;
        color: white;
        text-align: center;
        overflow-y: auto;
    }

    .draw-content {
        /*width: 800px;*/
        /*height: 500px;*/
    }

    .round-end {
        width: 800px;
        height: 500px;
        background-color: rgba(0, 0, 0, 0.8);
        border-radius: 10px;
        box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.3);
        padding: 50px;
        font-size: 30px;
        font-family: 'Fredoka One', cursive !important;
        color: white;
        text-align: center;
        overflow-y: auto;
    }

    .round-info-reveal {
        color: rgba(255, 255, 255, 0.6);
        font-size: 20px;
    }

    .round-info-guess-word {
        color: white;
        font-size: 40px;
    }

    .round-info-name {
        color: rgba(255, 255, 255, 0.6);
    }

    .round-info-total {
        color: rgba(255, 255, 255, 0.6);
    }

    .round-info-plus {
        color: lime;
    }

    .round-info-new {
        color: lime;
    }

    .choose-word p {
        font-family: 'Fredoka One', cursive !important;
        color: white;
    }

    .word-choices {
        display: flex;
        justify-content: space-evenly;
    }

    .draw {
        width: 800px;
        height: 580px;
        background-color: rgba(255, 255, 255, 0.25);
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.3);
    }

    .stream-viewer {
        width: 800px;
        height: 500px;
        background-color: rgba(255, 255, 255, 0.25);
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.3);
    }

    .chat {
        background-color: rgba(255, 255, 255, 0.5);
        height: 460px;
        width: 300px;
        border-top-right-radius: 10px;
        border-bottom-right-radius: 10px;
        margin-top: 110px;
        vertical-align: top;
        overflow: hidden;
    }

    .chat-content {
        height: calc(100% - 57px);
        width: 100%;
        padding: 10px;
        overflow-y: auto;
    }

    .chat-field {
        width: 100%;
        margin-right: -45px;
        display: inline-block;
    }

    .chat-icon {
        display: inline-block;
    }

    .chat-message {
        margin: 5px 0;
    }

    .chat-message-user {
        font-weight: bold;
        margin-right: 6px;
        background-color: white;
        border-radius: 4px;
        padding: 3px 7px;
    }

    .chat-message-text {

    }

    .chat-message-correct {
        font-style: italic;
        color: lime;
        background-color: white;
        border-radius: 4px;
        padding: 3px 7px;
    }

    form.v-form {
        height: 100%;
    }
</style>
