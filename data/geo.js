const cities = require("mongoskin").db("mongodb://localhost:27017/rentshare", { w : 1 }).collection("cities")
//const ToObjectID = require("mongoskin").helper.toObjectID;

exports.GetAllIsraelyCities = function () {
    return new Promise(function (resolve, reject) {
        cities.find({},{name:1}).toArray(function (err, result) {
            if (err) {
                reject(err);
            }
            else {
                resolve(result);
            }
        });
    });
}

exports.GetIsraelyCityByName = function (name) {
    return new Promise(function (resolve, reject) {
        cities.findOne({name:name}, function (err, result) {
            if (err) {
                reject(err);
            }
            else {
                resolve(result);
            }
        });
    });
}