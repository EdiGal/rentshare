let postsRepository = require('../data/posts.js');
let geo = require('../data/geo.js')
exports.AddNewPost = post => postsRepository.AddNewPost(post);

exports.GetPosts = ()=>postsRepository.GetPosts();

exports.DeletePost = id=>postsRepository.DeletePost(id);

exports.Search = (cityName, fromRooms, toRooms) => {
    if(cityName) {
        return geo.GetIsraelyCityByName(cityName).then(city=>{
            if(city) {
                fromRooms = parseInt(fromRooms)||0
                toRooms = parseInt(toRooms)||15
                return postsRepository.Search(cityName, fromRooms, toRooms).then(posts=>posts);
            }
            else {
                return new Promise((resolve,reject)=>resolve([]))
            }
        })
    }
    else {
        return new Promise((resolve,reject)=>resolve([]))
    }
}