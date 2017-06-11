# -*- coding: utf-8 -*-


METHOD_ANNOTATION_MAP = {
    "onEvent": "@Subscrible",
    "onEventAsync": "@Subscrible(threadMode = ThreadMode.ASYNC)",
    "onEventBackground": "@Subscribe(threadMode = ThreadMode.BACKGROUND)",
    "onEventMainThread": "@Subscribe(threadMode = ThreadMode.MAIN)"
}


PACKAGE_REPLACE_MAP = {
}


def should_add_annotation(line):
    pass
