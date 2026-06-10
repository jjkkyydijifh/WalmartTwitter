$(document).ready(function() {
 
  get_tweets()
//for new tweets 
function make_a_tweet(text,likes,POEID,fileName){
 
  if($("#post-text").val() == ''){
    console.log("oui monseur")
  }else{
  post_tweets(text,likes,POEID,fileName)
  $("#post-text").val("")
  $(".char_count").text("0/180")
  }
  
}

//just call posttweet with the old id
$("#post-submit").on('click', function() {

  

   let file = $("#avatar")[0].files[0];
    console.log(file);
if (file) {

    let formData = new FormData();

    formData.append("avatar", file);

    $.ajax({
        url: "/api/upload_image",
        type: "POST",
        data: formData,
        processData: false,
        contentType: false,

        success: function(response) {
           console.log("Upload successful");
    console.log(response); // This will now show your clean filename string
    
    // Capture the server's clean filename variant
    let cleanName = response.filename;
    
    // Pass it cleanly to your tweet generator
    make_a_tweet($("#post-text").val(), 0, "new", cleanName);
        },

        error: function(err) {
            console.log("Upload failed");
            console.log(err.responseText);
        }
    });

}else{
  make_a_tweet($("#post-text").val(), 0,"new");
}

});

//word count
$('#post-text').on('input', function() {
    console.log('Value changed to: ' + ($(this).val()).length);
    $(".char_count").text((($(this).val()).length) + "/180")
});

$('#searchbar').on('input', function() {
 if ($('#searchbar').val() != "") {
    let search = $('#searchbar').val().toLowerCase();
    $('.post').each(function () {
        let content = $(this).find('.content').text().toLowerCase();
        console.log($(this).attr('id'));
        console.log(content);
        if (content.includes(search)) {
            $(this).show();
        } else {
            $(this).hide();
        }
    });
} else {
    $('.post').show();
}
   
});

//indacate if you can or cant post
$('#post-submit').mouseenter(function() {
  if($("#post-text").val() == ''){
    $(this).css('background-color', '#2c2e2d'); // Force base color on hover
  }else{
    $(this).css('background-color', '#708faf'); // Force base color on hover
  }
});

$('#post-submit').mouseleave(function() {
  
    $(this).css('background-color', '#5ab789'); // Force base color on hover
  
});

$(document).on('click', '.like-button', function() {
  let count = $(this).siblings('.like-count');
  $(this).prop("disabled", true);
  $(this).siblings(".dislike-button").prop("disabled", true);
  console.log($(this).parent())
  console.log("you liked post number " + parseInt((($(this).parent()).parent()).parent().attr('id').slice(4)))
  console.log("it has " + parseInt($(this).siblings('.like-count').text()) + " likes")
  update_tweets("true",parseInt((($(this).parent()).parent()).parent().attr('id').slice(4)),count,$(this))
});

$(document).on('click', '.dislike-button', function() {
  let count = $(this).siblings('.dislike-count');
  $(this).prop("disabled", true);
  $(this).siblings(".like-button").prop("disabled", true);
  console.log($(this).parent())
  console.log("you disliked post number " + parseInt((($(this).parent()).parent()).parent().attr('id').slice(4)))
  console.log("it has " + parseInt($(this).siblings('.dislike-count').text()) + " dislikes")
  update_tweets("false",parseInt((($(this).parent()).parent()).parent().attr('id').slice(4)),count,$(this))
});

$(document).on('click', '.report', function() {
  let count = $(this).find('.report_count');
  $(this).prop("disabled", true);
  let result = confirm("if you click okay you comfirm that you want to vote if this post should stay");
if (result) {

    let result2 = confirm("Are you sure you want to report this post. click okay to vote yes, and cancel to vote no");
if (result2) {
   this
  console.log("this person voted for this to go")
    report_tweets(parseInt((($(this).parent()).parent()).attr('id').slice(4)),count,$(this),('true'))
} else {
    console.log("this person voted for this to stay")
    report_tweets(parseInt((($(this).parent()).parent()).attr('id').slice(4)),count,$(this),('false'))
}


} else {
    console.log("nahin hai :(")
}

  
});

$(document).on('click', '#comment-submit', function() {
  let comment = $(this).siblings('#comment-text').val();
  let idpo = parseInt((($(this).parent()).parent()).attr('id').slice(4))
  console.log(idpo)
  add_comment(idpo,comment,$(this))
});

$(document).on('click', '#comment-toggle', function() {
  console.log("the comment button is clicked")
  let button2 = $(this);
  //console.log("im on!")
  if ($(this).siblings(".comment-content").is(':empty')) {
    // Div is empty
    let idpo = parseInt((($(this).parent()).parent()).attr('id').slice(4))
  console.log(idpo)
  get_comments(idpo).done(function(response){

    console.log(response)

for (let index = 0; index < (response[0][0]).length; index++) {
        
    
  let postHTML = `
      <p class='comment'> ${response[0][0][index]}</p>
  `;

  button2.siblings(".comment-content").append(postHTML);
  console.log("EEE")
      $(".comment").animate({margin: "7px"},400,"swing");
      console.log(button2.siblings(".comment-content").find(".comment_arrow"))
      button2.find(".comment_arrow").css('transform', 'rotate(180deg)');

  }

  })

}else{
  //remove all comments
  button2.find(".comment_arrow").css('transform', 'rotate(0deg)');

  $(".comment").animate({margin: "-11px"},1600,"swing",function(){
button2.siblings(".comment-content").empty();
console.log("alright cleaning up!")
  });

}
  });

function get_comments(postid) {

 return $.ajax({
    url: "/api/comments",
    type: 'GET',
    data:{
        post_id: postid
    },



    error: function(err) {
        console.error(err);
        
    }
 });

}

// for old tweets
function get_tweets() {
 

 $.ajax({
 url: "/api/posts",
 type: 'GET',

 success: function (response) {
  
  
  
  console.log(response)
  
  for (let index = 0; index < response.length; index++) {
    console.log("image = " + response[index][7])
    console.log("votes to remove: " + response[index][5])
    console.log("votes to not remove: " + response[index][6])
    let voter = ((response[index][5] + response[index][6]) + '/9 votes to remove have been cast')
    if((response[index][5] + response[index][6]) >= 9){
      if((response[index][5] > response[index][6])){
        console.log("remove this post")
      }else{
        voter = "the votes say this post will stay"
      }
    }


     get_comments(response[index][0]).done(function(response3){
let num_com = 0
    if(response3[0][0] != null){
      num_com = response3[0][0].length
    }

    console.log(response[index])    
    
      let postHTML = `
    <div class="post" id="post`+ response[index][0] +`">
      <p class="content">${response[index][1]}</p>
      <div id="uhuh">

      <div id="likes">
      <button class="like-button" ${response[index][6] ? "disabled" : ""}><?xml version="1.0" encoding="utf-8"?><svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 122.88 106.16" style="enable-background:new 0 0 122.88 106.16" xml:space="preserve"><style type="text/css">.st0{fill:#fff;}</style><g><path class="st0" d="M4.02,44.6h27.36c2.21,0,4.02,1.81,4.02,4.03v53.51c0,2.21-1.81,4.03-4.02,4.03H4.02 c-2.21,0-4.02-1.81-4.02-4.03V48.63C0,46.41,1.81,44.6,4.02,44.6L4.02,44.6z M63.06,4.46c2.12-10.75,19.72-0.85,20.88,16.48 c0.35,5.3-0.2,11.47-1.5,18.36l25.15,0c10.46,0.41,19.59,7.9,13.14,20.2c1.47,5.36,1.69,11.65-2.3,14.13 c0.5,8.46-1.84,13.7-6.22,17.84c-0.29,4.23-1.19,7.99-3.23,10.88c-3.38,4.77-6.12,3.63-11.44,3.63H55.07 c-6.73,0-10.4-1.85-14.8-7.37V51.31c12.66-3.42,19.39-20.74,22.79-32.11V4.46L63.06,4.46z"/></g></svg>
</button>
      
      <p class="like-count">${response[index][2]}</p>
      </div> 

      <div id="dislikes">
      <button class="dislike-button" ${response[index][6] ? "disabled" : ""}><?xml version="1.0" encoding="utf-8"?><svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"  viewBox="0 0 122.88 106.16"><style type="text/css">.st0{fill:#fff;}</style><g><path class="st0" d="M4.03,61.56h27.36c2.21,0,4.02-1.81,4.02-4.02V4.03C35.41,1.81,33.6,0,31.39,0H4.03C1.81,0,0,1.81,0,4.03 v53.51C0,59.75,1.81,61.56,4.03,61.56L4.03,61.56z M63.06,101.7c2.12,10.75,19.72,0.85,20.88-16.48c0.35-5.3-0.2-11.47-1.5-18.36 l25.15,0c10.46-0.41,19.59-7.9,13.14-20.2c1.47-5.36,1.69-11.65-2.3-14.13c0.5-8.46-1.84-13.7-6.22-17.84 c-0.29-4.23-1.19-7.99-3.23-10.88c-3.38-4.77-6.12-3.63-11.44-3.63H55.07c-6.73,0-10.4,1.85-14.8,7.37v47.31 c12.66,3.42,19.39,20.74,22.79,32.11V101.7L63.06,101.7L63.06,101.7z"/></g></svg></button>
      
      <p class="dislike-count">${response[index][3]}</p>
      </div>

      </div>
      <p class="date">posted on: ${(response[index][4].split(/[T\:\s]+/))[0]}</p>

      <div id="comments">
      
  <input id="comment-text" type="text" maxlength="180">
<button id="comment-submit">post comment</button>
<button id="comment-toggle">toggle comments<p class="comment_count">${num_com}</p><svg class="comment_arrow" xmlns="http://www.w3.org/2000/svg" width="150px" height="150px" viewBox="0 0 24 24" fill="none">
<path d="M15 11L12 8M12 8L9 11M12 8V16M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg></button>
<div class="comment-content"></div>

      </div>
      <button class="report"><p>${voter}</p><svg xmlns="http://www.w3.org/2000/svg" width="150px" height="150px" viewBox="0 0 24 24" fill="none">
<path d="M4.5 21V16M4.5 16V6.5C5.5 5.5 7 5 8.5 5C11.5 5 13.5 7.5 17.5 5.5V15.5C13.5 17.5 11.5 14.5 8.5 14.5C7.5 14.5 5.5 15 4.5 16Z" stroke="#ffffff">
</svg></button>
      </div>
  `;

  

  if((response[index][5] > response[index][6]) && ((response[index][5] + response[index][6]) >= 9)){
        console.log("remove this post")
  }else{
      $("body").append(postHTML);
  }
  
if(((response[index][5] + response[index][6]) < 9)){
      console.log('dont disable report')
  }else{
     console.log("disable report")
     console.log($("#post"+ response[index][0]).find(".report"))
     $("#post"+ response[index][0]).find(".report").prop("disabled", true);

  }  

  if(response[index][7] != 0){
    $(`<img src="/uploads/${response[index][7]}">`).insertAfter("#post" + response[index][0] + " > :eq(0)");
  }

  })

    
  }
 
 },
 error: function(err) {
            console.error(err);
        }
 });
}

function post_tweets(text,likes,POEID,imgname) {
  console.log(imgname)
 $.ajax({
 url: "/api/create_post",
 type: 'POST',
 data: {
  text:text,
  likes:likes,
  date:"8/4/1423",
  postID: POEID,
  img: imgname,
 },
 success: function (response) {
  console.log(response)

 

let postHTML = `

     <div class="post" id="post`+ response.id +`">
      <p class="content">${text}</p>
      
      <div id="uhuh">
      
      <div id="likes">
      <button class="like-button"><?xml version="1.0" encoding="utf-8"?><svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 122.88 106.16" style="enable-background:new 0 0 122.88 106.16" xml:space="preserve"><style type="text/css">.st0{fill:#fff;}</style><g><path class="st0" d="M4.02,44.6h27.36c2.21,0,4.02,1.81,4.02,4.03v53.51c0,2.21-1.81,4.03-4.02,4.03H4.02 c-2.21,0-4.02-1.81-4.02-4.03V48.63C0,46.41,1.81,44.6,4.02,44.6L4.02,44.6z M63.06,4.46c2.12-10.75,19.72-0.85,20.88,16.48 c0.35,5.3-0.2,11.47-1.5,18.36l25.15,0c10.46,0.41,19.59,7.9,13.14,20.2c1.47,5.36,1.69,11.65-2.3,14.13 c0.5,8.46-1.84,13.7-6.22,17.84c-0.29,4.23-1.19,7.99-3.23,10.88c-3.38,4.77-6.12,3.63-11.44,3.63H55.07 c-6.73,0-10.4-1.85-14.8-7.37V51.31c12.66-3.42,19.39-20.74,22.79-32.11V4.46L63.06,4.46z"/></g></svg>
</button>
      
      <p class="like-count">0</p>
      </div> 

      <div id="dislikes">
      <button class="dislike-button"><?xml version="1.0" encoding="utf-8"?><svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 122.88 106.16" style="enable-background:new 0 0 122.88 106.16" xml:space="preserve"><style type="text/css">.st0{fill:#fff;}</style><g><path class="st0" d="M4.03,61.56h27.36c2.21,0,4.02-1.81,4.02-4.02V4.03C35.41,1.81,33.6,0,31.39,0H4.03C1.81,0,0,1.81,0,4.03 v53.51C0,59.75,1.81,61.56,4.03,61.56L4.03,61.56z M63.06,101.7c2.12,10.75,19.72,0.85,20.88-16.48c0.35-5.3-0.2-11.47-1.5-18.36 l25.15,0c10.46-0.41,19.59-7.9,13.14-20.2c1.47-5.36,1.69-11.65-2.3-14.13c0.5-8.46-1.84-13.7-6.22-17.84 c-0.29-4.23-1.19-7.99-3.23-10.88c-3.38-4.77-6.12-3.63-11.44-3.63H55.07c-6.73,0-10.4,1.85-14.8,7.37v47.31 c12.66,3.42,19.39,20.74,22.79,32.11V101.7L63.06,101.7L63.06,101.7z"/></g></svg></button>
      
      <p class="dislike-count">0</p>
      </div>

      </div>
      <p class="date">posted on: ${((response.time).split(/[T\:\s]+/))[0]}</p>


       <div id="comments">
  <input id="comment-text" type="text" maxlength="180">
<button id="comment-submit">post comment</button>
<button id="comment-toggle">toggle comments<p class="comment_count">0</p></button>
<div class="comment-content"></div>
      </div>
      


<button class="report"><svg xmlns="http://www.w3.org/2000/svg" width="150px" height="150px" viewBox="0 0 24 24" fill="none">
<path d="M4.5 21V16M4.5 16V6.5C5.5 5.5 7 5 8.5 5C11.5 5 13.5 7.5 17.5 5.5V15.5C13.5 17.5 11.5 14.5 8.5 14.5C7.5 14.5 5.5 15 4.5 16Z" stroke="#ffffff">
</svg></button>

      </div>
  `;

  $("body").append(postHTML);

  if(imgname != 0){
    $(`<img src="/uploads/${imgname}">`).insertAfter("#post" + response.id + " > :eq(0)");
  }
  
 },
 error: function(err) {
            console.error(err);
            if (err.status === 429) {
        alert("You are posting too fast or attempting to spam the site.");
    }
        }
 });
}

function update_tweets(liked, POEID, count, button){

count.text(parseInt(count.text()) + 1);
  
$.ajax({
 url: "/api/update_post",
 type: 'POST',
 data: {
  likes:liked,
  postID: POEID
 },
 success: function (response) {
  console.log(response)
 },
 error: function(err) {
        console.log(err)
        count.text(parseInt(count.text()) - 1);
let parent = button.parent();
    parent.find(".like-button").prop("disabled", false);
    parent.find(".dislike-button").prop("disabled", false);
        }
 });
}

function report_tweets(POEID, count, button, vote){
 
$.ajax({
 url: "/api/report_post",
 type: 'POST',
 data: {
  postID: POEID,
  vote: vote
 },
 success: function (response) {
  console.log(response)
 },
 error: function(err) {
        console.log(err)
       
        button.prop("disabled", false);
    
        }
 });
}


})

function add_comment(POEID,comment,thing){

console.log(POEID,comment,thing)

$.ajax({
 url: "/api/add_comments",
 type: 'POST',
 data: {
  comment:comment,
  postID: POEID
 },
 success: function (response) {
  console.log(response)

let postHTML = `
      <p class='comment'> ${comment}</p>
  
  `;
    thing.siblings("#comment-toggle").find(".comment_count").text(parseInt(thing.siblings("#comment-toggle").find(".comment_count").text()) + 1)
    thing.siblings("#comment-text").val("")
    thing.siblings(".comment-content").append(postHTML)
 },
  error: function(err) {
        console.log(err)
        
        }
 });
  
}
