# -*- coding : utf-8 -*-

import path_helper as ph
import log

dir_stack = []
all_java_files = []

dir_stack.append(ph.get_root_path())

while len(dir_stack) > 0:
    path = dir_stack.pop()

    dirs, java_files = ph.list_dir_and_java_file(path)
    dir_stack.extend(dirs)
    all_java_files.extend(java_files)

print len(all_java_files)