const NodeRtmpClient = require('./node_rtmp_client');
const NetStream = require('./NetStream')
let nc = new NodeRtmpClient({

});
nc.connect('rtmp://localhost/live')
nc.on('status', info => {
  console.log(info)
  if (info.code == 'NetConnection.Connect.Success') {
    let ns = new NetStream(nc)
    ns.play('stream')
    ns.on('video', console.log)
  }
})