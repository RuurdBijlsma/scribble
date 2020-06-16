import EventEmitter from 'events';

export default class Sound extends EventEmitter {
    constructor(src) {
        super()
        this.context = new AudioContext();
        this.analyser = this.context.createAnalyser();
        this.analyser.connect(this.context.destination);

        this.init(src).then(() => this.emit('load'));
    }

    async init(src) {
        this.buffer = await this.loadSound(src);
    }

    async loadSound(audioURL) {
        let response = await fetch(audioURL);
        let arrayBuffer = await response.arrayBuffer();

        return new Promise(resolve => {
            this.context.decodeAudioData(arrayBuffer, buffer => resolve(buffer));
        })
    }

    setSource() {
        this.source = this.context.createBufferSource();
        this.source.buffer = this.buffer;

        this.source.connect(this.analyser);
    }

    play(v) {
        this.setSource(v);
        this.source.start(0);
        this.source.onended = () => this.stop();
    }

    stop() {
        this.source.stop()
    }
}