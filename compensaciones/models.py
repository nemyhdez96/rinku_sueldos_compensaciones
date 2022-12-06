from django.db import models
from empleados.models import Empleados

# Create your models here.

class Compensaciones(models.Model):
    sueldo_bruto = models.DecimalField(decimal_places=2, max_digits=9)
    sueldo_neto = models.DecimalField(decimal_places=2, max_digits=9)
    bono_entrega = models.DecimalField(decimal_places=2, max_digits=9)
    bono_horas = models.DecimalField(decimal_places=2, max_digits=9)
    isr = models.DecimalField(decimal_places=2, max_digits=9)
    vales_despensa = models.DecimalField(decimal_places=2, max_digits=9)
    entrega = models.IntegerField(null=True, blank=True)
    mes=models.IntegerField(null=True, blank=True)
    empleado=models.ForeignKey(Empleados, on_delete=models.CASCADE, blank=True, null=True)
    horas=models.IntegerField(null=True, blank=True)
    activo=models.BooleanField(default=True)
    
    def __str__(self):
        return '%s' % (
            self.id
            )
        
    class Meta:
        managed = True
        db_table = 'compensaciones'
        app_label = 'compensaciones'