import os
from structural_papers import structural_papers
from instagrapi import Client
from instagrapi.exceptions import LoginRequired

def post_to_instagram():
    INSTAGRAM_USERNAME = os.environ.get('INSTAGRAM_USERNAME')
    INSTAGRAM_PASSWORD = os.environ.get('INSTAGRAM_PASSWORD')

    # Create the image and get the caption
    caption = structural_papers()

    # Create a Instagram client instance
    instagram_client = Client()

    try:
        # Login to Instagram
        instagram_client.login(INSTAGRAM_USERNAME, INSTAGRAM_PASSWORD)
        
        # Upload a photo with a caption
        instagram_client.photo_upload("output.jpg", caption=caption)
        
    except LoginRequired:
        print("Login required. Please check your credentials.")
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        # Logout from Instagram
        instagram_client.logout()

        # Delete output.jpg file once done
        if os.path.exists("output.jpg"):
            os.remove("output.jpg")
        else:
            print("The file does not exist")

if __name__ == "__main__":
    post_to_instagram()