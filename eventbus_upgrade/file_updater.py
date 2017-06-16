# -*- coding: utf-8 -*-

import log

METHOD_ANNOTATION_MAP = {
    "public void onEvent": "    @Subscribe\n",
    "public void onEventAsync": "    @Subscribe(threadMode = ThreadMode.ASYNC)\n",
    "public void onEventBackground": "    @Subscribe(threadMode = ThreadMode.BACKGROUND)\n",
    "public void onEventMainThread": "    @Subscribe(threadMode = ThreadMode.MAIN)\n"
}

PACKAGE_REPLACE_MAP = {
    "import de.greenrobot.event.EventBus;": "import org.greenrobot.eventbus.EventBus;\n"
}

PACKAGE_SUBSCRIBE = "import org.greenrobot.eventbus.Subscribe;\n"
PACKAGE_THREAD_MODE = "import org.greenrobot.eventbus.ThreadMode;\n"


def should_replace_package(line):
    line_copy = str(line)
    for before, after in PACKAGE_REPLACE_MAP.iteritems():
        if line_copy.find(before) != -1:
            return after
        else:
            continue
    return None


def should_add_annotation(line):
    line_copy = str(line)
    for method, annotation in METHOD_ANNOTATION_MAP.iteritems():
        method_pos = line_copy.find(method)
        comment_pos = line_copy.find("//")
        if method_pos != -1 and comment_pos == -1:
            return annotation
        elif method_pos != -1 and method_pos < comment_pos:
            return annotation
        else:
            continue
    return None


def has_annotation(line, annotation):
    line_copy = str(line)
    annotation_pos = line_copy.find(annotation)
    return annotation_pos != -1


def is_import_statement(line):
    line_copy = str(line)
    return line_copy.startswith("import ")


def update_file(file_path):
    lines = []

    with open(file_path) as file:
        should_add_package = False
        last_import_pos = 0

        for index, line in enumerate(file):
            if is_import_statement(line):
                last_import_pos = index

            # replace package name
            package = should_replace_package(line)
            if package is not None:
                line = line.replace(line, package)

            # add subscribe annotation
            annotation = should_add_annotation(line)
            if annotation is not None:
                if (not has_annotation(lines[index - 1], annotation)):
                    if (not should_add_package):
                        should_add_package = True
                    line = annotation + line

            lines.append(line)

        # add subscribe package
        if should_add_package:
            lines.insert(last_import_pos + 1, PACKAGE_SUBSCRIBE + PACKAGE_THREAD_MODE)

    with open(file_path, "w") as outfile:
        for line in lines:
            outfile.write(line)
