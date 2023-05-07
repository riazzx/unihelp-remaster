// IMPORT MYSQL
const mysql = require('mysql');
// CREATE A DATABASE CONNECTION POOL
const connectionPool = mysql.createPool({
    connectionLimit: 100,
    host: "127.0.0.1",
    user: "dg",
    password: "123456",
    database: "unihelp1",
    debug: false
});

// GET ALL POSTS
exports.getAllPosts = (response) => {
    //BUILD QUERY
    let sql = "SELECT * FROM question INNER JOIN module ON question.module_id = module.module_id INNER JOIN user ON  \
    question.user_id = user.user_id";

    //EXECUTE SQL QUERY
    connectionPool.query(sql, (err, result) => {
        if (err){//CHECK FOR ERRORS
            let errMsg = "{Error: " + err + "}";
            console.error(errMsg);
            response.status(400).json(errMsg);
        }
        else{//RETURN RESULTS IN JSON
            response.send(JSON.stringify(result))
        }
    });
};

//GETS ALL COMMENTS
exports.getAllComments = (response) => {
    //BUILD QUERY
    let sql = "SELECT * FROM question INNER JOIN module ON question.module_id = module.module_id INNER JOIN user ON  \
    question.user_id = user.user_id LEFT JOIN comments ON question.question_id = comments.question_id";
    let sql2 = "SELECT * FROM comments INNER JOIN user ON comments.user_id = user.user_id";

    //EXECUTE QUERY
    connectionPool.query(sql2, (err, result) => {
        if (err){//CHECK FOR ERRORS
            let errMsg = "{Error: " + err + "}";
            console.error(errMsg);
            response.status(400).json(errMsg);
        }
        else{//RETURN RESULTS IN JSON
            
            response.send(JSON.stringify(result))
        }
    });
};

// ADDS COMMENTS
exports.addQuestion=(user, module_id, question_text, response, request) => {
    // GET USER ID
    let user_id="SELECT `user_id` FROM `user` WHERE user_email='"+user+"'";

    // BUILD QUERY
    let sql = "INSERT INTO question (user_id, module_id, question_text) " +
    "       VALUES (("+user_id+"),'" + module_id + "','" + question_text +"')";

    //EXECUTE QUERY
    connectionPool.query(sql, (err, result) => {
        if (err){//CHECK FOR ERRORS
            let errMsg = "{Error: " + err + "}";
            console.error(errMsg);
            response.status(400).json(errMsg);
        }
        else{//SEND RESPONSE
            response.send("{result: 'Question added successfully'}");
        }
    });

} 

exports.addComment=(user, question_id, comment_text, response, request) => {
    // GET USER ID
    let user_id="SELECT `user_id` FROM `user` WHERE user_email='"+user+"'";
    
    // BUILD QUERY
    let sql = "INSERT INTO `comments` (question_id, user_id, comment_text) " +
    "       VALUES ("+question_id+",("+user_id+"),'" + comment_text +"')";

    //EXECUTE QUERY
    connectionPool.query(sql, (err, result) => {
        if (err){//CHECK ERRORS
            let errMsg = "{Error: " + err + "}";
            console.error(errMsg);
            response.status(400).json(errMsg);
        }
        else{//SEND RESPONSE
            response.send("{result: 'Comment added successfully'}");
        }
    });

}


//GET ALL USERS
exports.getAllUsers = (response) => {
    //BUILD QUERY
    let sql = "SELECT * FROM user";

    //EXECUTE QUERY
    connectionPool.query(sql, (err, result) => {
        if (err){//CHECK FOR ERRORS
            let errMsg = "{Error: " + err + "}";
            console.error(errMsg);
            response.status(400).json(errMsg);
        }
        else{//RETURN RESULTS IN JSON
            response.send(JSON.stringify(result))
        }
    });
};

//ADD NEW USER TO DATABASE
exports.addUser = (name, email, password,usertype, response) => {
    //BUILD QUERY
    let sql = "INSERT INTO user (user_name, user_email, user_password, user_type) " +
    "       VALUES ('" + name + "','" + email + "','" + password +"','"+usertype+"')";
    
    //EXECUTE QUERY
    connectionPool.query(sql, (err, result) => {
        if (err){//CHECK FOR ERRORS
            let errMsg = "{Error: " + err + "}";
            console.error(errMsg);
            response.status(400).json(errMsg);
        }
        else{//SEND RESPONSE
            response.send("{result: 'User added successfully'}");
        }
    });
}

// GET LOGIN USER DETAILS
exports.getLoginUser=(email,password,response,request)=>{
    // BUILD QUERY
    let sql= "SELECT * FROM `user` WHERE user_email='"+email+"' AND user_password='"+password+"'";
    
    // EXECUTE QUERY
    connectionPool.query("SELECT * FROM user WHERE user_email=? AND user_password=?",[email,password],function (err,result,fields){
        if (err || !(result) || result == 0) {
            // CHECK FOR ERRORS
            console.log(result);
            response.send('Something went wrong');
        }
        else { // SEND RESpONSE OF USER IN SESSION
            console.log(result);
            request.session.loggedin = true;
            request.session.email = email;
            console.log("This email is in session: "+request.session.email);
            response.send('OK');
        }
    

    });
}

// GETS DETAILS OF LOGGED IN USER
exports.getLoggedInUserDetails=(email,response)=>{
    // EXECUTE QUERY
    connectionPool.query("SELECT * FROM user WHERE user_email=?",[email],function(err,result){
        if (err || !(result) || result == 0) {
            // CHECK FOR ERRORS
            let errMsg = "{Error: " + err + "}";
            console.log(result);
            console.log("Something went wrong");
            response.status(400).json(errMsg);
        }
        else{
            // SEND RESULT IN JSON
            response.send(JSON.stringify(result));
            
        }
    });
}

// GETS SEARCH RESULTS
exports.getSearchQuestions=(search_tag,response)=>{
    // BUILD QUERY
     let sqlSearch = "SELECT * FROM question INNER JOIN module ON question.module_id = module.module_id INNER JOIN user ON  \
        question.user_id = user.user_id WHERE question.question_text LIKE '%"+search_tag+"%' OR module.module_name LIKE '%"+search_tag+"%' ";

    // EXECUTE QUERY
    connectionPool.query(sqlSearch, (err, result) => {
        if (err){//CHECK FOR ERRORS
            let errMsg = "{Error: " + err + "}";
            console.error(errMsg);
            response.status(400).json(errMsg);
        }
        else{//RETURN RESULTS IN JSON
            response.send(JSON.stringify(result));
        }
    });
}