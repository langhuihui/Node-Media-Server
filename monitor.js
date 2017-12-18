const Router = require('koa-router')
module.exports = server => {
    const router = new Router()
    router.get('/streams', ctx => {
        ctx.body = server
    })
    return router.routes()
}