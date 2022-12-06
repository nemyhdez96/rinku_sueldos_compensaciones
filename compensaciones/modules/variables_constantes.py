from pathlib import Path
import os
import environ


BASE_DIRECCION = os.path.abspath(os.path.dirname(__file__))

env = environ.Env()
environ.Env.read_env()

SUELDO_BASE = env('SUELDO_BASE')
HORAS = env('HORAS')
DIAS = env('DIAS')
SEMANAS = env("SEMANAS")
BONO_ENTREGAS = env('BONO_ENTREGAS')
BONO_HORAS = env('BONO_HORAS')
ISR = env('ISR')
ISR_ADICIONAL = env('ISR_ADICIONAL')
VALES_DESPENSA = env('VALES_DESPENSA')

MESES= [
    {"numero":1, "descripcion":"Enero"},
    {"numero":2, "descripcion":"Febrero"},
    {"numero":3, "descripcion":"Marzo"},
    {"numero":4, "descripcion":"Abril"},
    {"numero":5, "descripcion":"Mayo"},
    {"numero":6, "descripcion":"Junio"},
    {"numero":7, "descripcion":"Julio"},
    {"numero":8, "descripcion":"Agosto"},
    {"numero":9, "descripcion":"Septiembre"},
    {"numero":10, "descripcion":"Octublre"},
    {"numero":11, "descripcion":"Nobiembre"},
    {"numero":12, "descripcion":"Diciembre"},
]

    