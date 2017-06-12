# -*- coding : utf-8 -*-

import path_helper as ph
import file_updater as fu
import log


root_path = ph.get_root_path()

all_java_files = ph.list_all_java_file(root_path)

log.log(len(all_java_files))

for java_file in all_java_files:
    log.i("Modifying: ", java_file)
    fu.update_file(java_file)