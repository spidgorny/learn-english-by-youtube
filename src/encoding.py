# https://stackoverflow.com/questions/492483/setting-the-correct-encoding-when-piping-stdout-in-python

from dotenv import load_dotenv
load_dotenv()

import sys, locale, os
print(sys.stdout.encoding)
print(sys.stdout.isatty())
print(locale.getpreferredencoding())
print(sys.getfilesystemencoding())
print(os.environ["PYTHONIOENCODING"])
print(chr(246), chr(9786), chr(9787))
