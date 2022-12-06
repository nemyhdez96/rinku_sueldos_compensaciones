from django.db import models

# Create your models here.

class Rol(models.Model):
    nombre = models.CharField(max_length=50)
    descripcion = models.CharField(max_length=50)
    activo = models.BooleanField(default=True)
    
    def __str__(self):
        return '%s (%s)' % (
            self.id, 
            self.nombre)
        
    class Meta:
        managed = True
        db_table = 'rol'
        app_label = 'rol'