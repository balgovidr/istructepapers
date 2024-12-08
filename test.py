def test():
    load_dotenv()
    instagram_username = os.environ.get('INSTAGRAM_USERNAME')
    print(instagram_username)

if __name__ == "__main__":
    test()