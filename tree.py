import os

def print_tree(startpath, exclude_dirs):
    for root, dirs, files in os.walk(startpath):
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        level = root.replace(startpath, '').count(os.sep)
        indent = ' ' * 4 * (level)
        print(f'{indent}{os.path.basename(root)}/')
        subindent = ' ' * 4 * (level + 1)
        for f in files:
            print(f'{subindent}{f}')

print_tree(r'f:\phyto', {'.git', 'venv', '.dart_tool', 'build', '.idea', '__pycache__', 'android', 'ios', 'macos', 'linux', 'windows', 'web'})
