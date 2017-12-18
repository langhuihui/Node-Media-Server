//
//  Created by Mingliang Chen on 17/8/1.
//  illuspas[a]gmail.com
//  Copyright (c) 2017 Nodemedia. All rights reserved.
//

const Fs = require('fs');
const Http = require('http');
const WebSocket = require('ws');
const Koa = require('koa');
const NodeCoreUtils = require('./core_utils');
const NodeHttpSession = require('./http_session');

class NodeHttpServer {
    constructor(config, sessions, publishers, idlePlayers) {
        this.port = config.http.port;
        this.config = config;
        this.sessions = sessions;
        this.publishers = publishers;
        this.idlePlayers = idlePlayers;

        this.koa = new Koa();
        this.koa.use(require('./monitor')(this))
        this.koa.use(({ req, res }, next) => {
            if (req.method === 'OPTIONS') {
                res.setHeader('Access-Control-Allow-Origin', this.config.http.allow_origin);
                res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
                res.setHeader('Access-Control-Allow-Headers', 'range');
                res.end();
            } else {
                if (Fs.existsSync(__dirname + '/public' + req.url)) {
                    res.setHeader('Content-Type', 'video/x-flv');
                    res.setHeader('Access-Control-Allow-Origin', this.config.http.allow_origin);
                    next();
                } else {
                    this.onConnect(req, res);
                }
            }
        });
        this.koa.use(require('koa-static')(__dirname + '/public'))
        this.httpServer = Http.createServer(this.koa.callback());
        if (this.config.https) {
            let options = {
                key: Fs.readFileSync(this.config.https.key),
                cert: Fs.readFileSync(this.config.https.cert)
            };
            this.sport = config.https.port ? config.https.port : 443;
            this.httpsServer = Https.createServer(options, this.expressApp);
        }
    }

    run() {
        this.httpServer.listen(this.port, () => {
            console.log(`Node Media Http Server started on port: ${this.port}`);
        });

        this.httpServer.on('error', (e) => {
            console.error(`Node Media Http Server ${e}`);
        });

        this.wsServer = new WebSocket.Server({ server: this.httpServer });

        this.wsServer.on('connection', (ws, req) => {
            this.onConnect(req, ws);
        });

        this.wsServer.on('listening', () => {
            console.log(`Node Media WebSocket Server started on port: ${this.port}`);
        });
        this.wsServer.on('error', (e) => {
            console.error(`Node Media WebSocket Server ${e}`);
        });
        if (this.httpsServer) {
            this.httpsServer.listen(this.sport, () => {
                console.log(`Node Media Https Server started on port: ${this.sport}`);
            });

            this.httpsServer.on('error', (e) => {
                console.error(`Node Media Https Server ${e}`);
            });

            this.wssServer = new WebSocket.Server({ server: this.httpsServer });

            this.wssServer.on('connection', (ws, req) => {
                req.nmsConnectionType = 'ws';
                this.onConnect(req, ws);
            });

            this.wssServer.on('listening', () => {
                console.log(`Node Media WebSocketSecure Server started on port: ${this.sport}`);
            });
            this.wssServer.on('error', (e) => {
                console.error(`Node Media WebSocketSecure Server ${e}`);
            });
        }
    }

    onConnect(req, res) {
        let id = NodeCoreUtils.generateNewSessionID(this.sessions);
        let session = new NodeHttpSession(this.config, req, res);
        this.sessions.set(id, session);
        session.id = id;
        session.sessions = this.sessions;
        session.publishers = this.publishers;
        session.idlePlayers = this.idlePlayers;
        session.run();
    }
}

module.exports = NodeHttpServer