//Import the express and body-parser modules
const express = require('express');
const bodyParser = require('body-parser');
const expressSession = require('express-session');

//Create express app and configure it with body-parser


//Import database functions
const db = require('./database');
const req = require('express/lib/request');


//Create express app and configure it with body-parser
const app = express();
app.use(bodyParser.json());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//Set up express to serve static files from the directory called 'public'
app.use(express.static('public'));

app.use(
    expressSession({
        secret: 'unihelp login',
        cookie: { maxAge: 4000000 },
        resave: false,
        saveUninitialized: true
    })
);

//Set up application to handle POST requests sent to the customers path
app.post('/user', handlePostRequest);//Adds a new customer

//Set up application to handle POST requests
app.post('/login', login);//Logs the user in

app.get('/logout', logout);//Logs user out

app.get('/posts', handleGetRequest);//loads the posts

app.get('/comments', handleGetRequest2);//loads all comments


app.listen(8080);
console.log("Listening on port 8080");

function handleGetRequest(request,response){
    //Split the path of the request into its components
    var pathArray = request.url.split("/");

    //Get the last part of the path
    var pathEnd = pathArray[pathArray.length - 1];

    //If path ends with 'customers' we return all customers
    if(pathEnd === 'posts'){
        //Call function to return all posts
        db.getAllPosts(response);
    }
    else{//The path is not recognized. Return an error message
        response.send("{error: 'Path not recognized'}")
    }
}

function handleGetRequest2(request,response){
    //Split the path of the request into its components
    var pathArray = request.url.split("/");

    //Get the last part of the path
    var pathEnd = pathArray[pathArray.length - 1];

    //If path ends with 'customers' we return all customers
    if(pathEnd === 'comments'){
        //Call function to return all posts
        db.getAllComments(response);
    }
    else{//The path is not recognized. Return an error message
        response.send("{error: 'Path not recognized'}")
    }
}


//Handles POST requests to our web service
function handlePostRequest(request, response){
    //Extract customer data
    let newUser = request.body;
    console.log("Data received: " + JSON.stringify(newUser));

    //Call function to add new customer
    db.addUser(newUser.name, newUser.email, newUser.password,newUser.usertype, response);
    //Add user to our data structure
}

// FUNCTION TO LOGIN TO WEBSITE
function login(request,response){
    let email = request.body.email;
	let password = request.body.password;
    console.log("Data received: " + JSON.stringify(request.body))
    console.log(email,password);

    // CHECK IF EMAIL AND PASSWORD ARE NOT EMPTY
    if (email !=="" && password !=="") {
        // GET LOGIN USER
        console.log("LOGGIN IN");
        db.getLoginUser(email,password,response,request);      
    }
    else{
        // END RESPONSE
        response.send('Please enter Email and Password!');
		response.end();
    }
}

// GET DETAILS OF LOGGED IN USER
app.get('/loggedInUserDetails',function(request,response){
    let loggedInEmail=request.session.email;
    // CHECK IF SESSION EMAIL IS NULL
    if(loggedInEmail !== null){
        // GET USER DETAILS
        db.getLoggedInUserDetails(loggedInEmail,response);
    }
    else{
        console.log("error");
    }
});

// GET /checklogin. Checks to see if the user has logged in
app.get('/loggedin', function(request, response) {
	// If the user is loggedin
    console.log(request.session.loggedin);
	if (request.session.loggedin) {
        response.send("LOGGEDIN");
    }
	else {
		// Not logged in
		response.send('Login to ask questions!');
	}
	response.end();
});

// GET /logout. Log Out the user.
function logout(request, response){
    //Destroy session.
    request.session.destroy( err => {
        if(err)
            response.send('{"error": '+ JSON.stringify(err) + '}');
        else
            response.send('loggedOut');
            console.log(request.session);
    });
}

// Add questions to database
app.post('/question', function(request, response){
    let question = request.body;
    db.addQuestion(question.userid, question.module, question.question, response, request);
});

// Add comments to database
app.post('/comment', function(request,response){
    let comments = request.body;
    db.addComment(comments.userid, comments.questionid, comments.comment, response,request);
});

// Get search results
app.post('/search',function(request,response){
    let search=request.body;
    db.getSearchQuestions(search.search_tag,response);
});

//Export server for testing
module.exports = app;