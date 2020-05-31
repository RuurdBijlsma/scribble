import Command from "@/js/Command";

export default class ClearCommand extends Command {
    constructor(drawables) {
        super();
        this.drawables = drawables;
        this.drawablesBackup = [...drawables];
    }

    undo() {
        this.drawables.push(...this.drawablesBackup);
    }

    execute() {
        this.drawables.splice(0, this.drawables.length);
    }
}