# -*- coding : utf-8 -*-

DEBUG_MODE = True

def print_file(file_path):
    with open(file_path) as f:
        for line in f:
            print line


def log(msgs):
    print msgs


def i(*msgs):
    print msgs


def d(*msgs):
    if not DEBUG_MODE:
        return
    else:
        print msgs
