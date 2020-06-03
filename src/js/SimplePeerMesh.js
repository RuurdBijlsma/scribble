import Peer from 'simple-peer'
import socketIo from 'socket.io-client'
import EventEmitter from 'events';

export default class SimplePeerMesh extends EventEmitter {
    constructor(appName, trickle = true, wrtc = false) {
        super();
        this.wrtc = wrtc;
        this.appName = appName;
        this.trickle = trickle;
        this.socket = null;
        this.url = '';
        this.peers = {};
        this.printDebug = false;
        this.roomCount = -1;
        this.room = '';
        this.socketId = '';
        this.broadcastedStream = null;
    }

    static async getServerRooms(url) {
        if (url[url.length - 1] !== '/')
            url += '/';

        try {
            let response = await fetch(url + 'rooms');
            return await response.json()
        } catch (e) {
            return null
        }
    }

    join(room, hidden = false) {
        this.room = room;
        // Waiting for this promise is dangerous, room count might be incorrect on the server due to bad disconnect
        return new Promise(resolve => {
            this.socket.emit('join', room, this.appName, hidden);
            let roomCountEventCallback;
            roomCountEventCallback = () => {
                this.off('roomCount', roomCountEventCallback);

                if (this.roomCount === 1)  // Alone in the room
                    resolve();
                else // Wait until all peer connections are complete
                    this.once('fullConnect', () => resolve());
            };
            this.on('roomCount', roomCountEventCallback)
        })
    }

    // On node/electron webSocketOnly might be necessary
    connect(url, webSocketOnly = false) {
        return new Promise((resolve, reject) => {
            this.url = url;
            let transports = ['websocket'];
            if (!webSocketOnly) {
                transports.push('polling')
            }

            this.socket = socketIo(url, {transports});

            this.socket.on('roomCount', roomCount => {
                this.roomCount = roomCount;
                this.log('New room count: ' + roomCount + ' users');
                this.emit('roomCount', roomCount);
                this.checkFullConnect()
            });

            this.socket.on('connect', () => {
                resolve(this.socket);
                this.log('Connected to socket server')
            });

            this.socket.on('connect_error', e => {
                this.log('Error connecting to socket server', e);
                reject(e)
            });

            this.socket.on('socketId', mySocketId => {
                this.log(`My socket id = ${mySocketId}`);
                this.emit('socketId', mySocketId);
                this.socketId = mySocketId;
            });

            this.socket.on('initialize', socketId => {
                this.log('Initializing with ', socketId);
                this.peers[socketId] = this.createPeer(socketId, true)
            });

            this.socket.on('destroy', socketId => {
                if (this.peers.hasOwnProperty(socketId)) {
                    try {
                        this.peers[socketId].destroy();
                    } catch (e) {
                        //ignored, peer might already be destroyed error
                    }
                    delete this.peers[socketId];
                    this.emit('disconnect', socketId);
                    this.log('Destroying peer', socketId, 'peer count:', this.getConnectedPeerCount())
                } else {
                    this.log('Unable to destroy peer, it does not exist')
                }
            });
            this.socket.on('signal', ([socketId, signal]) => {
                this.log('Receiving signal from ', socketId);

                if (!this.peers.hasOwnProperty(socketId)) {
                    this.log(`${socketId} is initializing with me`);
                    this.peers[socketId] = this.createPeer(socketId, false)
                }

                this.log(`Signalling ${socketId}`, signal);
                this.peers[socketId].signal(signal)
            })
        })
    }

    broadcast(message) {
        this.log(`Broadcasting to ${this.getConnectedPeerCount()} peers: ${message}`);
        for (let peer in this.peers)
            if (this.peers.hasOwnProperty(peer) && this.peers[peer] !== null) {
                console.log('broadcasting ', message);
                if (typeof message === 'string')
                    this.peers[peer].send(message);
                else
                    this.peers[peer].send(JSON.stringify(message));
            }
    }

