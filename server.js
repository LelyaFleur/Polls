    // set up ========================
    var express  = require('express');
    var app      = express(); 
    var querystring = require('querystring');              
    var mongoose = require('mongoose');                     // mongoose for mongodb
    var cookieParser = require('cookie-parser');                    
    var morgan = require('morgan');                         // log requests to the console (express4)
    var bodyParser = require('body-parser');                // pull information from HTML POST (express4)
    var methodOverride = require('method-override');        // simulate DELETE and PUT (express4)
    var http = require('http');
    var path = require('path');
    var passport = require('passport');
    var LocalStrategy = require('passport-local').Strategy;
    var expressSession = require('express-session');  
    var lt = require('long-timeout');   
    var CryptoJS = require("crypto-js");

   
    var User = require('./models/user');
    var Subscription = require('./models/subscription');
    var Census = require('./models/census');
    var Poll = require('./models/poll');

    var server = null;
    var io = null; // Socket io instance

    mongoose.connect('mongodb://localhost:27017/cassa');

    function startPoll(poll) {
        var id = poll._id;
        
        
        var now = new Date().valueOf();
        var time = poll.publishDate.startDate.valueOf() - now; 

         lt.setTimeout(function() {
            Poll.findOne({_id: id}, {submissions:0}, function (err, poll) {
                    poll.state = 1;
                    poll.save();
                    io.sockets.emit('status', { status: 1, id: poll._id, poll: ""});
                    endPoll(poll);
                    // TODO Call io
                });
            }, time);
    }

    function endPoll(poll) {

        console.log("end poll....");
        var id = poll._id;
        var now = new Date().valueOf();
        console.log('now:'+ now);
        var time = poll.publishDate.endDate.valueOf() - now;
        console.log("end poll....", time);

         lt.setTimeout(function() {
            Poll.findOne({_id: id}, {submissions:0}, function (err, poll) {
                    console.log("state changed to 2....");
                    poll.state = 2; 
                    poll.proposals.forEach(function(proposal) {
                        proposal.submissions = [];
                       
                    });              
                    poll.save();
                    io.sockets.emit('status', { status: 2, id: poll._id, poll: poll });
                  
                });
            }, time);
    }


    //==================================================================
    
    // Define a middleware function to be used for every secured routes
    var auth = function(req, res, next){
      if (!req.isAuthenticated()) 
        res.send(401);
      else
        next();
    };
    //==================================================================
    
    // configuration =================

     // all environments
    app.set('view engine', 'ejs');   
    app.use(express.static(__dirname + '/public'));                 // set the static files location /public/img will be /img for users
    app.use(morgan('dev'));                                         // log every request to the console
    app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
    app.use(bodyParser.json());                                     // parse application/json
    app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
    app.use(methodOverride());
    app.use(cookieParser()); 
    app.use(expressSession({
        secret: 'securedsession',
        resave: false,
        saveUninitialized: false
    }));
    app.use(passport.initialize()); // Add passport initialization
    app.use(passport.session());    // Add passport initialization
    
    app.use(express.static(path.join(__dirname, 'public')));

    // configure passport
    passport.use(new LocalStrategy(User.authenticate()));
    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());

    // routes ======================================================================

    // api ---------------------------------------------------------------------

    function findIndex(submissions, key, valuetosearch) {
    console.log("value to search:" + valuetosearch);
        for (var i = 0; i < submissions.length; i++) {
            
            var decryptedDNI = CryptoJS.AES.decrypt(submissions[i][key], generateSecretWordForDNI()).toString(CryptoJS.enc.Utf8); 
            console.log("value:" + decryptedDNI);
            if (decryptedDNI === valuetosearch) {
                 return i;
            }
        }
        return -1;
    }

    //get server date
    app.get('/api/date', function(req,res){
        var data = new Date().valueOf();
        var date = {date: data};
        console.log("Date: " + date.date);
        res.json(date);
    });

    ///////////////////////// polls
     // get all polls
    app.get('/api/polls', function(req, res) {
         var now = new Date();
         console.log("now:" + now);
        // use mongoose to get all polls in the database
        Poll.find(null, {submissions : 0}, function(err, polls) {
            
            polls.forEach(function(poll) {
                console.log("publish date start:" + poll.publishDate.startDate);
                console.log("publish date end:" + poll.publishDate.endDate);
               /* if(poll.state === 1){
                    poll.totalVotes = 0;
                    poll.submissions = {};
                    poll.proposals.forEach(function(proposal) {                        
                            proposal.votes = 0;                       
                    });
                }*/
            });
            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
                res.send(err)
            console.log(polls);
            res.json(polls); // return all surveys in JSON format
        });
    });


    // get all surveys
    app.get('/api/surveys', function(req, res) {

        // use mongoose to get all surveys in the database
        Survey.find(null, {submissions : 0}, function(err, surveys) {
            
            surveys.forEach(function(survey){
                if(survey.state === 1){
                    survey.totalVotes = 0;
                    survey.submissions = {};
                    survey.questions.forEach(function(question){
                        question.choices.forEach(function(choice){
                            choice.votes = 0;
                        });
                    });
                }
            });
            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
                res.send(err)
            
            res.json(surveys); // return all surveys in JSON format
        });
    });

    // get survey by id
    app.get('/api/surveys/:id', function(req, res) {
        var surveyId = req.params.id;
        Survey.findById(surveyId, function(err, survey) {
          if (err) 
            res.send(err)
            // show the one survey           
            res.json(survey);
        });

    });

     // get submissions by id
    app.get('/api/admin/submissions/:id', function(req, res) {
        var pollId = req.params.id;
        Poll.findById(pollId, 'submissions', function(err, poll) {
           
            if (err) 
                res.send(err)
            // show the one survey          
            res.json(poll);
        });
    });

     // get submissions by id and dni
    app.get('/api/admin/submissions/:id/:dni', function(req, res) {
        var surveyId = req.params.id;
        var dni = req.params.dni;
        Survey.findById(surveyId, 'questions', function(err, survey) {
            var submission = [];
            var qAndA = { 
                questionId: '',
                answerId:''
            };
            var i = 0;

            if (err) 
                res.send(err) 
            
            for(var question in survey.questions) {
                qAndA.questionId = survey.questions[question]._id; 
                var qId = qAndA.questionId; 
                survey.questions.id(qId).choices.forEach(function(choice) {
                   
                     if(findIndex(choice.submissions, "dni", dni) >= 0){
                         qAndA.answerId = choice._id;
                    }
                })
               
                submission.push(qAndA);
                qAndA = {};
            }              

            res.json(submission);
        });
    });
    
    // get votes number by id
    app.get('/api/admin/votes/:id', function(req, res) {
        var surveyId = req.params.id;
        Survey.findById(surveyId, 'totalVotes', function(err, survey) {
           
            if (err) 
                res.send(err)

            console.log("votes:" + survey);
                    
            res.json(survey);
        });
    });

    app.get('/api/admin/nonparticipants/:id', function(req, res){
        var pollId = req.params.id;

        Poll.findById(pollId, 'submissions', function(err, poll){
           
            if (err) res.send(err);
            Census.find({$nor: poll.submissions}, function(err, data){
                if (err) 
                res.send(err)                          
                res.send(JSON.stringify(data));                
            });
        });
    });

    // get subscriptions
    app.get('/api/admin/subscription', function(req, res) {
        
        Subscription.findOne('subscription', function (err, data) {
           
            if (err) 
                 res.send(err)
            // show the one survey          
            res.json(data.subscription);
        });
    });

    function getAge(dateString, endDate) {
        var parts = dateString.split('/');
        var birthDate = new Date(parts[2],parts[0]-1,parts[1]);       
             
        var age = endDate.getFullYear() - birthDate.getFullYear();        
        var m = endDate.getMonth() - birthDate.getMonth();       
        if (m < 0 || (m === 0 && endDate.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }

    function getWeekDay(){
        var d = new Date();
        var weekday = new Array(7);
        weekday[0]=  "Sunday";
        weekday[1] = "Monday";
        weekday[2] = "Tuesday";
        weekday[3] = "Wednesday";
        weekday[4] = "Thursday";
        weekday[5] = "Friday";
        weekday[6] = "Saturday";

        var n = weekday[d.getDay()];
        return n;
    };

    function generateSecretWord(){
        var secret = "Todayis" + getWeekDay() + ".Yeah!";
        return secret;
    }; 

    function generateSecretWordForDNI(){
        var secret = "Todayis Yeah!";
        return secret;
    };

    function AltiriaSMS(sDestination, sMessage, sSenderId, debug) {

        var data = querystring.stringify({
            cmd: "sendsms",
            domainId: "sarriadeter",
            login:  "sarriadeter",
            passwd: "sarriadeter201605ctf",
            senderId: sSenderId,
            dest: sDestination,
            msg: sMessage
          });

          var options = {
            host: 'www.altiria.net',
            port: 80,
            path: '/api/http',
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Content-Length': Buffer.byteLength(data)
            }
          };

          var httpreq = http.request(options, function (response) {
            response.setEncoding('utf8');
            response.on('data', function (chunk) {
              console.log("body: " + chunk);
            });
            /*response.on('end', function() {
               console.log("ok");
            })*/
          });
          httpreq.write(data);
          httpreq.end();      
    };

    function generateCode() {
        var code = Math.floor(100000 + Math.random() * 900000);
        code = code.toString().substring(0, 4);
        return code;
    };

    //find if a person with a current dni can vote and has not participated in a current inquiry
     app.post('/api/polls/validation', function(req, res) {
        var inquiryId = req.body.id;
        var DNI = CryptoJS.AES.decrypt(req.body.dni, generateSecretWord()).toString(CryptoJS.enc.Utf8); 
        var birthdate = req.body.birthdate.toString();
        console.log("decrypted DNI: " + DNI);
        console.log("birhdate " + birthdate);

        Poll.find({_id: inquiryId, submissions: {$elemMatch: {dni : DNI}}}, function(err, inquiry) {
          
          if (err) res.send(err);
                 
          
            Census.find({dni: DNI}, function(err, doc) {
                if (err) res.send(err); 
                if(inquiry.length > 0 && doc.length > 0 && doc[0].birthdate === birthdate){             
                    res.send("2"); // has already participated           
                } else if(doc.length > 0) {
                    console.log("doc " + doc);
                    console.log("birhdate doc " + doc[0].birthdate);
                    if (doc[0].birthdate === birthdate) {
                         res.send("0"); // can vote
                       }
                       else {
                            res.send("1"); //birthdate is not correct
                       }
                    
                } else {                    
                    res.send("3"); //is not in the census
                }
            });           
        
            
        });

    });

    //find if a person with a current dni can vote and has not participated in a current survey
    
    app.post('/api/surveys/validation', function(req, res) {
        var surveyId = req.body.id;
        var surveyDNI = CryptoJS.AES.decrypt(req.body.dni, generateSecretWord()).toString(CryptoJS.enc.Utf8); 
        var phone = "34" + CryptoJS.AES.decrypt(req.body.phonenumber, generateSecretWord()).toString(CryptoJS.enc.Utf8);
        console.log("decrypted DNI: " + surveyDNI);

      /*  Survey.find({_id: surveyId, submissions: {$elemMatch: {dni : surveyDNI}}}, function(err, survey) {
          
          if (err) res.send(err);
          if(survey.length > 0){             
               res.send("2"); // has already participated           
          } else {     */     
          
            Census.find({dni: surveyDNI}, function(err, doc) {
                if (err) res.send(err);                
                if(doc.length > 0){
                    Survey.findOne({_id: surveyId}, function(err,survey){
                        if(getAge(doc[0].birthdate, survey.publishDate.endDate) >= 16){
                            Census.find({phonenumber : phone}, function(err, doc){
                                if(err) res.send(err);
                                if(doc.length > 0) {
                                    console.log("the phone number is alredy taken"); 
                                    res.send("1"); // the phone number is alredy taken
                                } else {
                                    var code = generateCode();
                                    console.log("the code is: " + code); 
                                    Census.findOne({dni: surveyDNI},function(err, person){
                                        if(err) send(err);
                                        person.phonenumber = phone;
                                        person.code = code; 
                                        person.save();
                                        var message = "Codi: " + code;
                                        AltiriaSMS(phone, message, "SarriaDeTer", false);
                                        res.send("0");
                                    }); 
                                }
                            });                            
                        }else {                          
                            res.send("3"); // should be at least 16
                        }
                    });
                    
                }else{                    
                    res.send("4"); //is not in the census
                }
            });           
       /*   }
            
        });*/

    });

    app.get('/api/census', function(req, res){
        Census.count(function(err, count) {
            if (err) { res.send(err)}
                console.log("census count:" + count);
            res.json({count: count}); 
        });
    });

    app.post('/api/census/validation', function(req,res){
        var surveyId = req.body.id;
        var dni = CryptoJS.AES.decrypt(req.body.dni, generateSecretWord()).toString(CryptoJS.enc.Utf8);        
        var code = CryptoJS.AES.decrypt(req.body.code, generateSecretWord()).toString(CryptoJS.enc.Utf8); 
        console.log("dni:" + dni);
        console.log("code:" + code);
        Survey.find({_id: surveyId, submissions: {$elemMatch: {dni : dni}}}, function(err, survey) {
          
          if (err) res.send(err);
          if(survey.length > 0){             
               res.send("1");  // has already participated          
          } else{          
          
            Census.find({dni: dni}, function(err, doc){
                if (err) res.send(err);                
                if(doc.length > 0){
                    Survey.findOne({_id: surveyId}, function(err, survey){
                        if(getAge(doc[0].birthdate, survey.publishDate.endDate) >= 16){
                            if(doc[0].code === code){
                               res.send("0"); // can vote 
                           }else{
                                res.send("4"); // code is not correct
                           }
                            
                        }else{                          
                            res.send("2"); // should be at least 16
                        }
                    });
                    
                }else{                    
                    res.send("3"); //is not in the census
                }
            });           
          }
            
        });
    });

    // update poll
    app.put('/api/polls/vote', function(req, res) {
        
        var id = req.body.pollId;
        var dni = req.body.dni;
        var decryptedDNI = CryptoJS.AES.decrypt(req.body.dni, generateSecretWord()).toString(CryptoJS.enc.Utf8); 

        
        var submission_element = {dni : decryptedDNI};
        console.log("submission:" + submission_element);
        var submissions = req.body.submissions;
        console.log("submissions:" +  req.body.submissions);
        Poll.update({_id: id}, {'$addToSet' : {'submissions': {'dni': decryptedDNI}}}).exec(function( err, data ){
            if(err) console.log(err);
           
            if(data) {
               Poll.findOne({ _id: id }, function (err, doc){ 
                   if(err) console.log(err);
                   
                  submissions.forEach(function(submission){
                    var bId = submission;
                        console.log("bId:" + bId);
                                               
                        doc.proposals.id(bId).votes += 1;
                        doc.proposals.id(bId).submissions.push(submission_element);
                  });
                   
                    doc.totalVotes += 1;
               //     io.sockets.emit('votes', {number: doc.totalVotes, id: id});
                    doc.save();
                     res.json({ message: 'Updated!' });
                }); 
               
            } else {
                res.json({ message: 'Did not update!' });
            }
        });
    });
    
     // change votes
    app.put('/api/polls/change', function(req, res) {
        
        var id = req.body.pollId;
        var dni = req.body.dni;
        var decryptedDNI = CryptoJS.AES.decrypt(req.body.dni, generateSecretWord()).toString(CryptoJS.enc.Utf8); 

        
        var submission_element = {dni : decryptedDNI};
        console.log("submission:" + submission_element);
        var submissions = req.body.submissions;
        console.log("submissions:" +  req.body.submissions);

        Poll.findOne({_id: id}, function (err, doc) {
            if(err) console.log(err);

            doc.proposals.forEach(function(proposal){
                
                    proposal.submissions.some(function(item, i) {                       
                        
        
                        if(decryptedDNI === item.dni) {
                          
                          proposal.submissions.splice(i, 1);
                          if(proposal.votes > 0) {
                            proposal.votes --;
                          }
                          
                          return true;
                        }
                    });
               
            })
                  
           submissions.forEach(function(submission){
                    var bId = submission;
                        console.log("bId:" + bId);
                                               
                        doc.proposals.id(bId).votes += 1;
                        doc.proposals.id(bId).submissions.push(submission_element);
                  });
            
        //    io.sockets.emit('votes', {number: doc.totalVotes, id: id});
            doc.save();
            res.json({ message: 'Vote has changed' });
        });
    });



    // update survey
    app.put('/api/surveys/:id/:dni', function(req, res) {
        
        var id = req.params.id;
        var dni = req.params.dni;
        var encryptedDNI = CryptoJS.AES.encrypt(dni, generateSecretWordForDNI()).toString();
        
        var submission_element = {dni : encryptedDNI};
        console.log("submission:" + submission_element);
        var submissions = req.body;
        Survey.update({_id: id}, {'$addToSet' : {'submissions': {'dni': dni}}}).exec(function( err, data ){
            if(err) console.log(err);
           
            if(data){
               Survey.findOne({ _id: id }, function (err, doc){ 
                   if(err) console.log(err);
                  
                   for(var submission in submissions){
                        var qId = submissions[submission].questionId;
                        var aId = submissions[submission].answerId;                        
                        doc.questions.id(qId).choices.id(aId).votes += 1;
                        doc.questions.id(qId).choices.id(aId).submissions.push(submission_element);
                    };
                    doc.totalVotes += 1;
                    io.sockets.emit('votes', {number: doc.totalVotes, id: id});
                    doc.save();
                }); 
                res.json({ message: 'Updated!' });
            }else {
                res.json({ message: 'Did not update!' });
            }
        });
    });

    // change votes
    app.put('/api/surveys/change/:id/:dni', function(req, res) {
        
        var id = req.params.id;
        var dni = req.params.dni;
        var encryptedDNI = CryptoJS.AES.encrypt(dni, generateSecretWordForDNI()).toString();
        var submission_element = {dni : encryptedDNI};
        var submissions = req.body;

        Survey.findOne({_id: id}, function (err, doc) {
            if(err) console.log(err);

            doc.questions.forEach(function(question){
                question.choices.forEach(function(choice){
                    choice.submissions.some(function(item, i) {                       
                        var decryptedDNI = CryptoJS.AES.decrypt(item.dni, generateSecretWordForDNI()).toString(CryptoJS.enc.Utf8); 
        
                        if(decryptedDNI === dni) {
                          
                          choice.submissions.splice(i, 1);
                          if(choice.votes > 0) {
                            choice.votes --;
                          }
                          
                          return true;
                        }
                    });
                })
            })
                  
           for(var submission in submissions){
                var qId = submissions[submission].questionId;
                var aId = submissions[submission].answerId;                        
                doc.questions.id(qId).choices.id(aId).votes += 1;
                doc.questions.id(qId).choices.id(aId).submissions.push(submission_element);
            };
            
            io.sockets.emit('votes', {number: doc.totalVotes, id: id});
            doc.save();
            res.json({ message: 'Updated!' });
        });
    });

    // update subscription list
    app.put('/api/surveys/subscription', function(req, res){
        var mail = req.body.email;       
        Subscription.update({'$addToSet' : { 'subscription': {'email': mail}}}).exec(function(err, data){
            if(err) console.log(err);

            if(data){
                res.json({ message: 'Email was added!'});
            }else{
                res.json({ message: 'Email was not added!'})
            }
        });
    }); 


    function checkPollState(poll){
        var now = new Date().valueOf();
        console.log("Checking states...");
            
        var start = poll.publishDate.startDate.valueOf();
        var end = poll.publishDate.endDate.valueOf();
        if (now >= end) {
            poll.state = 2;
        } else if (now >= start) {
            poll.state = 1;
        } else {
            poll.state = 0;
        }
        poll.save();

        switch (poll.state) {
            case 0:
                startPoll(poll);
                break;
            case 1:
                endPoll(poll);
                break;
        }       
    };

    // create poll 
    app.post('/api/polls', auth, function(req, res) {
        
        var poll = new Poll(req.body);      // create a new instance of the Inquiry model
          // 
                  
        checkPollState(poll);
        // save the survey and check for errors
        poll.save(function(err) {
            if (err)
                res.send(err);
            
            Poll.find(function(err, polls) {
                if (err)
                    res.send(err)
                res.json(polls);
            });
            
        });

    });

    // create survey 
    app.post('/api/surveys', auth, function(req, res) {
        
        var survey = new Survey(req.body);      // create a new instance of the Survey model
          // 
                  
        checkSurveyState(survey);
        // save the survey and check for errors
        survey.save(function(err) {
            if (err)
                res.send(err);
            
            Survey.find(function(err, surveys) {
                if (err)
                    res.send(err)
                res.json(surveys);
            });
            
        });

    });

    // delete a survey
    app.delete('/api/surveys/:id', auth, function(req, res) {
        Survey.remove({
            _id : req.params.id
        }, function(err, survey) {
            if (err)
                res.send(err);
         
            // get and return all the surveys after you delete another
            Survey.find(function(err, surveys) {
                if (err)
                    res.send(err)

                res.json(surveys);
            });
        });
    });
    

    //==================================================================
    // route to test if the user is logged in or not
    app.get('/loggedin', function(req, res) {
        console.log("req:" + req.body.username);
      res.send(req.isAuthenticated() ? req.user : '0');
    });

    app.post('/register'/*, auth*/, function(req, res) {
      User.register(new User({ username: req.body.username }),
        req.body.password, function(err, account) {
        if (err) {
          return res.status(500).json({
            err: err
          });
        }
        passport.authenticate('local')(req, res, function () {
          return res.status(200).json({
            status: 'Registration successful!'
          });
        });
      });
    });

    // route to log in
    app.post('/login', passport.authenticate('local'), function(req, res) {
        console.log("user:" + req.user);
      res.send(req.user);
    });

    // route to log out
    app.post('/logout', function(req, res){
      req.logOut();
      res.sendStatus(200);
    });
//==================================================================

     // application -------------------------------------------------------------
    app.get('*', function(req, res) {
        res.sendFile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
    });

    function initServer() {
        // listen (start app with node server.js) ======================================
        server = app.listen(7200); 
        io = require('socket.io').listen(server);

        console.log("App listening on port 7200");
    }

    function checkStates(err, polls) {
        var now = new Date().valueOf();
        console.log("Checking states...");       
        polls.forEach(function (poll) {
            
            var start = poll.publishDate.startDate.valueOf();
            var end = poll.publishDate.endDate.valueOf();
            if (now >= end) {
                poll.state = 2;
                poll.proposals.forEach(function(proposal){
                    proposal.submissions = [];
                    
                });    
            } else if (now >= start) {
                poll.state = 1;
            } else {
                poll.state = 0;
            }
            poll.save();

            switch (poll.state) {
                case 0:
                    startPoll(poll);
                    break;
                case 1:
                    endPoll(poll);
                    break;
            }
        });

        initServer();
    }

    Poll.find({state: { $lt: 2 }}, checkStates);
