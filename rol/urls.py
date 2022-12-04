from django.urls import path
from rol.views.views import *

app_name = 'rol'

urlpatterns = [
    path('index/', index, name='index'),
    path('crear/', index, name='index'),
    # path('index/', index, name='index'),
]