    send(id, message) {
        this.log(`Sending to ${id}: ${message}`);

        if (this.peers.hasOwnProperty(id) && this.peers[id] !== null) {
            console.log('broadcasting ', message);
            if (typeof message === 'string')
                this.peers[id].send(message);
            else
                this.peers[id].send(JSON.stringify(message));
        }
    }

    broadcastStream(stream) {
        this.broadcastedStream = stream;
        this.log(`Broadcasting stream to ${this.getConnectedPeerCount()} peers: ${stream}`);
        for (let peer in this.peers) {
            if (this.peers.hasOwnProperty(peer)) {
                if (this.peers[peer] !== null) {
                    this.peers[peer].addStream(stream)
                }
            }
        }
    }

    sendStream(id, stream) {
        this.log(`Sending stream to ${id}: ${stream}`);
        if (this.peers.hasOwnProperty(id && this.peers[id] !== null))
            this.peers[id].addStream(stream);
    }

    removeStream(id, stream) {
        this.log(`Removing stream to ${id}: ${stream}`);
        if (this.peers.hasOwnProperty(id && this.peers[id] !== null))
            this.peers[id].removeStream(stream);
    }

    broadcastRemoveStream(stream) {
        this.broadcastedStream = null;
        this.log(`broadcastRemoveStream to ${this.getConnectedPeerCount()} peers: ${stream}`);
        for (let peer in this.peers)
            if (this.peers.hasOwnProperty(peer) && this.peers[peer] !== null)
                this.peers[peer].removeStream(stream);
    }

    createPeer(socketId, initiator) {
        let options = {initiator, trickle: this.trickle};
        if (this.wrtc) {
            options.wrtc = this.wrtc;
            this.log('Using wrtc', options)
        }
        if (this.broadcastedStream !== null) {
            options.stream = this.broadcastedStream;
            console.log("Appending my stream to the new peer!");
        }
        let peer = new Peer(options);
        peer.on('error', err => {
            console.warn(err);
            this.emit('error', peer, socketId, {peer, error: err, initiator});
            this.log('error', err)
        });

        peer.on('signal', data => {
            this.log(`Emitting signal to socket: ${socketId}`);
            // if (data.renegotiate) {
            //     this.peers[socketId].destroy();
            //     delete this.peers[socketId]
            // }
            this.socket.emit('message', [socketId, 'signal', data])
        });

        peer.on('connect', () => {
            let peerCount = this.getConnectedPeerCount();
            this.log('New peer connection, peer count: ', peerCount);
            // console.log(peer, 'connect');
            this.emit('connect', socketId);
            this.checkFullConnect();
        });

        peer.on('data', data => {
            this.emit('data', socketId, data);
            this.log('data: ' + data)
        });

        peer.on('stream', stream => {
            console.log("Stream received!");
            this.emit('stream', socketId, stream);
            this.log('stream: ', stream)
        });

        peer.on('track', (track, stream) => {
            this.emit('track', track, socketId, stream);
            this.log('track: ', track, 'stream', stream)
        });

        peer.on('close', () => this.log('Peer connection closed', peer));

        return peer
    }

    getConnectedPeerCount() {
        let count = 0;
        for (let peer in this.peers) {
            if (this.peers.hasOwnProperty(peer)) {
                if (this.peers[peer].connected) count++
            }
        }
        return count
    }

    checkFullConnect() {
        let peerCount = this.getConnectedPeerCount();
        if (peerCount + 1 >= this.roomCount) {
            this.log('Fully connected to room, peer count: ', peerCount, 'room count: ', this.roomCount);
            this.emit('fullConnect')
        }
    }

    destroy() {
        this.removeAllListeners();
        this.socket.close();
        for (let peer in this.peers)
            if (this.peers.hasOwnProperty(peer)) {
                try {
                    this.peers[peer].destroy();
                } catch (e) {
                    //ignored, peer might already be destroyed error
                }
                delete this.peers[peer];
            }
    }

    log(...msg) {
        if (this.printDebug) {
            console.log(...msg)
        }
    }
}