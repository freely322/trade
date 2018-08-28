const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const _ = require('lodash');
const path = require('path');
const hbs = require('hbs');
const cookieParser = require('cookie-parser');
const index = require('./routes/index');
const admin = require('./routes/admin');
const mongoDB = require('./config/db');

const mongoose = require('mongoose');
mongoose.connect(mongoDB.url);

const db = mongoose.connection;
db.on('error', err => {
    console.log(`Troubles with connection: ${err}`)
})
db.once('open', () => {
    console.log('Connected to DB')
})

hbs.registerPartials(__dirname + "/views/partials");
hbs.registerHelper('raw-helper', function(options){
	return options.fn();
});

const port = process.env.PORT || 3000;

app.set('view enigne', 'hbs');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/admin/', admin);

app.use(function(req, res, next){
    res.status(404);   
    // respond with json
    if (req.accepts('json')) {
      res.send({ error: 'Page is not found' });
      return;
    }
    // default to plain-text. send()
    res.type('txt').send('Not found');
  });

const SocketServer = require('ws').Server;

const server = app.listen(port, () => {
    console.log(`Server running on port ${port}!`);
});

const wss = new SocketServer({server});
wsctrl = require("./routes/webcontroller");
wss.on('connection', (ws) => {

    ws.on('message', (message) => {
        console.log('received: %s', message);
        message = JSON.parse(message);

        wsctrl(ws, message["userid"], message["acounts"], message["symbol"], message["body"]);
    });
});
