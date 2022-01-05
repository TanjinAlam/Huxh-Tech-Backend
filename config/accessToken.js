const accessToken = require('jsonwebtoken')
const AuthModel = require('../app/model/AuthModel')
const authModelObject = new AuthModel()

module.exports = {

    validToken: async(req, res, next) => {
        let result
        // get request header authorization data
        // console.log("validation Token", req);
        // console.log("req.headers.authorization", req.headers.authorization);
        let authorizationHeader = req.headers.authorization
        if(!authorizationHeader) {
            authorizationHeader = req.query.token
        }
        

        // if header authorization exists
        if(authorizationHeader){
            // const token = req.headers.authorization.split(' ')[1] // Bearer <token>
            try{
                // verify makes sure that the token hasn't expired and has been issued by us
                result = accessToken.verify(authorizationHeader, process.env.JWT_SECRET)
                // Let's pass back the decoded token to the request object
                req.user = result
                // console.log("REQUSER",req.user);
                // set user data to the request body
                const user_info = await authModelObject.getUserInfoFromLoginAccess(req)
                //console.log("req.currentUser",user_info);

                // if user information not found
                if(user_info.status != 200){
                    return res.status(401).send(user_info)
                }

                // add user information to the request body
                // console.log(req.body)
                // if(req.body.hasOwnProperty["id"]){
                //     console.log(req.body["id"]);
                // }
                // else if (!(req.boy.hasOwnProperty["id"])){
                //     console.log("BODY DOES NOT HAVE ANY ID")
                // }
                // req.body.user_info = user_info
                req.currentUser = user_info
                //console.log("req.currentUser",req.currentUser);
                // console.log(req.currentUser);
                // We call next to pass execution to the subsequent middleware
                next()
            } catch (e) {
                // throw Error
                console.log('Invalid Token')
                res.status(401).send(e)
            }
        } else {
            result = {
                error: 'Authentication error. Token required.',
                status: 401
            }
            res.status(401).send(result)
        }
    }
}