from flask import Flask
from flask import render_template
import pymysql
import random


app = Flask(__name__)

#Connect to DB
db = pymysql.connect(host='XXX.XXX.XX.XXX', port=XXXX, user='user', passwd='pwd', db='db_name', charset='utf8')
cursor = db.cursor()
sql: str = "SELECT id,question,description FROM question"

qlist = []
qlist_n = []
qdescription = []
# test = {}
# tt = {}


try:
    cursor.execute(sql)
    results = cursor.fetchall()
    for row in results:
        cid = row[0]
        question = row[1]
        qlist.append(question)
        description = row[2]
        qdescription.append(description)
        for i in qlist:
            if i not in qlist_n:
                qlist_n.append(i) #去掉重複題目

except:
    print("Error: unable to fetch data")
db.close()

game = dict(zip(qlist, qdescription))
print("tt", game, "\n", len(game))

words = list(game.items())
print(words)


@app.route('/')  # 根目錄
def index():  # view function
    app.debug = True
    return render_template("Game.html", input_from_python = words) #json.dumps(words)


# app.add_url_rule('/','index', index)
if __name__ == '__main__':
    app.debug = True
    app.jinja_env.auto_reload = True
    app.run()
