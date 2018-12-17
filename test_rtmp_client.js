const NodeRtmpClient = require('./node_rtmp_client');
const NetStream = require('./NetStream')
var convert = require('xml-js');
var got = require('got')
let nc = new NodeRtmpClient({
  // pageUrl: 'https://rs5s9.maxbet.com/Streaming/Schedule',
  // swfUrl: 'https://rs5s9.maxbet.com/template/_global/common/Images/flashplayer_v4.swf?v201812148888'
});
nc.client = {
  onBWDone() {

  }
}
got.get('https://streamaccess.unas.tv/flash/31/1415788.xml?streamid=1415788&partnerid=31&timestamp=20181217131326&auth=5bc3f228c1bc3341c418c48a646323a4').then(res => {
  const x = convert.xml2js(res.body)
  const { auth, url, stream, aifp } = x.elements[0].elements[0].attributes
  nc.connect(`rtmp://${url}`)
  nc.on('status', info => {
    console.log(info)
    if (info.code == 'NetConnection.Connect.Success') {
      let ns = new NetStream(nc)
      ns.play(stream + `?auth=${auth}&aifp=${aifp}`)
      ns.on('video', console.log)
    }
  })
})

