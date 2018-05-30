# -*- coding: utf-8 -*-

import requests
from requests.exceptions import ConnectionError
import re
from peewee import *
import datetime

def fetch_sudoku_from_http(year, month, day, nd = 0):
    '''
    fetch sudoku data
    :param year: number of year
    :param month: number of month
    :param day: number of day
    :param nd: number of difficulty, [0, 4]
    :return:
    '''
    sudoku_url = "http://www.cn.sudokupuzzle.org/an.php?nd=%d&y=%d&m=%d&d=%d" % (nd, year, month, day)
    resp = requests.get(sudoku_url)
    matcher = re.compile('tmda=\'(.*?)\'')
    result = matcher.findall(resp.content)
    return result[0]

def parse_puzzle(data):
    '''

    :param data: data string
    :return:
    '''
    pass

def parse_answer(data):
    '''
    parse answer
    :param data: data string
    :return:
    '''
    str_data = str(data)
    str_answer = str_data[81 : 81 + 81]
    str_puzzle = str_data[0 : 81]

    print str_answer

    for i in xrange(0, 81):
        row = i / 9
        col = i % 9
        index = 9 * row + 3 * (col % 3) + col / 3
        print "row=%d, col=%d, index=%d" % (row, col, index)

def print_sudoku_data():
    pass

# =========== SQLite ORM Model ================
db = SqliteDatabase('sudoku_database.db')

class BaseModel(Model):
    class Meta:
        database = db

class Level(BaseModel):
    level = IntegerField()
    label = TextField()

class Sudoku(BaseModel):
    data = TextField()
    from_date = DateField()
    level = ForeignKeyField(Level, backref='sudokus')

# =============================================

db.connect()
db.create_tables([Level, Sudoku])

level0 = Level.create(level=0, label='入门')
level1 = Level.create(level=1, label='初级')
level2 = Level.create(level=2, label='中级')
level3 = Level.create(level=3, label='高级')
level4 = Level.create(level=4, label='骨灰级')

level_map = {
    0: level0,
    1: level1,
    2: level2,
    3: level3,
    4: level4,
}

# start from 1995-4-26 to now
date1 = '1995-4-26'
date2 = '2018-5-29'
start = datetime.datetime.strptime(date1, '%Y-%m-%d')
end = datetime.datetime.strptime(date2, '%Y-%m-%d')
step = datetime.timedelta(days=1)
while start <= end:
    for nd, value in level_map.items():
        print start.date(), nd, "crawling..."

        tdma = ''
        try:
            tdma = fetch_sudoku_from_http(start.year, start.month, start.day, nd)
        except ConnectionError:
            print start.date(), nd, "connection error!"

        if tdma != None or tdma != '':
            Sudoku.create(data=tdma, from_date=start.date(), level=value)
            print "insert data successfully!"

    start += step


