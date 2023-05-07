let addCustomerResultDiv;

//Set up page when window has loaded
window.onload = init;

//Get pointers to parts of the DOM after the page has loaded.
function init(){
    loadQuestions();
    checkLoginUser();
}

/* Loads posts and comments and add them to the page*/
function loadQuestions(){
    // Create new XMLHTTP Request
    let xhttp = new XMLHttpRequest();
    let questionDiv = document.getElementById("questionDiv");
    xhttp.onreadystatechange = () => {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            let queArr = JSON.parse(xhttp.responseText);

            if(queArr.length === 0){
                return
            }
            // BUILD THE HTML STRING
            let htmlStr = "";

            // CREATE SECOND XMLHTTP REQUEST FOR COMMENTS
            let xhttp2 = new XMLHttpRequest();
            xhttp2.onreadystatechange = () => {
                if (xhttp2.readyState == 4 && xhttp2.status == 200) {
                let comArr = JSON.parse(xhttp2.responseText);
                // DISPLAY POSTS AND BUILD STRING
                for(let key in queArr){
                    
                    htmlStr += '<div class="question">';
                    htmlStr += '<h3>'+queArr[key].user_name+'</h3>';
                    htmlStr += '<h4 id="module-name">'+queArr[key].module_name+'</h4>';
                    htmlStr += '<p id="questionPost">'+queArr[key].question_text+'</p>';
                    htmlStr += '<div class="comments">';
                    htmlStr += '<h5>Comments</h5>';
                    htmlStr += '<textarea  name="comment" id="'+queArr[key].question_id+'" cols="30" rows="2" placeholder="Write your comment here."></textarea>';
                    htmlStr += '<button type="submit" id="addComment" onclick="addComment('+queArr[key].question_id+')" >Add Comment</button>';
                    // display comments
                    for(let key2 in comArr){
                        if(queArr[key].question_id == comArr[key2].question_id){
                            htmlStr += '<h5 id="questionid">'+comArr[key2].user_name+'</h5>';
                            
                            htmlStr += '<p>'+comArr[key2].comment_text+'</p>';
                            
                        }
                        
                    }
                    htmlStr += "</div>";
                    htmlStr += "</div>";
                    
                }
                // PLACE HTML STRING IN QUESTION DIV
                questionDiv.innerHTML = htmlStr;
            }
            };
            // open and send request for comments
            xhttp2.open("GET", "/comments", true);
            xhttp2.send();

        }
    };
    // open and send request for posts
    xhttp.open("GET", "/posts", true);
    xhttp.send();

}

// FUNCTION TO ASK QUESTIONS
function askQuestion(){
        //Set up XMLHttpRequest
        let xhttp = new XMLHttpRequest();

        //Extract FORM data
        let questionModule = document.getElementById("module").value.trim();
        let questionText = document.getElementById("question").value.trim();


        //Create object with FORM data
        let questionObject = {
            module: questionModule,
            question: questionText,
            userid:sessionStorage.getItem("loggedInUser")
        };
        
        //Set up function that is called when reply received from server
        xhttp.onreadystatechange = (event)=> {
            // alert(xhttp.readyState);
            if (xhttp.readyState == 4 && xhttp.status == 200) {

                alert("Question added Successfully");
            }
            event.preventDefault();
        };
        loadQuestions();
    
        //SEND DATA TO SERVER IN JSON
        xhttp.open("POST", "/question", true);
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.send( JSON.stringify(questionObject) );
}

// ADD COMMENTS FUNCTION
function addComment(questionID){
    //Set up XMLHttpRequest
    let xhttp = new XMLHttpRequest();

    //Extract COMMENT data
    let comment = document.getElementById(questionID).value.trim();
    
    //Create object with COMMENT data
    let commentObject = {
        comment: comment,
        questionid: questionID,
        userid:sessionStorage.getItem("loggedInUser")
    };
    
    //Set up function that is called when reply received from server
    xhttp.onreadystatechange = (event)=> {

        if (xhttp.readyState == 4 && xhttp.status == 200) {

            alert("Comment added Successfully");
        }
        event.preventDefault();
    };
    loadQuestions();

    //Send comment data to server in JSON
    xhttp.open("POST", "/comment", true);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send( JSON.stringify(commentObject) );
}

