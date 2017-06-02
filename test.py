#_*_ coding: utf-8 _*_
import sys

def parseArgv(argv):
    root_path = ""
    if len(argv) > 1:
        root_path = argv[1]
    else:
        root_path = argv[0]
    return root_path

def catFile(filepath):
    with open(filepath) as f:
        for line in f:
            print line

def main():
    _root_path = parseArgv(sys.argv)
    catFile(_root_path)

if __name__ == '__main__':
    main()
