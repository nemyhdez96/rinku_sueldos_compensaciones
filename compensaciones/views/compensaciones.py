from django.shortcuts import render
from compensaciones.modules.variables_constantes import *

# Create your views here.
def index(request):
    template_name = "compensaciones/index.html"
    context = dict(
        compensaciones=True
    )  
    print("SUELDO_BASE ", SUELDO_BASE)
    print("BONO_HORAS ", BONO_HORAS)
    return render(request, template_name, context)