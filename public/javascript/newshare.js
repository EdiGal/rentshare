let posts, user;
$(document).ready(()=>{
    posts = JSON.parse($('#posts').val())
    user = JSON.parse($('#user').val())
    AddPostsToView()
    $('#newsharebutton').click(function() {
        $.get('/share', {}, SetForm, 'html')
    })
    $('.deletepost').click(function() {
        let postId = $(this).attr('data-post-id');
        $.ajax({
            url:'/post/'+postId,
            method:'DELETE',
            success:()=>RemovePostFromDisplay(postId)
        })
    });

    $('#search-submit').click(DoSearch)
})

async function DoSearch(event){
    event.preventDefault();
    let fromRooms = (parseInt($('#from-rooms-search').val())||0)
    let toRooms = (parseInt($('#to-rooms-search').val())||15)
    if(fromRooms > toRooms) {
        let temp = toRooms;
        toRooms = fromRooms;
        fromRooms = temp;
    }
    let city = $('#city-search').val()
    if(city){
        $.get('/city/'+city, function(){
            $.post('/search', {city, fromRooms, toRooms}, posts=>DisplayFoundPosts(posts)).fail(()=>DangerAlertMessage('אירע שגיאה'))
        }).fail(()=>{
            DangerAlertMessage('עיר לא קיימת במאגר')
        })
    }
    else {
        DangerAlertMessage('לצורך חיפוש יש להזין עיר')
    }
}

function DisplayFoundPosts(foundPosts) {
    console.log(foundPosts.length+' posts found')
    $('tbody').empty()
    posts = foundPosts;
    AddPostsToView();
}

function SetForm(form) {
    $('#form-interact').empty();
    $('#form-interact').html(form);
}

function DoLogin() {
    let username = $('input.login#username').val();
    let password = $('input.login#password').val();
    $.post('/login',{username, password}, CloseLoginAndOpenNewShare);
}

function CloseLoginAndOpenNewShare() {
    $.get('/share', {}, SetForm, 'html');
}

function GetRegister() {
    $.get('/register', {}, SetForm, 'html');
}

function DoRegister() {
    let username = $('input.register#username').val();
    let password = $('input.register#password').val();
    let aprovepassword = $('input.register#aprovepassword').val();
    if(username && password && password === aprovepassword) {
        $.post('/register',{username, password}, ()=>{$.get('/share', {}, SetForm, 'html')}).fail(()=>{DangerAlertMessage('שם משתמש תפוס, נסו שם אחר.')});
    }
    else if(!username) {
        DangerAlertMessage('הזינו שם משתמש')
    }
    else if(!password) {
        DangerAlertMessage('הזינו סיסמה')
    }
    else {
        DangerAlertMessage('הסיסמה לא אומתה, נסו להקליד מחדש.')
    }
}

async function PostNewShareButton() {
    let newPost = await CheckFields();
    if(newPost) {
        $('#postnewrentsharebutton').attr('onclick','')
        $('#postnewrentsharebutton').click(()=>{
            UIkit.notification({ message:'אין צורך ללחוץ פעמיים\nהשיתוף שלך מתפרסם ברגעים אלו', status: 'primary', pos: 'top-center', timeout: 5000 });            
        })
        $.post('/post', newPost, ()=>{
            setTimeout(()=>{
                location.reload();
            }, 2000)
            UIkit.notification({ message:'תודה!', status: 'success', pos: 'top-center', timeout: 5000 });
        }).fail(()=>{
            $('#postnewrentsharebutton').unbind();
            $('#postnewrentsharebutton').attr('onclick','PostNewShareButton()')
            DangerAlertMessage('משהו השתבש');
        })
    }
}

function DangerAlertMessage(msg) {
    UIkit.notification({ message:msg, status: 'danger', pos: 'top-center', timeout: 5000 });
}

async function CheckFields() {
    let city = await CheckCity($('#newpost-city').val());
    let area = $('#newpost-area').val();
    let rooms = CheckRooms();
    let meter = CheckMeter();
    let cost = CheckCost();
    if(!city||!area||!rooms||!meter||!cost) {
        return false;
    }
    return { city, area, rooms, meter, cost }
}

function CheckRooms() {
    let rooms = parseInt($('#newpost-rooms').val());
    if(rooms && rooms>=1 && rooms<=15) {
        $('#newpost-rooms').css('border','1px solid #e5e5e5')
        return rooms;
    }
    else {
        DangerAlertMessage('מספר חדרים לא תקין');
        $('#newpost-rooms').css('border','5px solid #ffdddd')
        return false;
    }
}

function CheckMeter() {
    let meter = parseInt($('#newpost-meter').val());
    if(meter && meter>=10 && meter<=850) {
        $('#newpost-meter').css('border','1px solid #e5e5e5')
        return meter;
    }
    else {
        DangerAlertMessage('גודל לא תקין');
        $('#newpost-meter').css('border','5px solid #ffdddd')
        return false;
    }
}

function CheckCost() {
    let cost = parseInt($('#newpost-cost').val());
    if(cost && cost>=100 && cost<=25000) {
        $('#newpost-cost').css('border','1px solid #e5e5e5')
        return cost;
    }
    else {
        DangerAlertMessage('מחיר לא תקין');
        $('#newpost-cost').css('border','5px solid #ffdddd')
        return false;
    }
}

function CheckCity() {
    return new Promise((resolve, reject)=>{
        let city = $('#newpost-city').val();
        $.get('/city/'+city, ()=>{
            $('#newpost-city').css('border','1px solid #e5e5e5')
            resolve(city);
        }).fail(()=>{
            DangerAlertMessage('העיר שהוזנה אינה קיימת במאגר');
            $('#newpost-city').css('border','5px solid #ffdddd')
            resolve(null);
        })
    })
}

function AddPostsToView() {
    let html='';
    posts.splice(0,20).forEach(post=>{
        let minutes = (new Date(post.postDate).getMinutes())
        if(minutes < 10) {
            minutes='0'+minutes;
        }
        let postDateStr = (new Date(post.postDate)).getDate()+"/"+(new Date(post.postDate)).getMonth()+'/'+(new Date(post.postDate)).getFullYear()+' '+(new Date(post.postDate)).getHours()+':'+minutes;
        html += `<tr>
            <td style="text-align: center">${post.city}</td>
            <td style="text-align: center">${post.area}</td>
            <td style="text-align: center">${post.rooms}</td>
            <td style="text-align: center">${post.meter}</td>
            <td style="text-align: center">${post.cost}</td>
            <td style="text-align: center">${postDateStr}`;
        if(user.type == 'Admin'){
            html+=`<input class="delete" type="button" value="מחק">`
        }
        html+=`</td></tr>`
    })
    $('tbody').append(html);
}
