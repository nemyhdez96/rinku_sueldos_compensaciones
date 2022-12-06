from rest_framework.status import (
    HTTP_200_OK
)
from rest_framework.response import Response
from rest_framework.decorators import api_view

from django.db import connections
from modules.funciones import dictfetchall
from compensaciones.modules.funciones import opciones_compensaciones
from compensaciones.modules.variables_constantes import *

from json import loads


@api_view(["POST"])
def lista(request):
    # Metodo para la busqueda de compensaciones
    start = request.data.get("start", 0) if request.data.get("start", 0) else 0
    limite = request.data.get("length", 10) if request.data.get("length", 10) else 10
    draw = request.data.get("draw", 1) if request.data.get("draw", 1) else 1 
    busqueda = request.data.get("search[value]", '') if request.data.get("search[value]", '') else ''
    filtro = loads(request.data.get("filtro", "{}"))
    c_id = filtro.get("c_id", -99) if filtro.get("c_id", -99) else -999
    c_entrega=filtro.get("c_entrega", -99) if filtro.get("c_entrega", -99) else -99
    c_mes=filtro.get("c_mes", -99) if filtro.get("c_mes", -99) else -99
    c_empleado_id=filtro.get("c_empleado_id", -99) if filtro.get("c_empleado_id", -99) else -99
    e_rol_id=filtro.get("e_rol_id", -99) if filtro.get("e_rol_id", -99) else -99
    dict_parametros = dict(
        c_id=c_id,
        c_entrega=c_entrega,
        c_mes=c_mes,
        c_empleado_id=c_empleado_id,
        e_rol_id=e_rol_id,
        busqueda=busqueda
    )
    query_compensaciones = """
        select * from p_conpensaciones_b(
        c_id := {c_id},
        c_entrega := {c_entrega},
        c_mes := {c_mes},
        c_empleado_id := {c_empleado_id},
        e_rol_id := {e_rol_id},
        busqueda := '{busqueda}',
        limite := 10,
        start := 0
        );
    """.format(**dict_parametros)
    with connections['default'].cursor() as cursor:
        cursor.execute(query_compensaciones)
        compensaciones = dictfetchall(cursor)
        if compensaciones:
            total_registros = compensaciones[0].get("total", 0) if compensaciones[0].get("total", 0) else 0
        else:
            total_registros = 0
        for elemento in compensaciones:
            elemento = opciones_compensaciones(elemento)
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
            data=compensaciones
        ),
        status=HTTP_200_OK
    )

@api_view(["POST"])
def crear(request):
    entregas = int(request.data.get("c_cantidad", 0))
    rol_id = request.data.get("rol_id", None)
    rol_nombre = request.data.get("rol_nombre", None)
    mes = request.data.get("c_mes", None)
    empleado_id = request.data.get("empleado_id", None)
    if not mes or not rol_nombre or not entregas or not empleado_id:
        return Response(
        dict(
            exito=False,
            mensaje="Valide los campos obligatorios.",
        ),
        status=HTTP_200_OK
    )
    # sueldo base 30 por hora
    sueldo_base_mes = float(SUELDO_BASE)*float(HORAS)*float(DIAS)*float(SEMANAS)
    horas_trabajadas = float(HORAS)*float(DIAS)*float(SEMANAS)
    bono_entrega = float(BONO_ENTREGAS)*entregas
    if rol_nombre == "chofer":
        bono_hora_chofer = float(BONO_HORAS.split(",")[0])
        bono_hora = bono_hora_chofer*horas_trabajadas
    elif rol_nombre == "cargadores":
        bono_hora_cargadores = float(BONO_HORAS.split(",")[1])
        bono_hora = bono_hora_cargadores*horas_trabajadas
    else: 
        bono_hora = 0
    sueldo_mensual = sum((sueldo_base_mes, bono_entrega, bono_hora))
    sueldo_vales = sueldo_mensual * (float(VALES_DESPENSA)/100)
    sueldo_bruto = sum((sueldo_mensual, sueldo_vales))
    
    
    if sueldo_bruto > 10000:
        isr_adicional = sum((float(ISR),float(ISR_ADICIONAL)))
        isr = sueldo_bruto * (isr_adicional/100)
    else:
        isr = sueldo_bruto * (float(ISR)/100)
    sueldo_neto = sueldo_bruto-isr
    
    dict_query_compensaciones = dict(
        sueldo_bruto=sueldo_bruto,
        sueldo_neto=sueldo_neto,
        bono_entrega=bono_entrega,
        bono_horas=bono_hora,
        sueldo_vales=sueldo_vales,
        isr=isr,
        entregas=entregas,
        mes=mes,
        empleado_id=empleado_id,
        horas=int(horas_trabajadas)
    )
    query_compensaciones = """
        SELECT * FROM p_compensaciones_c(
            c_sueldo_bruto := {sueldo_bruto},
            c_sueldo_neto := {sueldo_neto},
            c_bono_entrega := {bono_entrega}, 
            c_bono_horas := {bono_horas}, 
            c_vales_despensa := {sueldo_vales}, 
            c_isr := {isr},
            c_entregas := {entregas}, 
            c_mes := {mes}, 
            c_empleado_id := {empleado_id}, 
            c_horas := {horas}
        );
    """.format(**dict_query_compensaciones)
    with connections['default'].cursor() as cursor:
                cursor.execute(query_compensaciones)
                compensacione_new = cursor.fetchone()
                mensaje = "Registro exitoso."
    return Response(
            dict(
                exito=True,
                mensaje=mensaje, 
                compensacione_new=compensacione_new
            ),
            status=HTTP_200_OK
        )

@api_view(["GET"])
def get_menes(request):
    meses = MESES
    
    return Response(
            dict(
                exito=True,
                mensaje="Datos encontrados.", 
                data=meses
            ),
            status=HTTP_200_OK
        )
    
@api_view(["POST"])
def eliminar(request):
    # Metodo para deshabilitar (eliminar) compensaciones
    try:
        compensacion_id = request.data.get("compensacion_id", None)
        if not compensacion_id:
            return Response(
                    dict(
                        exito=False,
                        mensaje="Regitro no encontrado.", 
                    ),
                    status=HTTP_200_OK
                )
        dict_query_eliminar = dict(
                compensacion_id=int(compensacion_id)
            )
        query_eliminar = """
            SELECT p_compensaciones_d(
                {compensacion_id}
            );
        """.format(**dict_query_eliminar)
        with connections['default'].cursor() as cursor:
            cursor.execute(query_eliminar)
            compensacion_eliminado = cursor.fetchone()
            compensacion_id = compensacion_eliminado[0]
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