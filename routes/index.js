var express = require('express');
var router = express.Router();
const _ = require('lodash');
const path = require('path');
const request = require('request');
const fetch = require('node-fetch');
const BFX = require('bitfinex-api-node');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/user.js');
const Apis = require('../models/apis.js');
const JWT_KEY = require('../config/configs.json')
const chechAuth = require('../middleware/check-auth');

router.get('/', (req, res)=> {
    res.render('top.hbs');
} );

router.get('/home', chechAuth, (req, res)=> {
    res.render('home.hbs');
} );

router.get('/profile', chechAuth, (req, res)=> {
    res.render('s3.hbs');
} );

router.get('/login', (req, res)=> {
    res.render('index.hbs');
} );

router.get('/logout', (req, res) => {
    res.redirect('/');
});

router.post('/registerrequest', (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    let email = req.body.email;
    if(username && password && email) {
        let userData = {
            username,
            password,
            email
        };
        let user = new User(userData);
        user.save().then(doc => {
            if(!doc) res.status(400).send('Bad request');

            res.redirect('/login');
        }).catch(e => {
            res.status(400).send(e);
        });
    } else {
        res.status(400).send('Bad request');
    }
});


router.post('/loginrequest', (req, res) => {   
    let username = req.body.username;
    let password = req.body.password;
    
    User.authenticate(username, password, (err, user) => {
        if(!user) {
            res.status(401).send('Not authenticated');
        }
        try {
            const token = jwt.sign(
                {
                    email: user.email,
                    userId: user._id
                },
                JWT_KEY.JWT_KEY, 
                {
                    expiresIn: "1h"
                }
            )

            res.cookie('auth', token);
            res.redirect('/home');
        } catch (err) {
            console.log(`Error on auth: ${err}`)
        }
    });
    
});



router.post('/createprofile', chechAuth, async (req, res) => {
    if (req.body.name &&
        req.body.tag &&
        req.body.type &&
        req.body.secret &&
        req.body.key) {
    try {
        const {user_data: { userId } = {}} = req;
        const UserObj = await User.findOne({_id:userId})
    if (_.isNull(UserObj)) {
        throw Error('user not found')
    } 
    const apisObj = await Apis.create({
        name: req.body.name,
        tag: req.body.tag,
        type: req.body.type,
        secret: req.body.secret,
        key: req.body.key,
        userid: UserObj._id
    })
        const userFromApi = await Apis.findById(apisObj._id).populate({path:'userid', model: 'User'});
        res.redirect('/home');

    } catch (err) {
        console.error(`Error on submit:${err}`)
    }
} else {
        res.status(400).json({
        message: 'Bad request'
        })
    }
})

router.get('/getId', chechAuth, async (req, res) => {
    try {
        const {user_data: { userId } = {}} = req;
        const UserObj = await User.findOne({_id:userId})
        if (_.isNull(UserObj)) {
            throw Error('user not found')
        }
        res.status(200).json({
            message: UserObj._id
        });

    } catch (err) {
        console.error(`Error on getting accounts:${err}`)
    }
})

router.get('/accounts', chechAuth, async (req, res) => {
    try {
        const {user_data: { userId } = {}} = req;
        const UserObj = await User.findOne({_id:userId})
        if (_.isNull(UserObj)) {
            throw Error('user not found')
        }
        
        const userAccounts = await Apis.find({userid: UserObj._id});
        res.status(200).json({
            message: userAccounts
        });

    } catch (err) {
        console.error(`Error on getting accounts:${err}`)
    }
})

router.post('/symbol', async (req, res) => {
    const symbol = req.body.symb;
    
    await fetch(`https://api.bitfinex.com/v1/pubticker/${symbol}`)
    .then((response) => {
        return response.json();
    })
    .then((json) => {
        res.send(json);
    })
    .catch(err => console.log(err));
})

router.post('/getDamnMoney', chechAuth, async (req, res) => {
    try {
        let user = req.body;

        if (user && user.secret && user.key) {
            const apiSecret = user.secret;
            const apiKey = user.key;

            const bfxRest = new BFX({apiKey: apiKey, apiSecret: apiSecret}).rest(1);
            bfxRest.wallet_balances((err, result) => {
                if (err) console.log(err);
                res.send(result);
            })
        }

    } catch(err) {
        console.error(err);
    }
})



