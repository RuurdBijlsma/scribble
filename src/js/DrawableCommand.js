import Command from "@/js/Command";

export default class DrawableCommand extends Command {
    constructor(drawables, drawable) {
        super();
        this.drawables = drawables;
        this.drawable = drawable;
    }

    undo() {
        this.drawables.splice(this.drawables.indexOf(this.drawable), 1);
    }

    execute() {
        this.drawables.push(this.drawable);
    }
}