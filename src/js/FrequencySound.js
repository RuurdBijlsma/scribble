import Sound from "@/js/Sound";

export default class FrequencySound extends Sound {
    constructor(src) {
        super(src);
    }

    setSource(v = 1) {
        this.source = this.context.createBufferSource();
        this.source.buffer = this.buffer;
        this.filter = this.context.createBiquadFilter();
        this.filter.type = (typeof this.filter.type === 'string') ? 'lowpass' : 0;
        this.filter.frequency.value = 5000;
        this.source.connect(this.filter);
        this.filter.connect(this.context.destination);

        this.frequency = v;
    }

    set frequency(f) {
        f = f > 5 ? 5 : f;
        f = f < 0 ? 0 : f;

        let minValue = 40;
        let maxValue = this.context.sampleRate / 2;
        let numberOfOctaves = Math.log(maxValue / minValue) / Math.LN2;
        let multiplier = Math.pow(2, numberOfOctaves * (f - 1.0));
        this.filter.frequency.value = maxValue * multiplier;

        this._frequency = f;
    }

    get frequency() {
        return this._frequency;
    }
}
