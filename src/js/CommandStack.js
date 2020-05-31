class CommandStack {
    constructor() {
        this.reset();
    }

    addCommand(command) {
        this.commands.splice(this.stackPosition + 1, this.commands.length);
        this.commands.push(command);
        this.stackPosition = this.commands.length - 1;
    }

    executeCommand(command) {
        this.addCommand(command);
        command.execute();
    }

    undo() {
        if (this.commands.length > 0 && this.stackPosition >= 0)
            this.commands[this.stackPosition--].undo();
        else
            console.log("Cant undo");
    }

    redo() {
        if (this.stackPosition + 1 < this.commands.length)
            this.commands[++this.stackPosition].execute();
        else
            console.log("Cant redo");
    }

    reset() {
        this.commands = [];
        this.stackPosition = -1;//Stack position refers to the last executed command
    }
}

export default new CommandStack();