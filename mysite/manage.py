#!/usr/bin/env python
#coding:utf8
import os
import sys

if __name__ == "__main__":
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mysite.settings")

    from django.core.management import execute_from_command_line

    execute_from_command_line(sys.argv)
    #删除mysql部分内容
    #mysql  -uroot  -p cheungssh -e " delete  from auth_permission where id in (1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,78,79,80,81,82,83);"
    print '清除旧的码号'
