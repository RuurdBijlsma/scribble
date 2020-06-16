import Sound from "@/js/Sound";

export default class VolumeSound extends Sound {
    constructor(src, defaultVolume = 1) {
        super(src);
        this.defaultVolume = defaultVolume;
    }

    setSource(v = this.defaultVolume) {
        if (!this.context.createGain)
            this.context.createGain = this.context.createGainNode;
        this.gainNode = this.context.createGain();

        super.setSource();
        this.source.connect(this.gainNode);

        this.gainNode.connect(this.context.destination);

        this.volume = v;
    }

    set volume(v) {
        this._volume = v > 1 ? 1 : v;
        this._volume = this._volume < 0 ? 0 : this._volume;
        v = this.volume;
        v *= 3;
        v -= 1;
        console.log("Gain value", v);
        this.gainNode.gain.setValueAtTime(v, this.context.currentTime);
    }

    get volume() {
        return this._volume;
    }
}