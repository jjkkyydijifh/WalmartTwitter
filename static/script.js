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

    conn = psycopg2.connect(os.environ.get("DATABASE_URL") or "postgresql://postgres:yourpassword@localhost:5432/postgres",sslmode="require")
    cursor = conn.cursor()

    cursor.execute("""
        SELECT t.id, t.text, t.likes, t.dislikes, t.date,
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
 conn = psycopg2.connect(os.environ.get("DATABASE_URL") or "postgresql://postgres:yourpassword@localhost:5432/postgres",sslmode="require")
 cursor = conn.cursor()
 cursor.execute("INSERT INTO tweets (text, likes, dislikes, date) VALUES (%s, %s, %s, %s) RETURNING id", [text, 0, 0, TIME])
 x = cursor.fetchone()

 conn.commit()
 conn.close()
 return jsonify({ "id": x[0], "time": TIME.isoformat()})


@app.route("/api/update_post", methods=["POST"])
def update_post():
    user_id = request.cookies.get("user_id")
    post_id = int(request.form.get("postID"))
    liked = request.form.get("likes") == "true"
    with open("blanktext.txt", "w") as f:
        print(liked, file=f)
    conn = psycopg2.connect(os.environ.get("DATABASE_URL") or "postgresql://postgres:yourpassword@localhost:5432/postgres",sslmode="require")
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
            "UPDATE tweets SET likes = likes + 1 WHERE id = %s", (post_id)
        )
    else:
        cursor.execute(
            "UPDATE tweets SET dislikes = dislikes + 1 WHERE id = %s", (post_id)
        )

    conn.commit()
    conn.close()

    return "ok"

if __name__ == "__main__":
    app.run(debug=True)
