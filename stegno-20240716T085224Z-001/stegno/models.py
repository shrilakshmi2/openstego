from django.db import models

# Create your models here.

class stegoimg(models.Model):
    name=models.TextField()
    img=models.ImageField(upload_to='static/images/')
    password=models.TextField()