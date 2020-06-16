<template>
    <div class="simple-draw">
        <div class="canvas-container"
             @keypress="handleKey"
             :style="`height: calc(100% - ${showControls ? 80 : 0}px)`"
        >
            <canvas class="canvas"
                    ref="canvas"
                    @touchstart="startTouch"
                    @mousedown="startMove"
                    @resize="canvasResize"
                    @contextmenu="preventContext"
            >
                Canvas is not supported
            </canvas>
        </div>
        <div class="controls" v-if="showControls" :style="`pointer-events: ${readOnly ? 'none' : 'all'}`">
            <div class="colors">
                <v-color-picker v-show="showColorPicker" class="color-picker" v-model="pickedColor"/>
                <div class="selected-color" :style="`background-color: ${activeRgb}`"
                     @click="toggleColorPicker"></div>
                <div class="color-grid">
                    <div v-for="(row, i) in colors" class="color-row" :key="i">
                        <div v-for="[r,g,b,a] in row"
                             class="single-color"
                             :style="`background-color: rgb(${r},${g},${b})`"
                             @click="selectColor(r,g,b,a)"
                             :key="r+g+b+a"></div>
                    </div>
                </div>
            </div>
            <div class="tools">
                <div class="brush" :active="this.activeTool === 'brush'" @click="selectTool('brush')"></div>
                <div class="fill" :active="this.activeTool === 'fill'" @click="selectTool('fill')"></div>
                <div class="erase" :active="this.activeTool === 'eraser'" @click="selectTool('eraser')"></div>
            </div>
            <div class="brush-sizes">
                <div v-for="size in brushSizes" :key="size"
                     :active="activeBrush === size"
                     @click="selectBrush(size)"
                     :style="`
                        height: ${size}px;
                        width: ${size}px;
                        background-color: ${activeRgb};
                        margin-top: ${5 + 25 - size / 2}px;
                    `"
                ></div>
            </div>
            <div class="clear-canvas" @click="clearCanvas">
            </div>
        </div>
    </div>
</template>

<script>
    import UndoStack from "@/js/UndoStack";


    export default {
        name: 'SimpleDraw',
        props: {
            readOnly: {
                type: Boolean,
                default: false,
            },
            updateCanvas: {
                type: Boolean,
                default: false,
            },
            showControls: {
                type: Boolean,
                default: true,
            },
            brushSize: {
                type: Number,
                default: 13,
            },
        },
        data: () => ({
            activeTool: 'brush',
            activeColor: [0, 0, 0, 255],
            activeBrush: 13,
            showColorPicker: false,
            colors: [
                [
                    [255, 255, 255, 255],
                    [193, 193, 193, 255],
                    [239, 19, 11, 255],
                    [255, 113, 0, 255],
                    [255, 228, 0, 255],
                    [0, 204, 0, 255],
                    [0, 178, 255, 255],
                    [35, 31, 211, 255],
                    [163, 0, 186, 255],
                    [211, 124, 170, 255],
                    [160, 82, 45, 255]
                ], [
                    [0, 0, 0, 255],
                    [76, 76, 76, 255],
                    [116, 11, 7, 255],
                    [194, 56, 0, 255],
                    [232, 162, 0, 255],
                    [0, 85, 16, 255],
                    [0, 86, 158, 255],
                    [14, 8, 101, 255],
                    [85, 0, 105, 255],
                    [167, 85, 116, 255],
                    [99, 48, 13, 255],
                ]
                ,],
            brushSizes: [7, 13, 25, 50],
            fingers: {},
            context: null,
            canvas: null,
            animationId: -1,
            canvasWidth: 10,
            canvasHeight: 10,
            canvasUpdateInterval: -1,
            commands: [],
            commandIndex: 0,
            shouldPreventContext: false,
            pickedColor: {r: 0, g: 0, b: 0, a: 1},
            remoteFingers: {},
        }),
        mounted() {
            console.log(UndoStack);
            this.activeBrush = this.brushSize;

            this.canvas = this.$refs.canvas;
            this.context = this.getContext();

            window.addEventListener('resize', this.canvasResize, false);
            document.addEventListener('keyup', this.handleKey, false);
            document.addEventListener('mousemove', this.move, false);
            document.addEventListener('touchmove', this.moveTouch, false);
            document.addEventListener('mouseup', this.endMove, false);
            document.addEventListener('touchend', this.endTouch, false);
            document.addEventListener('wheel', this.handleWheel, false);

            document.addEventListener('contextmenu', this.preventContext, false);

            this.updateCursor(this.activeBrush, this.activeColor, this.activeTool);
            UndoStack.setCanvas(this.canvas);
            this.canvasResize();

            this.canvasUpdateInterval = setInterval(() => {
                if (this.canvas.width > 0 && this.canvas.height > 0) {
                    let pixel = this.context.getImageData(0, 0, 1, 1);
                    this.context.putImageData(pixel, 0, 0);
                }
            }, 1000 / 10);
        },
        beforeDestroy() {
            window.removeEventListener('resize', this.canvasResize);
            document.removeEventListener('keyup', this.handleKey);
            document.removeEventListener('mousemove', this.move);
            document.removeEventListener('touchmove', this.moveTouch);
            document.removeEventListener('mouseup', this.endMove);
            document.removeEventListener('touchend', this.endTouch);
            document.removeEventListener('wheel', this.handleWheel);
            UndoStack.reset();
            clearInterval(this.canvasUpdateInterval);
        },
        methods: {
            applyToolUse(toolUse) {
                switch (toolUse.tool) {
                    case "clear":
                        this.clearCanvas(false);
                        break;
                    case "brush":
                    case "eraser":
                    case "fill":
                        if (!this.remoteFingers.hasOwnProperty(toolUse.id))
                            this.remoteFingers[toolUse.id] = {down: true};
                        // console.log(this.remoteFingers);
                        let finger = this.remoteFingers[toolUse.id];
                        // console.log(toolUse);
                        switch (toolUse.state) {
                            case "start":
                                this.startTool(toolUse.x, toolUse.y, finger, toolUse.tool, toolUse.brushSize, false);
                                if (toolUse.tool === 'fill')
                                    delete this.remoteFingers[toolUse.id];

                                break;
                            case "move":
                                this.moveTool(toolUse.x, toolUse.y, finger, toolUse.tool, false);
                                break;
                            case "end":
                                this.endTool(toolUse.x, toolUse.y, finger, toolUse.tool, false);
                                delete this.remoteFingers[toolUse.id];
                                break;
                        }
                        break;
                    case "color":
                        this.selectColor(...toolUse.color, true, false);
                        break;
                    case "brushSize":
                        this.selectBrush(toolUse.brush, false);
                        break;
                    case "undo":
                        UndoStack.undo();
                        break;
                    case "redo":
                        UndoStack.redo();
                        break;
                    default:
                        console.log("No case set for toolUse:", toolUse);
                        break;
                }
            },
            getContext({
                           brushSize = this.activeBrush,
                           color = this.activeColor,
                       } = {}) {
                let context = this.canvas.getContext('2d');
                context.lineCap = 'round';
                context.lineJoin = 'round';
                context.strokeStyle = this.toRgb(...color);
                context.lineWidth = brushSize;
                return context;
            },
            handleWheel(e) {
                if (e.altKey) {
                    let newSize = this.activeBrush - e.deltaY / 50;
                    newSize = Math.max(Math.min(107, newSize), 1);
                    this.selectBrush(newSize);
                }
            },
            pickColorToColor({r, g, b, a}) {
                return [r, g, b, Math.floor(a * 255)];
            },
            colorToPickColor([r, g, b, a]) {
                return {r, g, b, a: a / 255};
            },
            toggleColorPicker() {
                this.showColorPicker = !this.showColorPicker;
            },
            async drawImage(url, x, y) {
                return new Promise(resolve => {
                    let image = new Image();
                    image.src = url;
                    image.onload = () => {
                        this.context.drawImage(image, x, y);
                    }
                });
            },
            skipColor(n) {
                let allColours = [...this.colors[0], ...this.colors[1]];
                let currentColorIndex = allColours.findIndex(c => this.colorEquals(c, this.activeColor));
                let nextIndex = (currentColorIndex + n) % allColours.length;
                if (nextIndex < 0)
                    nextIndex += allColours.length;
                this.selectColor(...allColours[nextIndex]);
                console.log("Skip", n, this.activeColor, nextIndex);
            },
            getStream() {
                return this.$refs.canvas.captureStream();
            },
            preventContext(e) {
                if (this.shouldPreventContext) {
                    e.preventDefault();
                    return false;
                }
            },
            startTool(x, y, finger, tool = this.activeTool, brushSize = this.activeBrush, emit = true) {
                if (emit) {
                    finger.id = Math.floor(Math.random() * 999999999);
                    this.$emit('toolUse', {
                        tool,
                        x: Math.floor(x), y: Math.floor(y),
                        brushSize,
                        state: 'start',
                        id: finger.id,
                    });
                }

                this.showColorPicker = false;
                if (tool === 'brush' || tool === 'eraser') {
                    let color = tool === 'eraser' ? [255, 255, 255, 255] : this.activeColor;
                    let context = this.getContext({color});
                    context.beginPath();
                    context.moveTo(x, y);
                    context.lineTo(x, y);
                    context.stroke();
                    finger.line = [[x, y]];
                    finger.context = context;
                } else if (tool === 'fill') {
                    this.fill3(x, y, this.activeColor);
                    UndoStack.saveState();
                }
            },
            moveTool(x, y, finger, tool = this.activeTool, emit = true) {
                if (tool === 'brush' || tool === 'eraser') {
                    if (emit)
                        this.$emit('toolUse', {
                            tool,
                            x: Math.floor(x), y: Math.floor(y),
                            state: 'move',
                            id: finger.id,
                        });
                    finger.line.push([x, y]);
                    finger.context.lineTo(x, y);
                    finger.context.stroke();
                } else if (tool === 'fill') {
                }
            },
            endTool(x, y, finger, tool = this.activeTool, emit = true) {
                if (tool === 'brush' || tool === 'eraser') {
                    if (emit)
                        this.$emit('toolUse', {
                            tool,
                            x: Math.floor(x), y: Math.floor(y),
                            state: 'end',
                            id: finger.id,
                        });
                    finger.line.push([x, y]);
                    finger.context.lineTo(x, y);
                    finger.context.stroke();
                    UndoStack.saveState();
                    // delete finger.context;
                    // delete finger.line;
                } else if (tool === 'fill') {
                }
            },
            getNeighbours(width, height, x, y, n8 = false, dist = 1) {
                let neighbours;
                if (n8) {
                    neighbours = [
                        [x - dist, y + 0],//left
                        [x + dist, y + 0],//right
                        [x + 0, y - dist],//top
                        [x + 0, y + dist],//bottom
                        [x - dist, y + dist],//bottom left
                        [x + dist, y + dist],//bottom right
                        [x + dist, y - dist],//top right
                        [x - dist, y - dist],//top left
                    ];

                } else {
                    neighbours = [
                        [x - dist, y + 0],//left
                        [x + dist, y + 0],//right
                        [x + 0, y - dist],//top
                        [x + 0, y + dist],//bottom
                    ];
                }
                return neighbours.filter(([nX, nY]) =>
                    !(nX === x && nY === y) &&
                    nX >= 0 && nX < width &&
                    nY >= 0 && nY < height
                );
            },
            colorEquals(colorA, colorB) {
                return colorA[0] === colorB[0] &&
                    colorA[1] === colorB[1] &&
                    colorA[2] === colorB[2] &&
                    colorA[3] === colorB[3];
            },
            colorDistance(colorA, colorB) {
                return Math.abs(colorA[0] - colorB[0]) +
                    Math.abs(colorA[1] - colorB[1]) +
                    Math.abs(colorA[2] - colorB[2]) +
                    Math.abs(colorA[3] - colorB[3]);
            },
            fill3(startX, startY, replacementColor = this.activeColor) {
                console.log("FILL THAT CANVAS", startX, startY, replacementColor);
                startX = Math.floor(startX);
                startY = Math.floor(startY);
                const canvasWidth = this.context.canvas.width;
                const canvasHeight = this.context.canvas.height;
                //Create duplicate canvas to draw on
                //This line causes problems
                let image = this.context.getImageData(0, 0, canvasWidth, canvasHeight);
                let fillImage = this.context.getImageData(0, 0, canvasWidth, canvasHeight);

                let pixelPos = (startY * canvasWidth + startX) * 4;
                let targetColor = image.data.slice(pixelPos, pixelPos + 4);

                if (this.colorEquals(targetColor, replacementColor)) {
                    return;
                }

                // "Inspired" by https://github.com/1j01/jspaint
                // https://github.com/1j01/jspaint/blob/1712cddd27ef3e0a2a611aae221303e9592c7d75/src/image-manipulation.js#L259
                const isTargetColor = i =>
                    // matches start color (i.e. region to fill)
                    image.data[i + 0] === targetColor[0] &&
                    image.data[i + 1] === targetColor[1] &&
                    image.data[i + 2] === targetColor[2] &&
                    image.data[i + 3] === targetColor[3];

                const cw4 = canvasWidth * 4;
                const fillPixel = i => {
                    let neighbours = [
                        i, //Also have center pixel in neighbours
                        i + cw4,//Down
                        i - cw4,//Up
                        i + 4,//Right
                        i - 4,//Left
                        i + cw4 + 4,//Down right
                        i - cw4 + 4,//Up right
                        i + cw4 - 4,//Down left
                        i - cw4 - 4,//Up left
                    ].filter(n =>
                        n < image.data.length &&
                        n >= 0
                    );
                    for (let n of neighbours) {
                        fillImage.data[n + 0] = replacementColor[0];
                        fillImage.data[n + 1] = replacementColor[1];
                        fillImage.data[n + 2] = replacementColor[2];
                        fillImage.data[n + 3] = replacementColor[3];
                    }

                    image.data[i + 0] = replacementColor[0];
                    image.data[i + 1] = replacementColor[1];
                    image.data[i + 2] = replacementColor[2];
                    image.data[i + 3] = replacementColor[3];
                };

                const stack = [[startX, startY]];

                while (stack.length > 0) {
                    let reachedLeft;
                    let reachedRight;
                    let [x, y] = stack.pop();

                    pixelPos = (y * canvasWidth + x) * 4;
                    while (isTargetColor(pixelPos)) {
                        y--;
                        pixelPos = (y * canvasWidth + x) * 4;
                    }
                    reachedLeft = false;
                    reachedRight = false;

                    while (true) {
                        y++;
                        pixelPos = (y * canvasWidth + x) * 4;

                        //If y is out of bounds or the pixel isn't the targetColor break this loop
                        if (!(y < canvasHeight && isTargetColor(pixelPos))) {
                            break;
                        }

                        fillPixel(pixelPos);


                        //Scan to our left
                        if (x > 0)
                            //Is pixel to the left target color
                            if (isTargetColor(pixelPos - 4)) {
                                if (!reachedLeft) {
                                    stack.push([x - 1, y]);
                                    reachedLeft = true;
                                }
                            } else if (reachedLeft)
                                reachedLeft = false;

                        //Scan to our right
                        if (x < canvasWidth - 1)
                            //Is pixel to the right target color
                            if (isTargetColor(pixelPos + 4)) {
                                if (!reachedRight) {
                                    stack.push([x + 1, y]);
                                    reachedRight = true;
                                }
                            } else if (reachedRight)
                                reachedRight = false;

                        //Go down one line
                        pixelPos += cw4;
                    }
                }
                this.context.putImageData(fillImage, 0, 0);
                // fillContext.putImageData(fillImage, 0, 0);
            },
            clearCanvas(emit = true) {
                if (emit)
                    this.$emit('toolUse', {
                        tool: 'clear',
                    });
                this.context.fillStyle = 'rgb(255,255,255)';
                this.context.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
                UndoStack.saveState();
                this.showColorPicker = false;
                console.log('Clear canvas', this.canvas.width, this.canvas.height);
            },
            resetCanvas() {
                this.context.fillStyle = 'white';
                console.log('Reset canvas', this.canvas.width, this.canvas.height);
                this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
                this.showColorPicker = false;
                this.selectColor(...this.colors[1][0]);
                UndoStack.reset(this.canvas);
                UndoStack.initializeIfNeeded();
            },
            selectColor(r, g, b, a = 255, updatePick = true, emit = true) {
                console.log("Select color", [r, g, b, a], updatePick, emit);
                this.activeColor = [r, g, b, a];
                if (emit)
                    this.$emit('toolUse', {
                        tool: 'color',
                        color: this.activeColor,
                    });
                if (updatePick) {
                    this.pickedColor = this.colorToPickColor(this.activeColor);
                    this.showColorPicker = false;
                }
                this.updateCursor(this.activeBrush, this.activeColor, this.activeTool);
            },
            selectTool(tool) {
                this.activeTool = tool;
                this.showColorPicker = false;
                this.updateCursor(this.activeBrush, this.activeColor, this.activeTool);
            },
            selectBrush(brushSize, emit = true) {
                this.activeBrush = brushSize;
                this.showColorPicker = false;
                this.updateCursor(this.activeBrush, this.activeColor, this.activeTool);
                if (emit)
                    this.$emit('toolUse', {
                        tool: 'brushSize',
                        brush: this.activeBrush,
                    });
            },
            updateCursor(brushSize, color, tool) {
                if (this.readOnly) {
                    this.$refs.canvas.style.cursor = `auto`;
                    return
                }
                if (tool === 'eraser')
                    color = [255, 255, 255, 255];
                if (tool === 'fill')
                    brushSize = 2;
                let canvas = document.createElement('canvas');
                let context = canvas.getContext('2d');
                let strokeWidth = 10;
                canvas.width = brushSize + strokeWidth * 2;
                canvas.height = brushSize + strokeWidth * 2;
                context.fillStyle = this.toRgb(...color);
                context.lineWidth = strokeWidth;
                context.arc(canvas.width / 2, canvas.height / 2, brushSize / 2, 0, 2 * Math.PI);
                context.strokeStyle = 'rgba(128,128,128,0.5)';
                context.stroke();
                context.fill();
                let url = canvas.toDataURL('image/png');
                this.$refs.canvas.style.cursor = `url(${url}) ${Math.floor(canvas.width / 2)} ${Math.floor(canvas.height / 2)}, auto`;
            },
            pickColor(x, y) {
                x = Math.floor(x);
                y = Math.floor(y);
                //Create duplicate canvas to draw on
                let image = this.context.getImageData(x, y, 1, 1);
                return image.data;
            },
            handleKey(e) {
                if (this.readOnly || !this.showControls) return;

                if (e.code === 'KeyZ' && e.ctrlKey && e.shiftKey) {
                    UndoStack.redo();
                    this.$emit('toolUse', {
                        tool: 'redo',
                    });
                } else if (e.code === 'KeyZ' && e.ctrlKey) {
                    UndoStack.undo();
                    this.$emit('toolUse', {
                        tool: 'undo',
                    });
                }
                // else if (e.code === 'KeyF')
                //     this.selectTool('fill');
                // else if (e.code === 'KeyE')
                //     this.selectTool('eraser');
                // else if (e.code === 'KeyB')
                //     this.selectTool('brush');
                // else if (e.code === 'Delete')
                //     this.clearCanvas()
            },
            startMove(e, fingerIndex = 0) {
                if (this.readOnly) return;
                if (e.altKey) {
                    return;
                }
                this.shouldPreventContext = true;

                if (!this.fingers[fingerIndex])
                    this.fingers[fingerIndex] = {};
                let finger = this.fingers[fingerIndex];
                finger.down = true;
                let {top, left} = this.$refs.canvas.getBoundingClientRect();
                let x = e.clientX - left;
                let y = e.clientY - top;
                let tool = e.button === 2 ? 'eraser' : this.activeTool;
                this.startTool(x, y, finger, tool, e.button === 2 ? this.activeBrush * 3 : this.activeBrush);
            },
            move(e, fingerIndex = 0) {
                if (this.readOnly) return;
                if (e.altKey) {
                    return;
                }

                if (this.fingers[fingerIndex] && this.fingers[fingerIndex].down) {
                    let {top, left} = this.$refs.canvas.getBoundingClientRect();
                    let x = e.clientX - left;
                    let y = e.clientY - top;
                    let tool = e.button === 2 ? 'eraser' : this.activeTool;
                    this.moveTool(x, y, this.fingers[fingerIndex], tool);
                }
            },
            endMove(e, fingerIndex = 0) {
                if (this.readOnly) return;
                setTimeout(() => {
                    this.shouldPreventContext = false;
                }, 50);
                if (e.altKey) {
                    let {top, left} = this.$refs.canvas.getBoundingClientRect();
                    let x = e.clientX - left;
                    let y = e.clientY - top;
                    this.selectColor(...this.pickColor(x, y));
                    return;
                }

                if (this.fingers[fingerIndex]) {
                    if (this.fingers[fingerIndex].down) {
                        let {top, left} = this.$refs.canvas.getBoundingClientRect();
                        let x = e.clientX - left;
                        let y = e.clientY - top;
                        let tool = e.button === 2 ? 'eraser' : this.activeTool;
                        this.endTool(x, y, this.fingers[fingerIndex], tool);
                    }
                    this.fingers[fingerIndex].down = false;
                }
            },
            startTouch(e) {
                if (this.readOnly) return;

                for (let touch of e.touches)
                    this.startMove(touch, touch.identifier)
            },
            moveTouch(e) {
                if (this.readOnly) return;

                for (let touch of e.touches)
                    this.move(touch, touch.identifier)
            },
            endTouch(e) {
                if (this.readOnly) return;

                for (let touch of e.changedTouches)
                    this.endMove(touch, touch.identifier)
            },
            canvasResize() {
                let canvas = this.$refs.canvas;
                let image;
                let keepContents = canvas.width > 0 && canvas.height > 0;
                if (keepContents)
                    image = this.context.getImageData(0, 0, canvas.width, canvas.height);
                let {width, height} = canvas.getBoundingClientRect();
                canvas.width = width;
                canvas.height = height;
                console.log('Clear canvas', this.canvas.width, this.canvas.height);
                this.canvasWidth = width;
                this.canvasHeight = height;
                if (keepContents)
                    this.context.putImageData(image, 0, 0);
                if (!keepContents) {
                    this.resetCanvas();
                }
                // UndoStack.resizeCanvas(this.canvas);
                // UndoStack.initializeIfNeeded();
            },
            toRgb(r, g, b, a) {
                return `rgba(${r},${g},${b},${a / 255})`
            }
        },
        watch: {
            readOnly() {
                this.updateCursor(this.activeBrush, this.activeColor, this.activeTool);
            },
            updateCanvas() {
                this.canvasResize();
            },
            brushSize() {
                this.activeBrush = this.brushSize;
            },
            activeColor(val, old) {
                if (!this.colorEquals(val, old))
                    this.$emit('colorChange', this.activeColor);
            },
            pickedColor() {
                let newColor = [...this.pickColorToColor(this.pickedColor)];
                if (isNaN(newColor[3]) || newColor[3] === 0)
                    newColor[3] = 255;
                if (!this.colorEquals(this.activeColor, newColor))
                    this.selectColor(...newColor, false);
            },
        },
        computed: {
            activeRgb() {
                return this.toRgb(...this.activeColor);
            }
        }
    }
</script>

<style scoped>
    .simple-draw {
        /*min-width: 610px;*/
    }

    .canvas {
        width: 100%;
        height: 100%;
        max-height: 500px;
        background-color: gray;
    }

    .canvas-container {
        background-color: white;
        width: 100%;
        height: calc(100% - 80px);
    }

    .controls {
        padding: 10px;
        display: flex;
        justify-content: space-between;
        /*background-color:rgba(0,0,0,0.3)*/
    }

    .colors {
        display: flex;
    }

    .selected-color {
        height: 50px;
        width: 50px;
        border-radius: 11px;
        margin: 5px 0;
        cursor: pointer;
    }

    .color-picker {
        position: absolute;
        margin-bottom: 40px;
        margin-left: 40px;
        z-index: 5;
    }

    .color-grid {
        display: flex;
        flex-direction: column;
        margin: 5px 10px;
    }

    .color-row {
        display: flex;
    }

    .single-color {
        width: 21px;
        height: 21px;
        border-radius: 50%;
        margin: 2px;
        cursor: pointer;
    }


    .tools {
        display: flex;
        margin-right: 10px;
    }

    .tools > div {
        margin: 10px 5px;
        height: 40px;
        width: 40px;
        background-size: cover;
        background-repeat: no-repeat;
        background-position: center;
        border-radius: 50%;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    .tools > div:hover {
        background-color: rgba(255, 255, 255, 0.3);
    }

    .tools > div:active {
        box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.5);
    }

    .tools > div[active="true"] {
        box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.7);
    }

    .brush {
        background-image: url(../assets/brush.png);
    }

    .fill {
        background-image: url(../assets/fill.png);
    }

    .erase {
        background-image: url(../assets/eraser.png);
    }

    .brush-sizes {
        display: flex;
    }

    .brush-sizes > div {
        margin: 5px;
        border-radius: 50%;
        cursor: pointer;
    }

    .brush-sizes > div[active="true"] {
        box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.7);
    }

    .clear-canvas {
        margin: 5px;
        height: 50px;
        width: 50px;
        background-size: cover;
        background-repeat: no-repeat;
        background-position: center;
        border-radius: 50%;
        cursor: pointer;
        transition: background-color 0.2s;
        background-image: url(../assets/trash.png);
    }

    .clear-canvas:hover {
        background-color: rgba(255, 255, 255, 0.3);
    }

    .clear-canvas:active {
        background-color: maroon;
    }
</style>
