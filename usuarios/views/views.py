from django.shortcuts import render
import time

# Create your views here.



def index(request):

    template_name = "index.html"

    context = {

        "date" : time.strftime("%Y-%m-%d")

    }

    return render(request, template_name, context)