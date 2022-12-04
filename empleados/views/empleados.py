from django.shortcuts import render
import time


# vistas

def index(request):
    template_name = "empleados/index.html"
    context = {
        "date" : time.strftime("%Y-%m-%d")
    }     
    return render(request, template_name, context)

