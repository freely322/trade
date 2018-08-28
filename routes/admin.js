var express = require('express');
var router = express.Router();



router.get('/login', (req, res)=> {
    res.render('index.hbs');
} );

router.get('/logout', (req, res) => {
    if(req.session) {
        req.session.destroy((err) => {
            if(err) {
                return next(err);
            } else {
                return res.redirect('/');
            }
        });
    }
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
        user.save().then((doc) => {
            if(!doc)
                res.status(400).send('Bad request');
            else res.send(_.pick(doc, ['_id','username','email']));
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
    let userData = {username, password};
    User.authenticate(username, password, (err, user) => {
        if(!user) {
            res.status(401).send('Not authenticated');
        }
        else {
            req.session.userId = user._id;
            req.session.save(function(err) {
                console.log("save");
            });
            res.redirect('/home');
        }
    });
    
});

module.exports = router;