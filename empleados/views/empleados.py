from django.shortcuts import render


# vistas

def index(request):
    template_name = "empleados/index.html"
    context = dict(
        empleados=True
    )    
    return render(request, template_name, context)

