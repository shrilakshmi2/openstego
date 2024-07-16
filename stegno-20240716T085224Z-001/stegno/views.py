from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
# Create your views here.
from .models import stegoimg
import os,time
import numpy as np
import cv2
from django.http import HttpResponse,JsonResponse
from io import BytesIO
from django.core.files.uploadedfile import InMemoryUploadedFile
import json,base64



@csrf_exempt
def home(request):
    return render(request,'home.html',{})

@csrf_exempt
def encode(request):
    # print(request.POST,request.FILES)
    if(request.method=='GET'):
        return HttpResponse("invalid type")
    x=request.FILES.get('file')
    #encoding stuff
    msg=request.POST['text']
    key=request.POST['key']
    img=hide_text_in_image(x,msg)
    # tosend=base64.b64encode(img.read()).decode('utf-8')
    stegoimg.objects.create(name=img.get('name'),password=key,img=img.get('file'))
    return JsonResponse({
        "name":img.get('name'),
    })
    


@csrf_exempt
def decode(req):
    if(req.method=='GET'):
        return HttpResponse("invalid type")
    file=req.FILES.get('file')
    if not file:
        return HttpResponse("nofile")
    f_name=file.name
    img=''
    try:
        img=stegoimg.objects.get(name=f_name)
    except:
        return JsonResponse({
        "status":'error_10983404_file',
        "text":''
    })
    password=req.POST.get('key')
    if(img.password!=password):
        return JsonResponse({
        "status":'error_90089_key',
        "text":''
    })
    text=decode_text_from_image(img.img)
    return JsonResponse({
        "status":'done',
        "text":text
    })
    
    
  
@csrf_exempt
def testing(request):
    # img=image_.objects.get(name='ccc')
    # decode_func(ig.image_file)
    pass




# functions for processing
def hide_text_in_image(image_file, text_to_hide):
    # Decode image data to numpy array
    nparr = np.frombuffer(image_file.read(), np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    # Convert the text to binary
    binary_text = ''.join(format(ord(char), '08b') for char in text_to_hide)

    # Calculate the maximum number of bits that can be hidden in the image
    max_capacity = image.shape[0] * image.shape[1] * 3 // 8

    if len(binary_text) > max_capacity:
        raise ValueError("Text is too long to be hidden in the image")

    # Embed the text into the image
    binary_text += '1111111111111110'  # Add a delimiter
    text_index = 0
    for row in image:
        for pixel in row:
            for color_channel in range(3):
                if text_index < len(binary_text):
                    pixel[color_channel] = pixel[color_channel] & 254 | int(binary_text[text_index])
                    text_index += 1

    # Encode the modified image back to bytes
    _, encoded_image = cv2.imencode('.png', image)

    # Create an InMemoryUploadedFile from encoded image bytes
    file_stream = BytesIO(encoded_image)
    f_name=f'enc_{time.time()*1000}.png'
    file = InMemoryUploadedFile(file_stream, None, f_name, 'image/png', file_stream.getbuffer().nbytes, None)

    return dict({"name":f_name,"file":file})


def decode_text_from_image(image_data):
    # Convert image data to numpy array
    nparr = np.frombuffer(image_data.read(), np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    binary_text = ''
    text = ''

    # Iterate through the pixels to extract the hidden binary text
    for row in image:
        for pixel in row:
            for color_channel in range(3):
                binary_text += str(pixel[color_channel] & 1)

                # Check for the delimiter (1111111111111110)
                if binary_text[-16:] == '1111111111111110':
                    text = binary_to_text(binary_text[:-16])
                    return text

# Function to convert binary text to ASCII text
def binary_to_text(binary_text):
    text = ''
    for i in range(0, len(binary_text), 8):
        byte = binary_text[i:i + 8]
        text += chr(int(byte, 2))
    return text