/* LOGS IN USER */
function loginUser() {
    //Set up XMLHttpRequest
    let xhttp = new XMLHttpRequest();
    let emailLogin=document.getElementById("email-login").value.trim();
    let passwordLogin=document.getElementById("password-login").value.trim();
    
    // CREATE USER OBJECT
    let userObject = {
        email:emailLogin,
        password:passwordLogin
    };
    xhttp.onreadystatechange = (event) => {//Called when data returns from server
        
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            var responseData = xhttp.responseText;
            if(responseData=="OK"){
            alert("Login Successful");
            sessionStorage.setItem("loggedInUser",emailLogin);
            document.getElementById("account").style.display="none";
            document.getElementById("nav-ask-q").style.display="block";
            document.getElementById("success-login").style.display="block";
            

            document.getElementById("logout-text").innerHTML="Logged In As: "+sessionStorage.getItem("loggedInUser");
            }
            else{
                alert("Please Try Again");
            }
        }
        // event.preventDefault();
    };
    //SEND DATA AS JSON
    xhttp.open("POST", "/login", true);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send( JSON.stringify(userObject) );
    
}

/* Posts a new user to the server. */
function addUser() {
    //Set up XMLHttpRequest
    let xhttp = new XMLHttpRequest();

    //Extract user data
    let userName = document.getElementById("name").value.trim();
    let userEmail = document.getElementById("email").value.trim();
    let userType = document.getElementById("usertype").value.trim();
    let userPassword = document.getElementById("password").value.trim();
    //Create object with user data
    let userObject = {
        name: userName,
        email: userEmail,
        password:userPassword,
        usertype:userType
    };
    
    //Set up function that is called when reply received from server
    xhttp.onreadystatechange = (event)=> {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            alert("Registration Successful");
        }
        event.preventDefault();
    };

    //Send new user data to server in JSON
    xhttp.open("POST", "/user", true);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send( JSON.stringify(userObject) );
}

// CHECK THE LOGIN USER
function checkLoginUser(){
    // SET UP XMLHTTP REQUEST
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = () => {//Called when data returns from server
        
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            // GET LOGGED IN ACCOUNT AND HIDE/SHOW DIVS
            var responseData = xhttp.responseText;
            if(responseData=="LOGGEDIN"){
                console.log(responseData);
                console.log("User still loggedin")
                getLoggedInAccount();
                document.getElementById("account").style.display="none";
                document.getElementById("success-login").style.display="block";
                document.getElementById("nav-ask-q").style.display="block";
                document.getElementById("logout-text").innerHTML="Logged In As:  "+sessionStorage.getItem("loggedInUser");
                document.getElementById("ask-question").style.display="block";
                

                
            }
            else{
                console.log(responseData);
            }
        }
    };
    // SEND GET REQUEST
    xhttp.open("GET", "/loggedin", true);
    xhttp.send();

}

// GET LOGGED IN ACCOUNT
function getLoggedInAccount(){
    // SET UP NEW XMLHTTL REQUEST
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = () => {//Called when data returns from server
        
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            var responseData = xhttp.responseText;
            console.log(responseData);
            
        }
    };
    // SEND GET REQUEST
    xhttp.open("GET", "/loggedInUserDetails", true);
    xhttp.send();
}

// LOG OUT USER 
function logoutUser(){
    // SET UP NEW HTTP REQUEST
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = (event) => {//Called when data returns from server
        
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            // CLEAR SESSION STORAGE AND RELOAD
            var responseData = xhttp.responseText;
            if(responseData=="loggedOut"){
                alert("Logged out successfully")
                sessionStorage.clear();
                location.reload();
            }
        }
    };
    // SEND GET REQUEST
    xhttp.open("GET", "/logout", true);
    xhttp.send();
}

// LOAD SEARCH RESULTS
function loadSearchResults(){
    // SET UP NEW REQUEST
    let xhttp = new XMLHttpRequest();
    let search_tag= document.getElementById("search-tag").value;
    // CREATE OBJECT WITH SEARCH TAG
    let searchObject={
        search_tag:search_tag
    };
    xhttp.onreadystatechange = (event)=> {
        // DISPLAY THE SEARCH QUESTION RESULTS
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            console.log("Search successful"); 
            var responseData = xhttp.responseText;
            displaySearchQuestions(responseData);           
        }
    };
    // SEND POST REQUEST AND DATA IN JSON
    xhttp.open("POST", "/search", true);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send(JSON.stringify(searchObject));
}

// DISPLAY THE SEARCH RESULTS ON SCREEN
function displaySearchQuestions(jsonSearchQuestions){
    // BUILD HTML STRING
    let searchQueArr = JSON.parse(jsonSearchQuestions);
    let htmlStr = "";

    // LOOP TO GET ALL RESULTS
    for(let key in searchQueArr){
        htmlStr += '<div class="question">';
        htmlStr += '<h3>'+searchQueArr[key].user_name+'</h3>';
        htmlStr += '<h4 id="module-name">'+searchQueArr[key].module_name+'</h4>';
        htmlStr += '<p id="questionPost">'+searchQueArr[key].question_text+'</p>';
        htmlStr += "</div>";
        
    }
    document.querySelector("#search-results").innerHTML = htmlStr;
}