from PIL import Image, ImageDraw, ImageFont
import textwrap
import os

LOCALHOST = os.environ.get('LOCALHOST')
folder_prefix = ''
# if LOCALHOST != "true":
#    folder_prefix = 'instagram-publisher/'

def generate_image_from_text(text, background_color, text_color, img_width, img_height):
    """Generates a 1080x1080 pixel image with the specified text.

    Args:
        text: The text to be displayed on the image.
        background_color: The background color of the image (RGB tuple).
        text_color: The color of the text (RGB tuple).
        font_path: The path to the font file to be used.
        output_path: The path where the output image will be saved.
    """
    # Select font file
    font_path = f'{folder_prefix}fonts/coolvetica rg.otf'

    # Create a new image
    img = Image.new('RGB', (img_width, img_height), background_color)

    # Draw the text onto the image
    draw = ImageDraw.Draw(img)
    font_size = 80

    # Wrap text to fit within the image width
    max_width = img_width * 0.9  # Slightly less than img_width to account for padding
    max_height = img_height * 0.9
    text_block_height = max_height + 1

    while text_block_height > max_height:
      font = ImageFont.truetype(font_path, font_size)
      
      # Calculate the average character width
      average_char_width = draw.textlength("J", font=font)  # Width of an average character
      max_chars_per_line = max_width // average_char_width

      # Wrap text based on the number of characters that fit in the max_width
      wrapped_text = textwrap.fill(text, width=max_chars_per_line)

      # Split wrapped text into lines
      lines = wrapped_text.splitlines()
      line_spacing = 10  # Space between lines

      # Measure the height of the text block to vertically center it
      line_heights = [draw.textbbox((0, 0), line, font=font)[3] for line in lines]
      text_block_height = sum(line_heights) + line_spacing * (len(lines) - 1)
      y_offset = (1080 - text_block_height) // 2

      # Ensure that the text block will fit in the image if not reduce the font size
      if text_block_height > max_height:
          font_size -= 1

    # Draw each line centered horizontally
    for line, line_height in zip(lines, line_heights):
        line_width = draw.textbbox((0, 0), line, font=font)[2]
        x = (1080 - line_width) // 2  # Define x within the loop for each line
        draw.text((x, y_offset), line, fill=text_color, font=font)
        y_offset += line_height + line_spacing

    # Save the image
    img.save('output.jpg')

def generate_image_from_image(image_path, img_width, img_height):
  image = Image.open(image_path, 'r')
  image_size = image.size
  width = image_size[0]
  height = image_size[1]

  aspect_ratio = width/height

  # Resize image
  if width > img_width | height > img_height:
    if aspect_ratio > img_width / img_height:
      # Width of the image is higher than the img_width requirement.
      image = image.resize((int(img_width), int(img_width / aspect_ratio)))
    else:
      # Height of the image is higher than the img_height requirement.
      image = image.resize((int(img_height * aspect_ratio), int(img_height)))

  image_size = image.size
  width = image_size[0]
  height = image_size[1]

  # Provide a white background to the image to make it square
  if(width != height):
    bigside = width if width > height else height

    background = Image.new('RGB', (bigside, bigside), (255, 255, 255, 255))
    offset = (int(round(((bigside - width) / 2), 0)), int(round(((bigside - height) / 2),0)))

    background.paste(image, offset)
    background.save('output.jpg')
    print("Image has been resized !")

  else:
    print("Image is already a square, it has not been resized !")

if __name__ == "__main__":
    # generate_image_from_text(text, background_color, text_color, output_path, 1080, 1080)
    generate_image_from_image(1080, 1080)
