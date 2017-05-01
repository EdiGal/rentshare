'use strict'
const userRepository = require('../data/users');;
exports.RegisterNewUser = async function(username, password) {
    let existUser;
    try {
        existUser = await userRepository.GetUserByUserName(username);
    }
    catch(e) {
        return Promise.reject('err')
    }

    if(existUser) {
        return Promise.reject();
    }
    else {
        let newUser = {
            userName:username,
            password,
            _registered:new Date(),
        };
        let insertResult;
        try {
            insertResult = await userRepository.AddNewUser(newUser);
        } 
        catch(e) {
            return Promise.reject('err');
        }
        if(insertResult&&insertResult.result&&insertResult.result.ok==1) {
            let registeredUser = insertResult.ops[0];
            return Promise.resolve(registeredUser);
        }
        else {
            return Promise.reject('err');
        }
    }
}