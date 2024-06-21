class Network {
    constructor(roomId, socket) {
        this.peer = new Peer(undefined, {
            host: 'localhost',
            port: 3001,
        });
        this.socket = socket;
        this.roomId = roomId;
        this.connections = {};
        this.otherBalls = {};
        this.otherBullets = [];
        this.otherSticks = [];

        this.peer.on('open', (id) => {
            this.socket.emit('join-room', this.roomId, id);
        });

        this.socket.on('userConnected', (userId) => {
            this.connectToNewUser(userId);
        })

        this.peer.on('connection', (conn) => {
            this.connections[conn.peer] = conn;

            conn.on('data', (data) => {
                this.handleData(data);
            });

            conn.on('close', () => {
                delete this.connections[conn.peer];
                delete this.otherBalls[conn.peer];
            });
        });
    }

    connectToNewUser(userId) {
        const conn = this.peer.connect(userId);
        this.connections[userId] = conn;

        conn.on('open', () => {
            conn.on('data', (data) => {
                this.handleData(data);
            });
        });
    }

    handleData(data) {
        switch (data.type) {
            case 'ballPosition':
                this.otherBalls[data.userId] = data.data;
                break;
            case 'bulletPosition':
                this.otherBullets.push(data.data);
                break;
        case 'stickPosition':
            const stickData = data.data;
            stickData.currentAngle = stickData.angle; // Add the currentAngle property
            this.otherSticks.push(stickData);
            break;
            case 'removeBullet':
                this.otherBullets = this.otherBullets.filter((bullet) => bullet.id !== data.data.id);
                break;
        }
    }

    sendData(type, data, userId) {
        const message = { type, data };
        if (userId) {
            this.connections[userId].send(message);
        } else {
            Object.keys(this.connections).forEach((userId) => {
                this.connections[userId].send(message);
            });
        }
    }

    getData(type) {
        switch (type) {
            case 'otherBalls':
                return this.otherBalls;
            case 'otherBullets':
                return this.otherBullets;
            case 'otherSticks':
                return this.otherSticks;
            default:
                return null;
        }
    }
}

export default Network;
