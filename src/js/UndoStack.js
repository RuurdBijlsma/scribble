class UndoStack {
    constructor() {
        this.reset();
    }

    initializeIfNeeded() {
        if (this.states.length === 0) {
            this.saveState();
        }
    }

    setCanvas(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
    }

    saveState() {
        // console.log(this.canvas.width, this.canvas.height);
        if (this.canvas.width === 0 || this.canvas.height === 0)
            return;
        this.states.splice(this.stackPosition + 2, this.states.length);
        this.states.push(this.context.getImageData(0, 0, this.canvas.width, this.canvas.height));
        this.stackPosition = this.states.length - 2;
    }

    undo() {
        if (this.states.length > 0 && this.stackPosition >= 0)
            this.context.putImageData(this.states[this.stackPosition--], 0, 0);
        else
            console.log("Cant undo");
    }

    redo() {
        if (this.stackPosition + 2 < this.states.length)
            this.context.putImageData(this.states[++this.stackPosition + 1], 0, 0);
        else
            console.log("Cant redo");
    }

    reset(canvas) {
        this.states = [];
        this.stackPosition = -1;
        if (canvas !== undefined)
            this.setCanvas(canvas);
    }
}

export default new UndoStack();