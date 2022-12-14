from django.shortcuts import render, HttpResponseRedirect
from django.urls import reverse
from compensaciones.modules.variables_constantes import *



def inicio(request):
    return HttpResponseRedirect(reverse('compensaciones:index'))
    
# Create your views here.
def index(request):
    template_name = "compensaciones/index.html"
    context = dict(
        compensaciones=True
    )
    return render(request, template_name, context)