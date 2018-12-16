const EventEmitter = require('events');
class NetStream extends EventEmitter {
    constructor(nc) {
        super()
        this.nc = nc
    }
    async createStream() {
        if (this.streamId) return this.streamId
        return new Promise((resolve, reject) => {
            this.nc.rtmpSendCreateStream(streamId => {
                this.nc.streams[streamId] = this
                console.log('got stream id ', streamId)
                this.streamId = streamId
                resolve(streamId)
            });
        })
    }
    async play(streamName) {
        await this.createStream()
        this.streamName = streamName
        this.nc.sendInvokeMessage(this.streamId, {
            cmd: 'play',
            transId: 0,
            cmdObj: null,
            streamName,
            start: -2,
            duration: -1,
            reset: 1
        });
        this.nc.rtmpSendSetBufferLength(this.streamId, 1000);
    }
    async publish(streamName) {
        await this.createStream()
        this.isPublish = streamName
        this.nc.sendInvokeMessage(this.streamId, {
            cmd: 'FCPublish',
            transId: 0,
            cmdObj: null,
            streamName,
        });
        this.nc.sendInvokeMessage(this.streamId, {
            cmd: 'publish',
            transId: 0,
            cmdObj: null,
            streamName,
            type: 'live'
        });
        this.nc.rtmpSendSetChunkSize();
    }
    stop() {
        if (this.isPublish) {
            this.nc.sendInvokeMessage(this.streamId, {
                cmd: 'FCUnpublish',
                transId: 0,
                cmdObj: null,
                streamName: this.isPublish,
            });
        }
        this.nc.sendInvokeMessage(this.streamId, {
            cmd: 'deleteStream',
            transId: 0,
            cmdObj: null,
            streamId: this.streamId
        });
        delete this.nc.streams[this.streamId]
        this.streamId = 0
    }
}
module.exports = NetStream;