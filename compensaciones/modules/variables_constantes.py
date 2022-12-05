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

    