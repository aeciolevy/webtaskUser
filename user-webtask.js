const app = new (require('express'))();
const wt = require('webtask-tools');
const _ = require('lodash');
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// We'll set up some generic response messages based on what our Webtask does
const RESPONSE = {
  USER: {
  OK: {
    status: "ok",
    message: "You have successfully added the user!"
  },
  DUPLICATE: {
    status: "error",
    message: "This user already exist."
  },
  DELETED: {
    status: 'ok',
    message: 'User deleted'
  },
  EXIST: {
    status: 'error',
    message: "User doesn't exist"
  }
  },
  ERROR: {
    status: "error",
    message: "Something went wrong. Please try again."
  },
  GROUP: {
    OK: {
    status: "ok",
    message: "You have successfully added the group!"
    },
    DUPLICATE: {
      status: "error",
      message: "This group already exist."
    },
    DELETED: {
      status: 'ok',
      message: 'Group deleted'
    },
    EXIST: {
      status: 'error',
      message: "Group doesn't exist"
    }
  },
  LINK: {
    OK: {
    status: "ok",
    message: "You have successfully added a group to user!"
    },
    DUPLICATE: {
      status: "error",
      message: "This user is already part of this group."
    }
  }
};

app.get('/users', function(req, res){
  req.webtaskContext.storage.get(function(err, data){
    if(err){
      res.writeHead(400, { 'Content-Type': 'application/json'});
      res.end(JSON.stringify(RESPONSE.ERROR));
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json'});
      res.json(data.users);
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
      data.users.byId = data.users.byId || {};
      data.users.allIds = data.users.allIds || [];
      var id;
      if (_.size(data.users.byId) === 0){
        id = 1;
      } else {
        id = _.size(data.users.byId) + 1;
      }
      user.id = id;
      var exist = _.find(data.users.byId, obj => { return obj.email === user.email}) !== undefined ? true : false;

      if(exist){
        res.writeHead(400, { 'Content-Type': 'application/json'});
        res.end(JSON.stringify(RESPONSE.USER.DUPLICATE));
      } else {
        data.users.byId[id] = user;
        data.users.allIds.push(id);
        req.webtaskContext.storage.set(data, function(err){
          if(err){
            res.writeHead(400, { 'Content-Type': 'application/json'});
            res.end(JSON.stringify(RESPONSE.ERROR));
          } else {
            res.writeHead(200, { 'Content-Type': 'application/json'});
            res.end(JSON.stringify(RESPONSE.USER.OK));
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
      var exist = _.find(data.users.byId, obj => { return obj.id === id}) !== undefined ? true : false;
      if (exist){
        delete data.users.byId[String(id)];
        data.users.allIds.splice(_.indexOf(data.users.allIds, id), 1);
        req.webtaskContext.storage.set(data, function(err){
          if(err){
            res.writeHead(400, { 'Content-Type': 'application/json'});
            res.end(JSON.stringify(RESPONSE.ERROR));
          } else {
            res.writeHead(200, { 'Content-Type': 'application/json'});
            res.end(JSON.stringify(RESPONSE.USER.DELETED));
          }
        });
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json'});
        res.end(JSON.stringify(RESPONSE.USER.EXIST));
      }
    });
  } else {
    res.writeHead(200, { 'Content-Type': 'application/json'});
    res.end(JSON.stringify(RESPONSE.ERROR));
  }
});

app.get('/groups', function(req, res){
  req.webtaskContext.storage.get(function(err, data){
    if(err){
      res.writeHead(400, { 'Content-Type': 'application/json'});
      res.end(JSON.stringify(RESPONSE.ERROR));
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json'});
      res.json(data.groups);
    }
  });
});

app.post('/group', function(req, res){

  var group = req.body.group;

  if(group){
    req.webtaskContext.storage.get(function(err, data){
      if(err){
        // Taking full control over the HTTP response allows us to full
        // flexibility, so we'll set an response code as well as content-type
        res.writeHead(400, { 'Content-Type': 'application/json'});
        res.end(JSON.stringify(RESPONSE.ERROR));
      }
      data = data || {};
      data.groups = data.groups || {};
      data.groups.byId = data.groups.byId || {};
      data.groups.allIds = data.groups.allIds || [];
      var id;
      if (_.size(data.groups.byId) === 0){
        id = 1;
      } else {
        id = _.size(data.groups.byId) + 1;
      }
      group.id = id;
      var exist = _.find(data.groups.byId, obj => { return obj.name === group.name}) !== undefined ? true : false;

      if(exist){
        res.writeHead(400, { 'Content-Type': 'application/json'});
        res.end(JSON.stringify(RESPONSE.GROUP.DUPLICATE));
      } else {
        data.groups.byId[id] = group;
        data.groups.allIds.push(id);
        req.webtaskContext.storage.set(data, function(err){
          if(err){
            res.writeHead(400, { 'Content-Type': 'application/json'});
            res.end(JSON.stringify(RESPONSE.ERROR));
          } else {
            res.writeHead(200, { 'Content-Type': 'application/json'});
            res.end(JSON.stringify(RESPONSE.GROUP.OK));
          }
        });
      }
    });
  } else {
    res.writeHead(200, { 'Content-Type': 'application/json'});
    res.end(JSON.stringify(RESPONSE.ERROR));
  }
});

app.delete('/group', function(req, res) {
  var id = req.body.id;
  if (id) {
    req.webtaskContext.storage.get(function(err, data){
      if(err){
        // Taking full control over the HTTP response allows us to full
        // flexibility, so we'll set an response code as well as content-type
        res.writeHead(400, { 'Content-Type': 'application/json'});
        res.end(JSON.stringify(RESPONSE.ERROR));
      }
      var exist = _.find(data.groups.byId, obj => { return obj.id === id}) !== undefined ? true : false;
      if (exist){
        delete data.groups.byId[String(id)];
        data.groups.allIds.splice(_.indexOf(data.groups.allIds, id), 1);
        req.webtaskContext.storage.set(data, function(err){
          if(err){
            res.writeHead(400, { 'Content-Type': 'application/json'});
            res.end(JSON.stringify(RESPONSE.ERROR));
          } else {
            res.writeHead(200, { 'Content-Type': 'application/json'});
            res.end(JSON.stringify(RESPONSE.GROUP.DELETED));
          }
        });
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json'});
        res.end(JSON.stringify(RESPONSE.GROUP.EXIST));
      }
    });
  } else {
    res.writeHead(200, { 'Content-Type': 'application/json'});
    res.end(JSON.stringify(RESPONSE.ERROR));
  }
});

app.get('/usergroup', function(req, res){
  req.webtaskContext.storage.get(function(err, data){
    if(err){
      res.writeHead(400, { 'Content-Type': 'application/json'});
      res.end(JSON.stringify(RESPONSE.ERROR));
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json'});
      res.json(data.usergroup);
    }
  });
});

app.post('/usergroup', function(req, res) {
  var usergroup = req.body.usergroup;
  
  if (usergroup) {
    req.webtaskContext.storage.get(function(err, data){
      if(err){
        res.writeHead(400, { 'Content-Type': 'application/json'});
        res.end(JSON.stringify(RESPONSE.ERROR));
      }
      data = data || {};
      data.usergroup = data.usergroup || {};
      data.usergroup.byId = data.usergroup.byId || {};
      data.usergroup.allIds = data.usergroup.allIds || [];
      var id;
      if (_.size(data.usergroup.byId) === 0){
        id = 1;
      } else {
        id = _.size(data.usergroup.byId) + 1;
      }
      usergroup.id = id;
      var exist = _.find(data.usergroup.byId, obj => {
        return obj.userId === usergroup.userId && obj.groupId === usergroup.groupId
      }) !== undefined ? true : false;
      if (exist) {
        res.writeHead(400, { 'Content-Type': 'application/json'});
        res.end(JSON.stringify(RESPONSE.LINK.DUPLICATE));
      } else {
        data.usergroup.byId[id] = usergroup;
        data.usergroup.allIds.push(id);
        req.webtaskContext.storage.set(data, function(err){
          if(err){
            res.writeHead(400, { 'Content-Type': 'application/json'});
            res.end(JSON.stringify(RESPONSE.ERROR));
          } else {
            res.writeHead(200, { 'Content-Type': 'application/json'});
            res.end(JSON.stringify(RESPONSE.LINK.OK));
          }
        });
      }
    });
  } else {
    res.writeHead(200, { 'Content-Type': 'application/json'});
    res.end(JSON.stringify(RESPONSE.ERROR));
  }
});

module.exports = wt.fromExpress(app);