router.post('/api/acounts/getSymbol', (req, res) => {
    switch(tag){
        case 'bitfinex':
            res.send(
                [{"symbol":"BTCUSD","description":"Bitcoin / Dollar","type":"bitcoin","exchange":"BITFINEX"}
                ,{"symbol":"ETHUSD","description":"Ethereum / Dollar","type":"bitcoin","exchange":"BITFINEX"}
                ,{"symbol":"XRPUSD","description":"Ripple / Dollar","type":"bitcoin","exchange":"BITFINEX"}
                ,{"symbol":"LTCUSD","description":"Litecoin / Dollar","type":"bitcoin","exchange":"BITFINEX"}
                ,{"symbol":"BCHUSD","description":"BCH / Dollar","type":"bitcoin","exchange":"BITFINEX"}
                ,{"symbol":"NEOUSD","description":"NEO / Dollar","type":"bitcoin","exchange":"BITFINEX"},
                {"symbol":"EOSUSD","description":"EOS / Dollar","type":"bitcoin","exchange":"BITFINEX"},
                {"symbol":"IOTUSD","description":"IOTA / Dollar","type":"bitcoin","exchange":"BITFINEX"},
                {"symbol":"ETCUSD","description":"Ethereum Classic / Dollar","type":"bitcoin","exchange":"BITFINEX"},
                {"symbol":"OMGUSD","description":"OmiseGo / Dollar","type":"bitcoin","exchange":"BITFINEX"},
                {"symbol":"ETHBTC","description":"Ethereum / Bitcoin","type":"bitcoin","exchange":"BITFINEX"},
                {"symbol":"BTCUSDSHORTS","description":"BTCUSD Shorts","type":"bitcoin","exchange":"BITFINEX"},
                {"symbol":"XMRUSD","description":"Monero / Dollar","type":"bitcoin","exchange":"BITFINEX"},
                {"symbol":"ETCBTC","description":"Ethereum Classic / Bitcoin","type":"bitcoin","exchange":"BITFINEX"},
                {"symbol":"EOSBTC","description":"EOS / Bitcoin","type":"bitcoin","exchange":"BITFINEX"},
                {"symbol":"BTCUSDLONGS","description":"BTCUSD Longs","type":"bitcoin","exchange":"BITFINEX"},
                {"symbol":"BCHBTC","description":"BCH / Bitcoin","type":"bitcoin","exchange":"BITFINEX"},
                {"symbol":"XRPBTC","description":"Ripple / Bitcoin","type":"bitcoin","exchange":"BITFINEX"},
                {"symbol":"NEOBTC","description":"NEO / Bitcoin","type":"bitcoin","exchange":"BITFINEX"},
                {"symbol":"BTGUSD","description":"BTG / Dollar","type":"bitcoin","exchange":"BITFINEX"},
                {"symbol":"ZECUSD","description":"Zcash / Dollar","type":"bitcoin","exchange":"BITFINEX"},
                {"symbol":"LTCBTC","description":"Litecoin / Bitcoin","type":"bitcoin","exchange":"BITFINEX"},
                {"symbol":"TRXUSD","description":"TRX / Dollar","type":"bitcoin","exchange":"BITFINEX"},
                {"symbol":"IOTBTC","description":"IOTA / Bitcoin","type":"bitcoin","exchange":"BITFINEX"},
                {"symbol":"OMGBTC","description":"OmiseGo / Bitcoin","type":"bitcoin","exchange":"BITFINEX"},
                {"symbol":"DSHUSD","description":"Dashcoin / Dollar","type":"bitcoin","exchange":"BITFINEX"},
                {"symbol":"TRXBTC","description":"TRX / Bitcoin","type":"bitcoin","exchange":"BITFINEX"},
                {"symbol":"XMRBTC","description":"Monero / Bitcoin","type":"bitcoin","exchange":"BITFINEX"},
                {"symbol":"SANUSD","description":"Santiment / Dollar","type":"bitcoin","exchange":"BITFINEX"},
                {"symbol":"ETPUSD","description":"ETP / Dollar","type":"bitcoin","exchange":"BITFINEX"},
                {"symbol":"ZECBTC","description":"Zcash / Bitcoin","type":"bitcoin","exchange":"BITFINEX"},
                {"symbol":"BTGBTC","description":"BTG / Bitcoin","type":"bitcoin","exchange":"BITFINEX"},
                {"symbol":"SNTUSD","description":"SNT / Dollar","type":"bitcoin","exchange":"BITFINEX"},
                {"symbol":"QTMUSD","description":"QTM / Dollar","type":"bitcoin","exchange":"BITFINEX"},
                {"symbol":"ZRXUSD","description":"ZRX / Dollar","type":"bitcoin","exchange":"BITFINEX"},
                {"symbol":"QSHUSD","description":"QSH / Dollar","type":"bitcoin","exchange":"BITFINEX"},
                {"symbol":"GNTUSD","description":"GNT / Dollar","type":"bitcoin","exchange":"BITFINEX"},
                {"symbol":"FUNUSD","description":"FUN / Dollar","type":"bitcoin","exchange":"BITFINEX"},
                {"symbol":"BTCEUR","description":"Bitcoin / EUR","type":"bitcoin","exchange":"BITFINEX"},
                {"symbol":"DATUSD","description":"DAT / Dollar","type":"bitcoin","exchange":"BITFINEX"},
                {"symbol":"EDOUSD","description":"EDO / Dollar","type":"bitcoin","exchange":"BITFINEX"},
                {"symbol":"ZRXBTC","description":"ZRX / Bitcoin","type":"bitcoin","exchange":"BITFINEX"},
                {"symbol":"YYWUSD","description":"YYW / Dollar","type":"bitcoin","exchange":"BITFINEX"},
                {"symbol":"EOSETH","description":"EOS / Ethereum","type":"bitcoin","exchange":"BITFINEX"},
                {"symbol":"NEOETH","description":"NEO / Ethereum","type":"bitcoin","exchange":"BITFINEX"},
                {"symbol":"BATUSD","description":"BAT / Dollar","type":"bitcoin","exchange":"BITFINEX"},
                {"symbol":"TNBUSD","description":"TNB / Dollar","type":"bitcoin","exchange":"BITFINEX"},
                {"symbol":"QSHBTC","description":"QSH / Bitcoin","type":"bitcoin","exchange":"BITFINEX"},
                {"symbol":"EDOBTC","description":"EDO / Bitcoin","type":"bitcoin","exchange":"BITFINEX"},
                {"symbol":"SNTBTC","description":"SNT / Bitcoin","type":"bitcoin","exchange":"BITFINEX"}]
            );
        break;
        case 'poloniex':
            res.send([{"symbol":"BTCUSDT","description":"Bitcoin / Tether USD","type":"bitcoin","exchange":"POLONIEX"},
            {"symbol":"XRPUSDT","description":"Ripple / Tether USD","type":"bitcoin","exchange":"POLONIEX"},
            {"symbol":"ETHUSDT","description":"Ethereum / Tether USD","type":"bitcoin","exchange":"POLONIEX"},
            {"symbol":"XRPBTC","description":"Ripple / Bitcoin","type":"bitcoin","exchange":"POLONIEX"},
            {"symbol":"STRBTC","description":"Stellar / Bitcoin","type":"bitcoin","exchange":"POLONIEX"},
            {"symbol":"ETHBTC","description":"Ethereum / Bitcoin","type":"bitcoin","exchange":"POLONIEX"},
            {"symbol":"BTSBTC","description":"BitShares / Bitcoin","type":"bitcoin","exchange":"POLONIEX"},
            {"symbol":"STRUSDT","description":"Stellar / Tether USD","type":"bitcoin","exchange":"POLONIEX"},
            {"symbol":"SCBTC","description":"Siacoin / Bitcoin","type":"bitcoin","exchange":"POLONIEX"},
            {"symbol":"ETCBTC","description":"Ethereum Classic / Bitcoin","type":"bitcoin","exchange":"POLONIEX"},
            {"symbol":"ETCUSDT","description":"Ethereum Classic / Tether USD","type":"bitcoin","exchange":"POLONIEX"},
            {"symbol":"LTCUSDT","description":"Litecoin / Tether USD","type":"bitcoin","exchange":"POLONIEX"},
            {"symbol":"LTCBTC","description":"Litecoin / Bitcoin","type":"bitcoin","exchange":"POLONIEX"},
            {"symbol":"DGBBTC","description":"DigiByte / Bitcoin","type":"bitcoin","exchange":"POLONIEX"},
            {"symbol":"XEMBTC","description":"NEM / Bitcoin","type":"bitcoin","exchange":"POLONIEX"},
            {"symbol":"STRATBTC","description":"Stratis / Bitcoin","type":"bitcoin","exchange":"POLONIEX"},
            {"symbol":"DOGEBTC","description":"Dogecoin / Bitcoin","type":"bitcoin","exchange":"POLONIEX"},
            {"symbol":"BCHUSDT","description":"Bitcoin Cash / Tether USD","type":"bitcoin","exchange":"POLONIEX"},
            {"symbol":"STEEMBTC","description":"STEEM / Bitcoin","type":"bitcoin","exchange":"POLONIEX"},
            {"symbol":"XMRBTC","description":"Monero / Bitcoin","type":"bitcoin","exchange":"POLONIEX"},
            {"symbol":"BCHBTC","description":"Bitcoin Cash / Bitcoin","type":"bitcoin","exchange":"POLONIEX"},
            {"symbol":"DASHBTC","description":"Dash / Bitcoin","type":"bitcoin","exchange":"POLONIEX"},
            {"symbol":"BTSUSD","description":"BitShares / Dollar (calculated by TradingView)","type":"bitcoin","exchange":"POLONIEX"},
            {"symbol":"NXTBTC","description":"NXT / Bitcoin","type":"bitcoin","exchange":"POLONIEX"},
            {"symbol":"NXTUSDT","description":"NXT / Tether USD","type":"bitcoin","exchange":"POLONIEX"},
            {"symbol":"LSKBTC","description":"Lisk / Bitcoin","type":"bitcoin","exchange":"POLONIEX"},
            {"symbol":"XEMUSD","description":"NEM / Dollar (calculated by TradingView)","type":"bitcoin","exchange":"POLONIEX"},
            {"symbol":"XRPUSD","description":"Ripple / Dollar (calculated by TradingView)","type":"bitcoin","exchange":"POLONIEX"},
            {"symbol":"ZECBTC","description":"Zcash / Bitcoin","type":"bitcoin","exchange":"POLONIEX"},
            {"symbol":"ZRXBTC","description":"0x / Bitcoin","type":"bitcoin","exchange":"POLONIEX"},
            {"symbol":"STRUSD","description":"Stellar / Dollar (calculated by TradingView)","type":"bitcoin","exchange":"POLONIEX"},
            {"symbol":"DASHUSDT","description":"Dash / Tether USD","type":"bitcoin","exchange":"POLONIEX"},
            {"symbol":"BCNBTC","description":"Bytecoin / Bitcoin","type":"bitcoin","exchange":"POLONIEX"},
            {"symbol":"ZECUSDT","description":"Zcash / Tether USD","type":"bitcoin","exchange":"POLONIEX"},
            {"symbol":"XMRUSDT","description":"Monero / Tether USD","type":"bitcoin","exchange":"POLONIEX"},
            {"symbol":"MAIDBTC","description":"MaidSafeCoin / Bitcoin","type":"bitcoin","exchange":"POLONIEX"},
            {"symbol":"GASBTC","description":"Gas / Bitcoin","type":"bitcoin","exchange":"POLONIEX"},
            {"symbol":"VTCBTC","description":"Vertcoin / Bitcoin","type":"bitcoin","exchange":"POLONIEX"},
            {"symbol":"FCTBTC","description":"Factom / Bitcoin","type":"bitcoin","exchange":"POLONIEX"},
            {"symbol":"ZRXUSD","description":"0x / Dollar (calculated by TradingView)","type":"bitcoin","exchange":"POLONIEX"},
            {"symbol":"LSKUSD","description":"Lisk / Dollar (calculated by TradingView)","type":"bitcoin","exchange":"POLONIEX"},
            {"symbol":"EMC2BTC","description":"Einsteinium / Bitcoin","type":"bitcoin","exchange":"POLONIEX"},
            {"symbol":"OMGBTC","description":"OmiseGO / Bitcoin","type":"bitcoin","exchange":"POLONIEX"},
            {"symbol":"DASHUSD","description":"Dash / Dollar (calculated by TradingView)","type":"bitcoin","exchange":"POLONIEX"},
            {"symbol":"LBCBTC","description":"LBRY Credits / Bitcoin","type":"bitcoin","exchange":"POLONIEX"},
            {"symbol":"ARDRBTC","description":"Ardor / Bitcoin","type":"bitcoin","exchange":"POLONIEX"},
            {"symbol":"ETHUSD","description":"Ethereum / Dollar (calculated by TradingView)","type":"bitcoin","exchange":"POLONIEX"},
            {"symbol":"CVCBTC","description":"Civic / Bitcoin","type":"bitcoin","exchange":"POLONIEX"},
            {"symbol":"DOGEUSD","description":"Dogecoin / Dollar (calculated by TradingView)","type":"bitcoin","exchange":"POLONIEX"},
            {"symbol":"BURSTBTC","description":"Burst / Bitcoin","type":"bitcoin","exchange":"POLONIEX"}]
            );
        break;
        case 'binance':
            res.send(
                [{"symbol":"BTCUSDT","description":"Bitcoin / Tether","type":"bitcoin","exchange":"BINANCE"},
                {"symbol":"TRXBTC","description":"TRON / Bitcoin","type":"bitcoin","exchange":"BINANCE"},
                {"symbol":"ICXBTC","description":"ICON / Bitcoin","type":"bitcoin","exchange":"BINANCE"},
                {"symbol":"VENBTC","description":"VeChain / Bitcoin","type":"bitcoin","exchange":"BINANCE"},
                {"symbol":"XRPBTC","description":"Ripple / Bitcoin","type":"bitcoin","exchange":"BINANCE"},
                {"symbol":"NANOBTC","description":"NANO / Bitcoin","type":"bitcoin","exchange":"BINANCE"},
                {"symbol":"ADABTC","description":"Cardano / Bitcoin","type":"bitcoin","exchange":"BINANCE"},
                {"symbol":"XLMBTC","description":"Stellar / Bitcoin","type":"bitcoin","exchange":"BINANCE"},
                {"symbol":"ETHUSDT","description":"Ethereum / Tether","type":"bitcoin","exchange":"BINANCE"},
                {"symbol":"NEOBTC","description":"NEO / Bitcoin","type":"bitcoin","exchange":"BINANCE"},
                {"symbol":"ETHBTC","description":"Ethereum / Bitcoin","type":"bitcoin","exchange":"BINANCE"},
                {"symbol":"NEOUSDT","description":"NEO / Tether","type":"bitcoin","exchange":"BINANCE"},
                {"symbol":"ETCBTC","description":"Ethereum Classic / Bitcoin","type":"bitcoin","exchange":"BINANCE"},
                {"symbol":"DGDBTC","description":"DigixDAO / Bitcoin","type":"bitcoin","exchange":"BINANCE"},
                {"symbol":"XVGBTC","description":"Verge / Bitcoin","type":"bitcoin","exchange":"BINANCE"},
                {"symbol":"CNDBTC","description":"Cindicator / Bitcoin","type":"bitcoin","exchange":"BINANCE"},
                {"symbol":"WTCBTC","description":"Walton / Bitcoin","type":"bitcoin","exchange":"BINANCE"},
                {"symbol":"LTCBTC","description":"Litecoin / Bitcoin","type":"bitcoin","exchange":"BINANCE"},
                {"symbol":"EOSBTC","description":"EOS / Bitcoin","type":"bitcoin","exchange":"BINANCE"},
                {"symbol":"IOTABTC","description":"IOTA / Bitcoin","type":"bitcoin","exchange":"BINANCE"},
                {"symbol":"BNBUSDT","description":"Binance Coin / Tether","type":"bitcoin","exchange":"BINANCE"},
                {"symbol":"OMGBTC","description":"OmiseGO / Bitcoin","type":"bitcoin","exchange":"BINANCE"},
                {"symbol":"BNBBTC","description":"Binance Coin / Bitcoin","type":"bitcoin","exchange":"BINANCE"},
                {"symbol":"LTCUSDT","description":"Litecoin / Tether","type":"bitcoin","exchange":"BINANCE"},
                {"symbol":"VIBEBTC","description":"VIBE / Bitcoin","type":"bitcoin","exchange":"BINANCE"},
                {"symbol":"IOSTBTC","description":"IOStoken / Bitcoin","type":"bitcoin","exchange":"BINANCE"},
                {"symbol":"TRXETH","description":"TRON / Ethereum","type":"bitcoin","exchange":"BINANCE"},
                {"symbol":"POEBTC","description":"Po.et / Bitcoin","type":"bitcoin","exchange":"BINANCE"},
                {"symbol":"ELFBTC","description":"aelf / Bitcoin","type":"bitcoin","exchange":"BINANCE"},
                {"symbol":"HSRBTC","description":"Hshare / Bitcoin","type":"bitcoin","exchange":"BINANCE"},
                {"symbol":"SUBBTC","description":"Substratum / Bitcoin","type":"bitcoin","exchange":"BINANCE"},
                {"symbol":"NEBLBTC","description":"Neblio / Bitcoin","type":"bitcoin","exchange":"BINANCE"},
                {"symbol":"APPCBTC","description":"AppCoins / Bitcoin","type":"bitcoin","exchange":"BINANCE"},
                {"symbol":"ZRXBTC","description":"0x / Bitcoin","type":"bitcoin","exchange":"BINANCE"},
                {"symbol":"AIONBTC","description":"Aion / Bitcoin","type":"bitcoin","exchange":"BINANCE"},
                {"symbol":"LSKBTC","description":"Lisk / Bitcoin","type":"bitcoin","exchange":"BINANCE"},
                {"symbol":"PPTBTC","description":"Populous / Bitcoin","type":"bitcoin","exchange":"BINANCE"},
                {"symbol":"LENDBTC","description":"ETHLend / Bitcoin","type":"bitcoin","exchange":"BINANCE"},
                {"symbol":"VENETH","description":"VeChain / Ethereum","type":"bitcoin","exchange":"BINANCE"},
                {"symbol":"BCPTBTC","description":"BlockMason Credit Protocol / Bitcoin","type":"bitcoin","exchange":"BINANCE"},
                {"symbol":"KNCBTC","description":"Kyber Network / Bitcoin","type":"bitcoin","exchange":"BINANCE"},
                {"symbol":"WABIBTC","description":"WaBi / Bitcoin","type":"bitcoin","exchange":"BINANCE"},
                {"symbol":"ICXETH","description":"ICON / Ethereum","type":"bitcoin","exchange":"BINANCE"},
                {"symbol":"XMRBTC","description":"Monero / Bitcoin","type":"bitcoin","exchange":"BINANCE"},
                {"symbol":"STRATBTC","description":"Stratis / Bitcoin","type":"bitcoin","exchange":"BINANCE"},
                {"symbol":"MTLBTC","description":"Metal / Bitcoin","type":"bitcoin","exchange":"BINANCE"},
                {"symbol":"ENJBTC","description":"Enjin Coin / Bitcoin","type":"bitcoin","exchange":"BINANCE"},
                {"symbol":"LINKBTC","description":"ChainLink / Bitcoin","type":"bitcoin","exchange":"BINANCE"},
                {"symbol":"GTOBTC","description":"Gifto / Bitcoin","type":"bitcoin","exchange":"BINANCE"},
                {"symbol":"XRPETH","description":"Ripple / Ethereum","type":"bitcoin","exchange":"BINANCE"}]
            );
    }
});

module.exports = router;