# Generated by Django 4.1.3 on 2022-12-05 03:33

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('empleados', '0001_initial'),
        ('compensaciones', '0002_delete_compensaciones'),
    ]

    operations = [
        migrations.CreateModel(
            name='Compensaciones',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('sueldo_bruto', models.DecimalField(decimal_places=2, max_digits=9)),
                ('sueldo_neto', models.DecimalField(decimal_places=2, max_digits=9)),
                ('bono_entrega', models.DecimalField(decimal_places=2, max_digits=9)),
                ('bono_horas', models.DecimalField(decimal_places=2, max_digits=9)),
                ('isr', models.DecimalField(decimal_places=2, max_digits=9)),
                ('vales_despensa', models.DecimalField(decimal_places=2, max_digits=9)),
                ('entrega', models.IntegerField(blank=True, null=True)),
                ('mes', models.IntegerField(blank=True, null=True)),
                ('horas', models.IntegerField(blank=True, null=True)),
                ('activo', models.BooleanField(default=True)),
                ('empleado', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='empleados.empleados')),
            ],
            options={
                'db_table': 'compensaciones',
                'managed': True,
            },
        ),
    ]
