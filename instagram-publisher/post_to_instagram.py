import instabot
from dotenv import load_dotenv
import os
from structural_papers import structural_papers
from instagram.client import InstagramAPI
import requests
from imgurpython import ImgurClient
import json

def upload_image(image_path):
    """Uploads an image to the API.

    Args:
        image_data: The image data as a binary file, base64 string, or URL.
        name: The optional name of the file.
        expiration: The optional expiration time in seconds.

    Returns:
        The API response.
    """

    load_dotenv()
    imgbb_api_key = os.environ.get('imgbb_api_key')

    url = "https://api.imgbb.com/1/upload"

    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image file not found: {image_path}")

    with open(image_path, 'rb') as f:
        image_data = f.read()
        files = None
        if isinstance(image_data, bytes):
            files = {'image': (image_path, image_data, 'image/jpeg')}
        elif isinstance(image_data, str) and image_data.startswith('http'):
            files = {'image': (image_data.split('/')[-1], requests.get(image_data).content)}

        data = {'key': imgbb_api_key}
        
        data['expiration'] = 60 * 15

        response = requests.post(url, files=files, data=data)
        response.raise_for_status()

        data = response.json()

        return data['data']['url']


def post_to_instagram():
    load_dotenv()
    instagram_username = os.environ.get('instagram_username')
    instagram_password = os.environ.get('instagram_password')
    instagram_app_id = os.environ.get('instagram_app_id')
    instagram_app_secret = os.environ.get('instagram_app_secret')
    instagram_access_token = os.environ.get('instagram_access_token')

    # Create the image and get the caption
    caption = structural_papers()
    
    image_url = upload_image('output.jpg')

    # Posting to Instagram follows the documentation here: https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/content-publishing
    # Create the media container
    # Construct the request URL
    url = f"https://graph.instagram.com/v20.0/{instagram_app_id}/media"

    # Create the request payload (JSON data)
    payload = {"image_url": image_url}

    # Set headers with Content-Type
    headers = {"Content-Type": "application/json"}

    # Authenticate with access token (replace with appropriate authorization method)
    auth = f"Bearer {instagram_access_token}"

    try:
        # Send the POST request with authentication
        response = requests.post(url, headers=headers, data=payload, auth=auth)
        response.raise_for_status()  # Raise an exception for non-200 status codes

        # Handle successful response
        data = response.json()

        creation_id = data.id
        
        # Construct the request URL
        url = f"https://graph.instagram.com/v20.0/{instagram_app_id}/media_publish"

        # Create the request payload (JSON data)
        payload = {"creation_id": creation_id}

        # Set headers with Content-Type
        headers = {"Content-Type": "application/json"}

        # Authenticate with access token (replace with appropriate authorization method)
        auth = f"Bearer {instagram_access_token}"

        try:
            # Send the POST request with authentication
            response = requests.post(url, headers=headers, data=payload, auth=auth)
            response.raise_for_status()  # Raise an exception for non-200 status codes

            # Handle successful response
            data = response.json()
            print(data)

        except requests.exceptions.RequestException as e:
            print(f"Error publishing Instagram post: {e}")

    except requests.exceptions.RequestException as e:
        print(f"Error posting to Instagram: {e}")

if __name__ == "__main__":
    post_to_instagram()
