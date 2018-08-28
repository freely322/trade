var app = angular.module('myApp', []);

app.factory('WSServiceMy', function($rootScope){
  /*
  var socket = new WebSocket("wss://traderium.herokuapp.com");

  */
  var socket = new WebSocket("ws://localhost:3000");
 socket.onopen = () => alert('Соединение открыто!');

  socket.onmessage = function(event) {
        var message = JSON.parse(event.data);
        $rootScope.$apply(function(){
          Service.message.push(message);
        });
    };
    
  var Service = {};
  Service.send = function(userid,acounts,symb,data){
    socket.send(JSON.stringify({userid:userid,acounts:acounts,symbol:symb,body:data}));
  }

  socket.onclose = () => alert('Соединение закрыто...');
  
  Service.message = [];
  return Service;
});

app.factory('WSServiceB', function($rootScope){
    url = 'wss://api.bitfinex.com/ws/2';
    var socket = new WebSocket( url );
    socket.onopen = function(event){
      socket.send(JSON.stringify({event:'subscribe',channel:'ticker',symbol:'t'+'NEOUSD'}));
    }

    socket.onmessage = function(event) {
        var message = JSON.parse(event.data);
        $rootScope.$apply(function(){
          Service.message=message[1];
        });
    };

    var Service ={};
    Service.message= ['','',''];
    Service.reset = function(sym){
      socket.close();
      socket = new WebSocket( url );
      socket.onopen = function(event){
        socket.send(JSON.stringify({event:'subscribe',channel:'ticker',symbol:'t'+symb}));
      }
      socket.onmessage = function(event) {
        var message = JSON.parse(event.data);
        
        if(!message['event']){
          if(!(message[1] === "hb") ){
            $rootScope.$apply(function(){
              Service.message=message[1];
            });
          }
        }
      };
      console.log("reset");
    }
    return Service;
});

app.directive("preventTypingGreater", function() {
  return {
    link: function(scope, element, attributes) {
      var oldVal = null;
      element.on("keydown keyup", function(e) {
    if (Number(element.val()) > Number(attributes.max) &&
          e.keyCode != 46 // delete
          &&
          e.keyCode != 8 // backspace
        ) {
          e.preventDefault();
          element.val(oldVal);
        } else {
          oldVal = Number(element.val());
        }
      });
    }
  };
});

app.controller('soCtrl', function($scope, $timeout, WSServiceMy) {
  /*
  res.clearCookie('auth');
  */

  let chartMe = new TradingView.widget({
    container_id: 'chartMe',
    symbol: "BITFINEX:BTCUSD", 
    "autosize": true,
    "interval": "60",
    "timezone": "Etc/UTC",
    "theme": "Light",
    "style": "1",
    "locale": "en",
    "toolbar_bg": "rgba(255, 255, 255, 1)",
    "enable_publishing": false,
    "hide_side_toolbar": false,
    "allow_symbol_change": true,
    "show_popup_button": true
});

  $timeout(function(){
    $scope.message = WSServiceMy.message;
    console.log($scope.message);
  })
});

