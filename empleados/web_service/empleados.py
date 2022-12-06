from rest_framework.status import (
    HTTP_200_OK
)
from rest_framework.response import Response
from rest_framework.decorators import api_view

from django.db import connections
from modules.funciones import dictfetchall
from empleados.modules.funciones import opciones_empleados

@api_view(["POST"])
def lista(request):
    # Metodo para obtener la lista de empleados
    empleado_id = request.data.get("empleado_id", -99) if request.data.get("empleado_id", -99) else -99
    empleado_nombre = request.data.get("empleado_nombre", '') if request.data.get("empleado_nombre", '') else ''
    empleado_paterno = request.data.get("empleado_paterno", '') if request.data.get("empleado_paterno", '') else ''
    empleado_materno = request.data.get("empleado_materno", '') if request.data.get("empleado_materno", '') else ''
    empleado_rol_id = request.data.get("empleado_rol_id", -99) if request.data.get("empleado_rol_id", -99) else -99
    empleado_numero = request.data.get("empleado_numero", '') if request.data.get("empleado_numero", '') else ''
    empleado_activo = True
    busqueda = request.data.get("search[value]", '') if request.data.get("search[value]", '') else ''
    start = request.data.get("start", 0) if request.data.get("start", 0) else 0
    limite = request.data.get("length", 10) if request.data.get("length", 10) else 10
    draw = request.data.get("draw", 1) if request.data.get("draw", 1) else 1 
    dict_param = dict(
     empleado_id=empleado_id,
     empleado_nombre=empleado_nombre,
     empleado_paterno=empleado_paterno,
     empleado_materno=empleado_materno,
     empleado_rol_id=empleado_rol_id,
     empleado_numero=empleado_numero,
     empleado_activo=empleado_activo,
     busqueda=busqueda,
     start=start,
     limite=limite
    )
    query = """
        SELECT * FROM 
        p_empleados_b(
            {empleado_id}, 
            '{empleado_nombre}', 
            '{empleado_paterno}', 
            '{empleado_materno}', 
            {empleado_rol_id}, 
            '{empleado_numero}', 
            {empleado_activo}, 
            '{busqueda}', 
            {limite}, 
            {start}
        );    
    """.format(**dict_param)
    with connections['default'].cursor() as cursor:
        cursor.execute(query)
        empleados = dictfetchall(cursor)
        if empleados:
            total_registros = empleados[0].get("total", 0) if empleados[0].get("total", 0) else 0
        else:
            total_registros = 0
        for elemento in empleados:
            elemento = opciones_empleados(elemento)
            elemento["nombre_completo"] = "{nombre} {paterno} {materno}".format(**elemento)
            if elemento["activo"]:
                elemento["activo"]="""<span class="label label-success">Activo</span>"""
            else:
                elemento["activo"]="""<span class="label label-danger">Desactivado</span>"""
    
    return Response(
        dict(
            exito=True,
            mensaje="Datos encontrados.",
            recordsFiltered=total_registros,
            recordsTotal=total_registros,
            draw=draw,
            data=empleados
        ),
        status=HTTP_200_OK
    )

@api_view(["POST"])
def crear_editar(request):
    # Metodo para crear y actualizar empleados
    mensaje = "Intentelo más tarde."
    try:
        empleado_id = request.data.get("empleado_id", None)
        empleado_nombre = request.data.get("empleado_nombre", None)
        empleado_paterno = request.data.get("empleado_paterno", None)
        empleado_materno = request.data.get("empleado_materno", '')
        empleado_rol_id = request.data.get("empleado_rol_id", None)
        if not empleado_id:
            if not empleado_nombre or not empleado_paterno or not empleado_rol_id:
                return Response(
                    dict(
                        exito=False,
                        mensaje="Valide los campos obligatorios.", 
                    ),
                    status=HTTP_200_OK
                )
            query_max_numero = """
                SELECT p_empleado_max_numero_b();    
            """
            with connections['default'].cursor() as cursor:
                cursor.execute(query_max_numero)
                no_empleado = cursor.fetchone()
                if no_empleado:
                    empleado_numero = str(no_empleado[0]).zfill(5)
                else:
                    empleado_numero = '1'.zfill(5)
            
            dict_query_crear = dict(
                empleado_nombre=empleado_nombre,
                empleado_paterno=empleado_paterno,
                empleado_materno=empleado_materno,
                empleado_rol_id=empleado_rol_id,
                empleado_numero=empleado_numero
            )
            query_crear = """
                select p_empleados_c(
                    '{empleado_nombre}', 
                    '{empleado_paterno}', 
                    '{empleado_materno}', 
                    {empleado_rol_id}, 
                    '{empleado_numero}'
                );
            """.format(**dict_query_crear)
            
            with connections['default'].cursor() as cursor:
                cursor.execute(query_crear)
                empleado_new = cursor.fetchone()
                empleado_id = empleado_new[0]
            mensaje = "Registro exitoso."
        else:
            dict_query_editar = dict(
                empleado_id=empleado_id,
                empleado_nombre=empleado_nombre,
                empleado_paterno=empleado_paterno,
                empleado_materno=empleado_materno,
                empleado_rol_id=empleado_rol_id,
            )
            query_editar = """
                select p_empleados_e(
                    {empleado_id},
                    '{empleado_nombre}', 
                    '{empleado_paterno}', 
                    '{empleado_materno}', 
                    {empleado_rol_id}
                );
            """.format(**dict_query_editar)
            with connections['default'].cursor() as cursor:
                cursor.execute(query_editar)
                empleado_actualizado = cursor.fetchone()
                empleado_id = empleado_actualizado[0]
            mensaje = "Actualización exitosa."
        
        dict_param = dict(
        empleado_id=empleado_id
        )
        query_empleado = """
            SELECT * FROM 
            p_empleados_b(empleado_id := {empleado_id});       
        """.format(**dict_param)
        with connections['default'].cursor() as cursor:
            cursor.execute(query_empleado)
            empleado = dictfetchall(cursor)    
        return Response(
            dict(
                exito=True,
                mensaje=mensaje, 
                empleado=empleado
            ),
            status=HTTP_200_OK
        )
    except Exception as e:
        return Response(
            dict(
                exito=False,
                mensaje=mensaje
            ),
            status=HTTP_200_OK
        )
        
@api_view(["POST"])
def eliminar(request):
    # Metodo para deshabilitar (eliminar) em pleado
    try:
        empleado_id = request.data.get("empleado_id", None)
        if not empleado_id:
            return Response(
                    dict(
                        exito=False,
                        mensaje="Regitro no encontrado.", 
                    ),
                    status=HTTP_200_OK
                )
        dict_query_eliminar = dict(
                empleado_id=int(empleado_id)
            )
        query_eliminar = """
            SELECT p_empleados_d(
                {empleado_id}
            );
        """.format(**dict_query_eliminar)
        with connections['default'].cursor() as cursor:
            cursor.execute(query_eliminar)
            empleado_eliminado = cursor.fetchone()
            empleado_id = empleado_eliminado[0]
        return Response(
            dict(
                exito=True,
                mensaje="Eliminado."
            ),
            status=HTTP_200_OK
        )
    except Exception as e:
        return Response(
            dict(
                exito=True,
                mensaje="Intentelo más tarde."
            ),
            status=HTTP_200_OK
        )