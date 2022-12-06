# Proyecto Rinku sueldos y conpensaciones
Implementación de plataforma para el registro y consulta de sueldos y compensaciones de los empleados

# Lenguaje
Python 3.10.6 

# Framework
Django==4.1.3
Bootstrap v4.3.10

# Base de datos
postgres

# Plugins
```
Font Awesome 4.7.0
jquery 2.1.1
sweetalert.min
jQuery Mask Plugin v1.14.16
Query Validation Plugin - v1.15.1
DataTables 1.10.22
```

## instalación
Creamos un entorno virtual con la versión de Python 3.10.6 y sue el paquete [pip](https://pip.pypa.io/en/stable/) para instalar requirements

```
bash
pip install requirements.txt 
```
# Uso
```
En el servidor 
    1.- active el entorno virtual 
    2.- Acceda a la raíz del proyecto y ejecute el comando python manage.py runserver
```

## Archivos de configuracion .env
Ubicación /rinku_sueldos_compensaciones/rinku/.env

```
DB_NAME=
DB_USER=
DB_PASSWORD=
DB_HOST=
DB_PORT=
DEBUG=
```

Ubicación /rinku_sueldos_compensaciones/compensaciones/modules/.env
```
# Sueldo base 
SUELDO_BASE=
#Horas por dia
HORAS=
#Dias de la semana
DIAS=
# semanas por mes
SEMANAS=
#Bonos de entrega
BONO_ENTREGAS=5
# Bonos por hora de los [Chofer, Cargadores]
BONO_HORAS=10,5
# procentaje de ISR
ISR=9
# Porcentaje adicional IRS
ISR_ADICIONAL=3
# Vales de despensa 
VALES_DESPENSA=4
```

## Desarrollado por
Nehemias Hernandez Hernandez

