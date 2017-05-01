const users = require("mongoskin").db("mongodb://localhost:27017/rentshare", { w : 1 }).collection("users")
const ToObjectID = require("mongoskin").helper.toObjectID;

exports.AddNewUser = function (user) {
    return new Promise(function (resolve, reject) {
        users.insert(user, function (err, result) {
            if (err) {
                reject(err);
            }
            else {
                resolve(result);
            }
        });
    });
}

exports.GetUserByUserNameAndPassword = function (userName, password) {
    return new Promise(function (resolve, reject) {
        users.find({userName:userName, password:password}).toArray(function (err, result) {
            if (err) {
                reject(err);
            }
            else {
                if(result&&result.length>0) {
                    resolve(result[0]);
                }
                else {
                    resolve(false);
                }
            }
        });
    });
}

exports.GetUserById = function (id) {
    id = ToObjectID(id);
    return new Promise(function (resolve, reject) {
        users.findById(id, function (err, result) {
            if (err) {
                reject(err);
            }
            else {
                resolve(result);
            }
        });
    });
}

exports.GetUserByUserName = function (userName) {
    return new Promise(function (resolve, reject) {
        users.findOne({userName:userName}, function (err, user) {
            if (err) {
                reject(err);
            }
            else {
                resolve(user);
            }
        });
    });
}