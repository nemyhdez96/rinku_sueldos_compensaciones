from django.urls import path
from compensaciones.views.compensaciones import *
from compensaciones.web_service.compensaciones import *

app_name = 'compensaciones'

URL_VIEWS = [
    path('index', index, name='index'),
]

URL_WS = [
    path('lista/', lista, name='lista'),
    path('crear/', crear, name='crear'),
    # path('eliminar/', eliminar, name='eliminar'),
]

urlpatterns = URL_VIEWS + URL_WS