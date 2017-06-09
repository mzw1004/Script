# -*- coding: utf-8 -*-

import sys
import log
from os import listdir
from os.path import join, isfile, splitext

JAVA_FILE_EXT = ".java"

def get_root_path():

    argv = sys.argv

    if len(argv) > 1:
        root_path = argv[1]
    else:
        root_path = argv[0]

    return root_path


def is_java_file(file_path):
    filename, file_ext = splitext(file_path)
    if JAVA_FILE_EXT == file_ext:
        return True
    else:
        return False


def ignore_hide_file(file_name):
    if (file_name.startswith(".")):
        return True
    elif (file_name == "build"):
        return True
    return False

def list_dir_and_java_file(dir_path):
    java_files = []
    dirs = []

    for file in listdir(dir_path):
        if (ignore_hide_file(file)):
            continue
        path = join(dir_path, file)

        if not isfile(path):
            dirs.append(path)
        elif is_java_file(path):
            java_files.append(path)

    return dirs, java_files