import os

def test():
    INSTAGRAM_USERNAME = os.environ.get('INSTAGRAM_USERNAME')
    print("Something " + INSTAGRAM_USERNAME)

if __name__ == "__main__":
    test()