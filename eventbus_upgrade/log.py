# -*- coding : utf-8 -*-

def print_file(file_path):
    with open(file_path) as f:
        for line in f:
            print line


def print_files_name(files):
    for f in files:
        print f