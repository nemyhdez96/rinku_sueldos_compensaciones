from django.urls import path
from empleados.views.empleados import *
from empleados.web_service.empleados import *

app_name = 'empleados'

URL_VIEWS = [
    path('index/', index, name='index'),
]

URL_WS = [
    path('lista/', lista, name='lista'),
    path('crear_editar/', crear_editar, name='crear_editar'),
    path('eliminar/', eliminar, name='eliminar'),
]

urlpatterns = URL_VIEWS + URL_WS