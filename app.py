#conn = psycopg2.connect(os.environ.get("DATABASE_URL") or "postgresql://postgres:yourpassword@localhost:5432/postgres",sslmode="require")

from flask import Flask, render_template, jsonify, request, redirect
import psycopg2
import math
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import uuid
from flask import make_response
import os
from datetime import datetime, timezone

# Get current UTC time (timezone-aware)



app = Flask(__name__)

limiter = Limiter(get_remote_address, app=app)



# Database initialization

#rate_limit

@app.errorhandler(429)
def ratelimit_handler(e):
    return jsonify({
        "error": "You are being rate limited. Slow down."
    }), 429


# Routes
@app.route("/")
def index():
    user_id = request.cookies.get("user_id")

    if not user_id:
        user_id = str(uuid.uuid4())

    resp = make_response(render_template("index.html"))
    resp.set_cookie("user_id", user_id)

    return resp

@app.route("/api/posts")
def get_posts():
    user_id = request.cookies.get("user_id")

    conn = psycopg2.connect(host = 'localhost' , dbname='postgres' , user='postgres' , password='Changeme1')
    cursor = conn.cursor()

    cursor.execute("""
        SELECT t.id, t.text, t.likes, t.dislikes, t.date, t.reports,
        EXISTS (
            SELECT 1 FROM likes l
            WHERE l.post_id = t.id AND l.user_id = %s
        ) as liked
        FROM tweets t
    """, (user_id,))

    results = cursor.fetchall()
    conn.close()

    return jsonify(results)
@app.route("/editor")
def editor_page():
 return render_template("editor.html")

@app.route("/api/create_post", methods=["POST"])
@limiter.limit("5 per minute")
@limiter.limit("50 per hour")
def create_post():
 text = request.form.get("text")
 post_id = request.form.get("postID")
 TIME = datetime.now(timezone.utc)
 print(post_id)
 conn = psycopg2.connect(host = 'localhost' , dbname='postgres' , user='postgres' , password='Changeme1')
 cursor = conn.cursor()
 cursor.execute("INSERT INTO tweets (text, likes, dislikes, date, reports) VALUES (%s, %s, %s, %s, %s) RETURNING id", [text, 0, 0, TIME, 0])
 x = cursor.fetchone()

 conn.commit()
 conn.close()
 return jsonify({ "id": x[0], "time": TIME.isoformat()})


@app.route("/api/update_post", methods=["POST"])
def update_post():
    user_id = request.cookies.get("user_id")
    post_id = int(request.form.get("postID"))
    liked = request.form.get("likes") == "true"
    
    conn = psycopg2.connect(host = 'localhost' , dbname='postgres' , user='postgres' , password='Changeme1')
    cursor = conn.cursor()

    # check if already interacted with 
    cursor.execute(
    "SELECT 1 FROM likes WHERE user_id = %s AND post_id = %s",
    (user_id, post_id)
)
    
    exists = cursor.fetchone()

    if exists:
        return "Already reacted", 400

    # mark as reacted (using likes table as a generic tracker)
    cursor.execute(
        "INSERT INTO likes (user_id, post_id) VALUES (%s, %s)",
        (user_id, post_id)
    )

    if liked:
        cursor.execute(
            "UPDATE tweets SET likes = likes + 1 WHERE id = %s", (post_id,)
        )
    else:
        cursor.execute(
            "UPDATE tweets SET dislikes = dislikes + 1 WHERE id = %s", (post_id,)
        )

    conn.commit()
    conn.close()

    return "ok"

@app.route("/api/report_post", methods=["POST"])
def report_post():
    user_id = request.cookies.get("user_id")
    post_id = int(request.form.get("postID"))
    print(str(post_id) + ": this is the id++++++++++++++++++++++++++++++++++++++++++++++++")
    conn = psycopg2.connect(host = 'localhost' , dbname='postgres' , user='postgres' , password='Changeme1')
    cursor = conn.cursor()

    # check if already interacted with 
    cursor.execute(
    "SELECT 1 FROM reported WHERE user_id = %s AND post_id = %s",
    (user_id, post_id)
)
    
    exists = cursor.fetchone()

    if exists:
        return "Already reacted", 400

    # mark as reacted (using likes table as a generic tracker)
    cursor.execute(
        "INSERT INTO reported (user_id, post_id) VALUES (%s, %s)",
        (user_id, post_id)
    )

    
    cursor.execute("UPDATE tweets SET reports = reports + 1 WHERE id = %s", (post_id,))
 
        

    conn.commit()
    conn.close()

    return "ok"


@app.route("/api/add_comments", methods=["POST"])
def add_comments():
    try:
        user_id = request.cookies.get("user_id")
        post_id = int(request.form.get("postID"))
        comment = request.form.get("comment")
        print(post_id)
        conn = psycopg2.connect(host = 'localhost' , dbname='postgres' , user='postgres' , password='Changeme1')
        cursor = conn.cursor()
        
        cursor.execute("UPDATE tweets SET comments = array_append(comments, %s) WHERE id = %s",(comment,post_id))
        
        conn.commit()
        conn.close()

        return "ok"
    except Exception as e:
        return jsonify({"its fubernucked": str(e)}), 500



@app.route("/api/comments", methods=["GET"])
def get_comments():
    #user_id = request.cookies.get("user_id")
    post_id = int(request.args.get("post_id"))

    conn = psycopg2.connect(host = 'localhost' , dbname='postgres' , user='postgres' , password='Changeme1')
    cursor = conn.cursor()

    cursor.execute("""SELECT comments FROM tweets WHERE id=%s""",(post_id,))

    results = cursor.fetchall()
    conn.close()
    return jsonify(results)



if __name__ == "__main__":
    app.run(debug=True)
