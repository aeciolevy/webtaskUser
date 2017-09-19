const app = new (require('express'))();
const wt = require('webtask-tools');
const _ = require('lodash');
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// We'll set up some generic response messages based on what our Webtask does
const RESPONSE = {
  OK: {
    status: "ok",
    message: "You have successfully added the user!"
  },
  DUPLICATE: {
    status: "error",
    message: "This user already exist."
  },
  ERROR: {
    status: "error",
    message: "Something went wrong. Please try again."
  },
  DELETED: {
    status: 'ok',
    message: 'User deleted'
  },
  EXIST: {
    status: 'error',
    message: "User doesn't exist"
  }
};

app.get('/user', function(req, res){
  req.webtaskContext.storage.get(function(err, data){
    if(err){
      res.writeHead(400, { 'Content-Type': 'application/json'});
      res.end(JSON.stringify(RESPONSE.ERROR));
    } else {
      // res.writeHead(200, { 'Content-Type': 'application/json'});
      res.json(data.users.byId);
    }
  });
});

app.post('/user', function(req, res){

  var user = req.body.user;

  if(user){
    req.webtaskContext.storage.get(function(err, data){
      if(err){
        // Taking full control over the HTTP response allows us to full
        // flexibility, so we'll set an response code as well as content-type
        res.writeHead(400, { 'Content-Type': 'application/json'});
        res.end(JSON.stringify(RESPONSE.ERROR));
      }
      data = data || {};
      data.users = data.users || {};
      data.users.byId = {};
      data.users.allIds = [];
      var id;
      if (_.size(data.users) === 0){
        id = '1';
      } else {
        id = String(_.size(data.users) + 1);
      }
      user.id = id;
      var exist = _.find(data.users, obj => { return obj.name === user.name}) !== undefined ? true : false;

      if(exist){
        res.writeHead(400, { 'Content-Type': 'application/json'});
        res.end(JSON.stringify(RESPONSE.DUPLICATE));
      } else {
        data.users.byId[id] = user;
        data.users.allIds.push(id);
        req.webtaskContext.storage.set(data, function(err){
          if(err){
            res.writeHead(400, { 'Content-Type': 'application/json'});
            res.end(JSON.stringify(RESPONSE.ERROR));
          } else {
            res.writeHead(200, { 'Content-Type': 'application/json'});
            res.end(JSON.stringify(RESPONSE.OK));
          }
        });
      }
    });
  } else {
    res.writeHead(200, { 'Content-Type': 'application/json'});
    res.end(JSON.stringify(RESPONSE.ERROR));
  }
});

app.delete('/user', function(req, res) {
  var id = req.body.id;
  if (id) {
    req.webtaskContext.storage.get(function(err, data){
      if(err){
        // Taking full control over the HTTP response allows us to full
        // flexibility, so we'll set an response code as well as content-type
        res.writeHead(400, { 'Content-Type': 'application/json'});
        res.end(JSON.stringify(RESPONSE.ERROR));
      }
      var exist = _.find(data.users, obj => { return obj.id === id}) !== undefined ? true : false;
      if (exist){
        delete data.users.byId[id];
        data.users.allIds.splice(_.indexOf(data.users.allIds, id), 1);
        req.webtaskContext.storage.set(data, function(err){
          if(err){
            res.writeHead(400, { 'Content-Type': 'application/json'});
            res.end(JSON.stringify(RESPONSE.ERROR));
          } else {
            res.writeHead(200, { 'Content-Type': 'application/json'});
            res.end(JSON.stringify(RESPONSE.DELETED));
          }
        });
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json'});
        res.end(JSON.stringify(RESPONSE.EXIST));
      }
    });
  } else {
    res.writeHead(200, { 'Content-Type': 'application/json'});
    res.end(JSON.stringify(RESPONSE.ERROR));
  }
});

module.exports = wt.fromExpress(app);