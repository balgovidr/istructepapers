import random
import csv
from image_generator import *

def random_line_from_csv(filename):
  """Selects a random line from a CSV file, excluding the header.

  Args:
    filename: The name of the CSV file.

  Returns:
    A list representing the selected row.
  """

  with open(filename, 'r') as csvfile:
    reader = csv.reader(csvfile)
    # Skip the header row
    next(reader)
    # Get a list of all rows
    rows = list(reader)
    # Select a random row
    random_row = random.choice(rows)
    return random_row

def structural_papers():
    # Select if the post is going to be text or an image
    random_integer = random.randint(1, 3)
    purple = (101, 44, 179)
    white = (255, 255, 255)

    if random_integer > 1:
        # Post a text
        # Select a random row from the text_posts.csv
        post = random_line_from_csv('text_posts.csv')
        content = post[1]
        caption = post[2]

        # Randomly pick the text and background colours
        random_integer = random.randint(1, 2)

        if random_integer == 1:
           # Use a purple background
           background_color = purple
           text_color = white
        else:
           # Use a white background
           background_color = white
           text_color = purple

        # Generate the image
        generate_image_from_text(content, background_color, text_color, 1080, 1080)
    
    else:
       # Generate an image using one of the images
       # Select a random row from the image_posts.csv
        post = random_line_from_csv('image_posts.csv')
        image = post[0]
        caption = post[2]

        generate_image_from_image(f'images/{image}', 1080, 1080)
    
    # Modify the caption
    # Include the 'link in the bio' mention
    split_text = caption.split('#')
    message = split_text[0]
    split_text = caption.split(message)
    hashtags = split_text[1]

    # Add a space to the end of the message
    if message[-1] != ' ':
       message = message + ' '
    
    message = message + 'Check link in bio. '
    
    #Make sure that the structural engineering tag is in the list of hashtags
    exists = False
    for hashtag in hashtags.split('#'):
       if "structuralengineering" in hashtag or "structuralengineering " in hashtag:
          exists = True
    if exists == False:
       hashtags = hashtags + ' #structuralengineering'
    
    # Append the message and hashtag back together
    caption = message + hashtags

    return caption

if __name__ == "__main__":
   structural_papers()