const posts = require("mongoskin").db("mongodb://localhost:27017/rentshare", { w : 1 }).collection("rentshare")
const ToObjectID = require("mongoskin").helper.toObjectID;

exports.AddNewPost = function (post) {
    post.userId = ToObjectID(post.userId)
    return new Promise(function (resolve, reject) {
        posts.insert(post, function (err, result) {
            if (err) {
                reject(err);
            }
            else {
                resolve(result);
            }
        });
    });
}

exports.DeletePost = function (id) {
    id = ToObjectID(id)
    return new Promise(function (resolve, reject) {
        posts.remove({_id:id}, function (err, result) {
            if (err) {
                reject(err);
            }
            else {
                resolve(result);
            }
        });
    });
}

exports.GetPosts = function () {
    return new Promise(function (resolve, reject) {
        posts.find().sort({'postDate':-1}).toArray(function (err, result) {
            if (err) {
                reject(err);
            }
            else {
                resolve(result);
            }
        });
    });
}

exports.Search = function(city, fromRooms, toRooms){
    return new Promise((resolve, reject)=>{
        let conditions = {};
        if(city) {
            conditions.city = city;
        }
        if(fromRooms && toRooms) {
            conditions.rooms = {
                $gte: fromRooms,
                $lte: toRooms
            }
        }
        else if(toRooms) {
            conditions.room = {
                $lte: toRooms
            }
        }
        else if(fromRooms) {
            conditions.room = {
                $gte: fromRooms
            }
        }
        posts.find(conditions).toArray((err, result)=>{
            if(!err){
                resolve(result)
            }
        })
    })
}