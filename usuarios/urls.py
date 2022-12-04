from django.urls import path
from usuarios.views.views import *

app_name = 'usuarios'

urlpatterns = [
    path('index/', index, name='index'),
    path('crear/', index, name='index'),
    # path('index/', index, name='index'),
]