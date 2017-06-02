# -*- coding: utf-8 -*-

import sys
from os import listdir
from os.path import join, isfile

def get_root_path():

    argv = sys.argv

    if len(argv) > 1:
        root_path = argv[1]
    else:
        root_path = argv[0]

    return root_path


def is_java_file(file_path):
    pass


def list_java_file(dir_path):
    return [f for f in listdir(dir_path) if is_java_file(join(dir_path, f))]


def list_dir(dir_path):
    return [f for f in listdir(dir_path) if not isfile(join(dir_path, f))]