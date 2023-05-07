//Database code that we are testing
let db = require('../database');

//Server code that we are testing
let server = require ('../server')

//Set up Chai library 
let chai = require('chai');
let should = chai.should();
let assert = chai.assert;
let expect = chai.expect;

//Set up Chai for testing web service
let chaiHttp = require ('chai-http');
chai.use(chaiHttp);

//Import the mysql module and create a connection pool 
const mysql = require('mysql');
const connectionPool = mysql.createPool({
    connectionLimit: 1,
    host: "localhost",
    user: "dg",
    password: "123456",
    database: "unihelp1",
    debug: false
});

//Wrapper for all database tests
describe('Database', () => {

    //Mocha test for addUser method in database module.
    describe('#addUser', () => {
        it('should add a user to the database', (done) => {
            //Mock response object for test
            let response= {};

            /* When there is an error response.staus(ERROR_CODE).json(ERROR_MESSAGE) is called
               Mock object should fail test in this situation. */
            response.status = (errorCode) => {
                return {
                    json: (errorMessage) => {
                        console.log("Error code: " + errorCode + "; Error message: " + errorMessage);
                        assert.fail("Error code: " + errorCode + "; Error message: " + errorMessage);
                        done();
                    }
                }
            };

            //Add send function to mock object. This checks whether function is behaving correctly
            response.send = () => {
                //Check that user has been added to database
                let sql = "SELECT user_name FROM user WHERE user_email='" + userEmail + "'";
                connectionPool.query(sql, (err, result) => {
                    if (err){//Check for errors
                        assert.fail(err);//Fail test if this does not work.
                        done();//End test
                    }
                    else{
                        //Check that user has been added
                        expect(result.length).to.equal(1);

                        //Clean up database
                        sql = "DELETE FROM user WHERE user_email='" + userEmail + "'";
                        connectionPool.query(sql, (err, result) => {
                            if (err){//Check for errors
                                assert.fail(err);//Fail test if this does not work.
                                done();//End test
                            }
                            else{
                                done();//End test
                            }
                        });
                    }
                });
            };

            //Create random user details
            let userName = Math.random().toString(36).substring(2, 15);
            let userPassword="1234";
            let userEmail = "test@email.com";
            let userType="Student";

            //Call function to add user to database
            db.addUser(userName, userEmail, userPassword,userType, response);
        });
    });

    //Mocha test for searchQuestions method in database module.
    describe('#searchQuestions', () => {
        it('should search a question from the database', (done) => {
            //Mock response object for test
            let response= {};

            /* When there is an error response.staus(ERROR_CODE).json(ERROR_MESSAGE) is called
               Mock object should fail test in this situation. */
            response.status = (errorCode) => {
                return {
                    json: (errorMessage) => {
                        console.log("Error code: " + errorCode + "; Error message: " + errorMessage);
                        assert.fail("Error code: " + errorCode + "; Error message: " + errorMessage);
                        done();
                    }
                }
            };

            //Add send function to mock object
            response.send = (result) => {
                //Convert result to JavaScript object
                let resObj = JSON.parse(result);

                //Check that an array of customers is returned
                resObj.should.be.a('array');

                //Check that appropriate properties are returned
                if(resObj.length > 1){
                    resObj[0].should.have.property('question_id');
                    resObj[0].should.have.property('user_id');
                    resObj[0].should.have.property('module_id');
                }

                //End of test
                done();
            }

            //Create search tag
            let search_tag="CST2120";

            //Call function to search questions from the database
            db.getSearchQuestions(search_tag, response);
        });
    });

    //Mocha test for getAllComments method in database module.
    describe('#getAllComments', () => {
        it('should get all comments from the database', (done) => {
            //Mock response object for test
            let response= {};

            /* When there is an error response.staus(ERROR_CODE).json(ERROR_MESSAGE) is called
               Mock object should fail test in this situation. */
            response.status = (errorCode) => {
                return {
                    json: (errorMessage) => {
                        console.log("Error code: " + errorCode + "; Error message: " + errorMessage);
                        assert.fail("Error code: " + errorCode + "; Error message: " + errorMessage);
                        done();
                    }
                }
            };

            //Add send function to mock object
            response.send = (result) => {
                //Convert result to JavaScript object
                let resObj = JSON.parse(result);

                //Check that an array of comments is returned
                resObj.should.be.a('array');

                //Check that appropriate properties are returned
                if(resObj.length > 1){
                    resObj[0].should.have.property('comment_id');
                    resObj[0].should.have.property('question_id');
                    resObj[0].should.have.property('user_id');
                    resObj[0].should.have.property('comment_text');
                }

                //End of test
                done();
            }

            //Call function to get all comments from database
            db.getAllComments(response);
        });
    });

});




//Wrapper for all web service tests
describe('Web Service', () => {

    //Test of GET request sent to /posts
    describe('/GET getAllPosts', () => {
        it('should GET all posts from database', (done) => {
            chai.request(server)
                .get('/posts')
                .end((err, response) => {
                    //Check the status code
                    response.should.have.status(200);

                    //Convert returned JSON to JavaScript object
                    let resObj = JSON.parse(response.text);

                    //Check that an array of posts is returned
                    resObj.should.be.a('array');

                    //Check that appropriate properties are returned
                    if(resObj.length > 1){
                        resObj[0].should.have.property('question_id');
                        resObj[0].should.have.property('user_id');
                        resObj[0].should.have.property('module_id');
                        resObj[0].should.have.property('question_text');
                    }

                    //End test
                    done();
                });
        });
    });


    // Test of POST request sent to /login
    describe('/POST login', () => {
        it('should get login user details', (done) => {
            // create a login object
            let loginObject={email:"riaz@gmail.com",password:"123456"};
            chai.request(server)
                .post('/login')
                .send(JSON.stringify(loginObject))
                .end((err, response) => {
                    //Check the status code
                    response.should.have.status(200);

                    //Convert returned JSON to JavaScript object
                    let resObj = response.text;
                    
                    //Check that appropriate properties are returned
                    if(resObj.length > 1){
                        resObj.user_id !== null;
                        resObj.user_name !== null;
                        resObj.user_email !== null;
                    }

                    //End test
                    done();
                });
        });
    });


});

