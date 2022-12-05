from rest_framework.status import (
    HTTP_200_OK
)
from rest_framework.response import Response
from rest_framework.decorators import api_view

from django.db import connections
from modules.funciones import dictfetchall

@api_view(["POST"])
def lista(request):
    # Metodo para obtener la lista de rol
    
    query = """
        SELECT * FROM p_rol_b();    
    """
    with connections['default'].cursor() as cursor:
        cursor.execute(query)
        roles = dictfetchall(cursor)
        if roles:
            total_registros = roles[0].get("total", 0) if roles[0].get("total", 0) else 0
        else:
            total_registros = 0
    
    return Response(
        dict(
            exito=True,
            mensaje="Datos encontrados.",
            recordsFiltered=total_registros,
            recordsTotal=total_registros,
            data=roles
        ),
        status=HTTP_200_OK
    )
