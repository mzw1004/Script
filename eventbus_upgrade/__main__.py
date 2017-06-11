# -*- coding : utf-8 -*-

import path_helper as ph
import log


root_path = ph.get_root_path()

all_java_files = ph.list_all_java_file(root_path)

print len(all_java_files)
