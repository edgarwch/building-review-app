import os

def change(original_extenstion, new_extension, directory):
    for filename in os.listdir(directory):
        if filename.endswith(original_extenstion):
            base = os.path.splitext(filename)[0]
            new_name = base + "." + new_extension
            os.rename(os.path.join(directory, filename), os.path.join(directory, new_name))
def main(args, **kwargs):
    change(args[0], args[1], args[2])
if __name__ == "__main__":
    import sys
    main(sys.argv[1:])