app.controller('orderCtrl', function($scope, $http, $q, WSServiceMy, WSServiceB){
  $scope.ordertag = 'Limited';
  $scope.receivedAccounts = [];
  $scope.acounts = [];
  $scope.userid;
  $scope.amount;
  $scope.price;
  $scope.average;
  $scope.accountActive = false;
  $scope.tp = [];
  $scope.sl = [];
  $scope.values = {};

  $scope.priceTP;
  $scope.priceSL;


  this.$onInit = async () => {
    await $http.get('/accounts')
    .then(result => {
      result.data.message.forEach(element => {
        $scope.receivedAccounts.push(element);
      });
    })
    .catch(err => console.log(err))

    await $http.get('/getId')
    .then(result => {
      $scope.userid = result.data.message;
    })
    .catch(err => console.log(err));
  }

  $scope.setTag = (tag, symb) => {
    
    $scope.tag = tag;
    $scope.symb = symb;
  
    const chartMe = new TradingView.widget({
      container_id: 'chartMe',
      symbol: `${tag}:${symb}`, 
      "autosize": true,
      "interval": "60",
      "timezone": "Etc/UTC",
      "theme": "Light",
      "style": "1",
      "locale": "en",
      "toolbar_bg": "rgba(255, 255, 255, 1)",
      "enable_publishing": false,
      "hide_side_toolbar": false,
      "allow_symbol_change": true,
      "show_popup_button": true
    });
  }

  $scope.getAcounts = (tag) => {
    var promise = $q.all({});
    promise = promise.then(function(){
      return $http.post('/api/acounts/getacounts', { tag: $scope.tag})
      .then( function (res) {
        $scope.acs = res.data;
      }, function (res) {
        console.log('error');
      });
    });
  }

  $scope.getBalance = async (buySell) => {
    if ($scope.acounts.length == 1) {
      await $http.post('/getDamnMoney', $scope.acounts[0])
      .then(result => {
        console.log(result);
        /*--- Array with 45 json objects ---*/
        if (!$scope.symb) {
          return alert('Выберите цену покупки/продажи в поле "Price USD"!')
        }
  
        if (result.data && $scope.symb) {
          for (const one of result.data) {
            let coin = $scope.symb.toLowerCase().substr(0, 3);
            let dollarBTC = $scope.symb.toLowerCase().substr(3, 6);
  
            if (buySell === 'buy' && one.currency === dollarBTC) {
              let howMuch = +one.available;
              
              if (typeof howMuch === 'number') {            
                return $scope.amount = (howMuch / $scope.priceBid).toFixed(6);
              }
              
              return console.log('it is not a number...');
            }
  
            if (buySell === 'sell' && one.currency === coin && one.available === '0.0') {
              $scope.average = 0;
              return $scope.amount = 0;
            }
  
            if (buySell === 'sell' && one.currency === coin && one.available !== '0.0') {
              let howMuch = +one.available;
              if (typeof howMuch === 'number') {
                
                $scope.average = (howMuch * $scope.priceAsk).toFixed(2);
                return  $scope.amount = ($scope.average / $scope.priceAsk).toFixed(6);
              }
              return console.log('it is not a number...');
            }
          }
        }
        return console.log(`No data has came from /wallets...`);
      })
      .catch(err => console.log(err)); 
    }
  }

/* --------------- ACCOUNTS FLOW --------------- */

  $scope.addSelectedAccount = async (account) => {
    if ($scope.acounts.length) {
      $scope.acounts.pop();
      $scope.acounts.push(account);
      console.log($scope.acounts);
      return console.log('Updated...');
    }

    return $scope.acounts.push(account);
  }

  $scope.addAccount = (account) => {

    if (account && account._id) {
      let newAccount = account;
      let idToWork = account._id;

    if (!$scope.acounts.length) {
     return $scope.acounts.push(newAccount);
    }

    if ($scope.acounts.length) {
      for (const [index, value] of $scope.acounts.entries()) {
        if (value._id === idToWork) {
          return $scope.acounts.splice(index, 1);
        }
      }
      return $scope.acounts.push(newAccount);
      }
    }
  }

  $scope.isActive = (pers) => {
    return $scope.acounts.some(el => el.name === pers);
  }

/* --------- MARKET ORDER ------- */
/* ------------- AND --------- */
/* --------- LIMIT ORDER ------- */
  $scope.getTick = async (color) => {
    return await $http.post('/symbol', { symb: $scope.symb })
    .then(res => {
      if (res.data.message === "Unknown symbol") {
        return alert('Необходимо выбрать пару!');
      }

      if (color === 'green') {
        $scope.price = $scope.priceBid = res.data.bid;
      } else if (color === 'red') {
        $scope.price = $scope.priceAsk = res.data.ask;
      } else {
        console.log('None. You are fired!');
      }
    })
    .catch(err => console.log(err))
  }

/* --------- TP&SL ORDER ------- */
  $scope.getSymbolPrice = async (sign) => {
    return await $http.post('/symbol', { symb: $scope.symb })
    .then(res => {

      if (res.data.message === "Unknown symbol") {
        return alert('Необходимо выбрать пару!');
      }
      
      if (sign === 'takeprofit') {
        let converted = (+res.data.ask).toFixed(2);
        $scope.priceTP = $scope.priceAsk = converted;
      } else if (sign === 'stoploss') {
        let convert = (+res.data.ask).toFixed(2);
        $scope.priceSL = $scope.priceAsk = convert;
      } else {
        console.log('None. You are fired!');
      }
    })
    .catch(err => console.log(err))
  }


/* --------------- ORDERS --------------- */

  $scope.makeOrderMarket = async (tag, aco, isbuy, amount) => {
    if ($scope.acounts.length) {
      return await WSServiceMy.send($scope.userid,$scope.acounts,$scope.symb,{tag:tag,aco:aco,type:'market',isbuy:isbuy, amount:amount});  
    }
    if (!$scope.acounts.length) {
      setTimeout(() => {
        if ($scope.acounts.length) {
          return WSServiceMy.send($scope.userid,$scope.acounts,$scope.symb,{tag:tag,aco:aco,type:'market',isbuy:isbuy, amount:amount});
        }
        console.log('Sorry, while we were waiting nothing has come up...');
      }, 1500)
    }
  }

  $scope.makeOrderLimited = function(tag, aco, isbuy, price, amount) {
    WSServiceMy.send($scope.userid,$scope.acounts,$scope.symb,{tag:tag,aco:aco,type:'limited',isbuy:isbuy,price:price,amount:amount});
  }

  /* ---- Functions for TP&SL  ----- */

  calcFunction = async (data) => {
    if (data) {
      console.log(data);
      let coin = $scope.symb.toLowerCase().substr(0, 3);

      for (const one of data.data) {
        if (one.currency === coin && one.available !== '0.0') {
          let money = +one.available;
          return counterFor(money);
        }
      }
    }
  }

  counterFor = async (data) => {
    if (typeof data === 'number') {
      await countSL(data);
      await countTP(data);

      $scope.values = {
        'tp': $scope.tp,
        'sl': $scope.sl
      }

      console.log($scope.values);
    }
  }
  
  countSL = async (sl) => {
    $scope.sl.forEach(el => {
      return el.deposit = (sl / 100 * el.deposit);
    })
  }

  countTP = async (tp) => {
    $scope.tp.forEach(el => {
      return el.deposit = (tp / 100 * el.deposit);
    })
  }

  $scope.makeOrderTPSL = async (tag, aco) => {

    if (!$scope.tag || !$scope.symb) {
      return alert('Сначала выберите пару!');
    }

    if ($scope.acounts.length !== 0) {
      for (const loop of $scope.acounts) {
        await $http.post('/getDamnMoney', loop)
        .then(result => {
          if (result.data.length && $scope.symb) {
            return calcFunction(result);
          }
        });
      }
    }
    
    await WSServiceMy.send($scope.userid,$scope.acounts,$scope.symb,{tag:tag,aco:aco,type:'tpsl', values: $scope.values});
  }

  /* ---- Functions for TP&SL  ----- */

  $scope.options = [{
    name: 'По рынку',
    value: 'Market'
  },
  {
    name: 'Лимитный',
    value: 'Limit'
  },
  {
    name: 'Стоп Лимит',
    value: 'LimitOCO'
  },
  {
    name: 'TP&SL',
    value: 'TP&SL'
  }
]

});
