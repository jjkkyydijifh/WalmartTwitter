$(document).ready(function() {
  
  get_tweets()
//for new tweets 
function make_a_tweet(text,likes,POEID){
  
  post_tweets(text,likes,POEID)
  

}

//just call posttweet with the old id
$("#post-submit").on('click', function() {
  make_a_tweet($("#post-text").val(), 0,"new");
});

$(document).on('click', '.like-button', function() {
  let count = $(this).siblings('.like-count');
  $(this).prop("disabled", true);
  $(this).siblings(".dislike-button").prop("disabled", true);
  console.log($(this).parent())
  console.log("you liked post number " + parseInt($(this).parent().attr('id').slice(4)))
  console.log("it has " + parseInt($(this).siblings('.like-count').text()) + " likes")
  update_tweets("true",parseInt($(this).parent().attr('id').slice(4)),count,$(this))
});

$(document).on('click', '.dislike-button', function() {
  let count = $(this).siblings('.dislike-count');
  $(this).prop("disabled", true);
  $(this).siblings(".like-button").prop("disabled", true);
  console.log($(this).parent())
  console.log("you disliked post number " + parseInt($(this).parent().attr('id').slice(4)))
  console.log("it has " + parseInt($(this).siblings('.like-count').text()) + " likes")
  update_tweets("false",parseInt($(this).parent().attr('id').slice(4)),count,$(this))
});

// for old tweets
function get_tweets() {
 $.ajax({
 url: "/api/posts",
 type: 'GET',

 success: function (response) {
  
  console.log(response)
  for (let index = 0; index < response.length; index++) {
    console.log(response[index])    
    
      let postHTML = `
    <div class="post" id="post`+ response[index][0] +`">
      <p class="content">${response[index][1]}</p>
      <div id="uhuh">

      <div id="likes">
      <button class="like-button" ${response[index][3] ? "disabled" : ""}>Like</button>
      <p>likes:</p>
      <p class="like-count">${response[index][2]}</p>
      </div> 

      <div id="dislikes">
      <button class="dislike-button" ${response[index][3] ? "disabled" : ""}>Dislike</button>
      <p>dislikes:</p>
      <p class="dislike-count">${response[index][3]}</p>
      </div>

      </div>
      <p class="date">posted on: ${(response[index][4].split(/[T\:\s]+/))[0]}</p>
      </div>
  `;

  $("body").append(postHTML);

  }
 
 },
 error: function(err) {
            console.error(err);
        }
 });
}

function post_tweets(text,likes,POEID) {
 $.ajax({
 url: "/api/create_post",
 type: 'POST',
 data: {
  text:text,
  likes:likes,
  date:"8/4/1423",
  postID: POEID
 },
 success: function (response) {
  console.log(response)

 

let postHTML = `
     <div class="post" id="post`+ response.id +`">
      <p class="content">${text}</p>
      <div id="uhuh">
      
      <div id="likes">
      <button class="like-button">Like</button>
      <p>likes:</p>
      <p class="like-count">0</p>
      </div> 

      <div id="dislikes">
      <button class="dislike-button">Dislike</button>
      <p>dislikes:</p>
      <p class="dislike-count">0</p>
      </div>

      </div>
      <p class="date">posted on: ${((response.time).split(/[T\:\s]+/))[0]}</p>
      </div>
  `;

  $("body").append(postHTML);
  
 },
 error: function(err) {
            console.error(err);
        }
 });
}

function update_tweets(liked, POEID, count, button){

  if (liked === "true"){
        count.text(parseInt(count.text()) + 1);
      } else {
        count.text(parseInt(count.text()) + 1);
}
  
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
            console.error(err);
            if (liked === "true"){
        count.text(parseInt(count.text()) - 1);
      } else {
        count.text(parseInt(count.text()) - 1);
}

let parent = button.parent();
    parent.find(".like-button").prop("disabled", false);
    parent.find(".dislike-button").prop("disabled", false);
        }
 });
}

})
