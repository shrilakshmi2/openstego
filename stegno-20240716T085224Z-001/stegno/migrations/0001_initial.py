# Generated by Django 5.0.7 on 2024-07-12 19:06

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='stegoimg',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.TextField()),
                ('img', models.ImageField(upload_to='')),
                ('password', models.TextField()),
            ],
        ),
    ]
