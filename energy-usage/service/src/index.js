const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const data = require('./data/data');
const meterRoutes = require('./routes/meterRoutes');
const server = new Koa();
const PORT = process.env.PORT || 3000;

if (!module.parent) {
    data.initialize();
}

server.use(bodyParser());
server.use(meterRoutes.routes());

module.exports = server.listen(PORT, () => {
    console.log(`server listening on port ${PORT}`);
});


