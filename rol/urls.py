from django.urls import path
from rol.web_service.rol import lista

app_name = 'rol'

URL_VIEWS = [
    # path('index', index, name='index'),
]

URL_WS = [
    path('lista/', lista, name='lista'),
]

urlpatterns = URL_VIEWS + URL_WS
