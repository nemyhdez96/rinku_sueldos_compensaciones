from django.db import models
from rol.models import Rol
# Create your models here.


class Empleados(models.Model):
    nombre = models.CharField(max_length=50, blank=True, null=True)
    paterno = models.CharField(max_length=50, blank=True, null=True)
    materno = models.CharField(max_length=50, blank=True, null=True)
    numero = models.CharField(max_length=5, blank=True, null=True)
    rol = models.ForeignKey(Rol, on_delete=models.CASCADE, blank=True, null=True)
    activo = models.BooleanField(default=True, blank=True, null=True)
    
    def __str__(self):
        return '%s (%s)' % (
            self.id, 
            self.nombre)
        
    class Meta:
        managed = True
        db_table = 'empleados'
        app_label = 'empleados'
    