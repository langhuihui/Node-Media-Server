const NodeMediaServer = require('./media_server')

const config = {
    rtmp: {
        port: 1935,
        chunk_size: 60000,
        gop_cache: true,
        ping: 60,
        ping_timeout: 30
    },
    http: {
        port: 8000,
        allow_origin: '*'
    },
    // https: {
    //     port: 8443,
    //     key: './privatekey.pem',
    //     cert: './certificate.pem',
    // },
    auth: {
        play: false,
        publish: false,
        secret: 'nodemedia2017privatekey'
    }
}

var nms = new NodeMediaServer(config)
nms.run()