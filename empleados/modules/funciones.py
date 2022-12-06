
def opciones_empleados(elemento):
    
    link_editar = """
        <a href="javascript:void(0);" class="table-icon csj-editar"
            data-toggle="modal" data-target="#modal_crear_editar" title="Editar" ><i class="fa fa-edit"></i>
        </a>
    """
    link_eliminar = """
        <a href="javascript:void(0);" class="table-icon text-danger cjs-eliminar"
            title="Eliminar"><i class="fa fa-trash"></i>
        </a>
    """
    opciones = "{link_editar}{link_eliminar}".format(**
        dict(
            link_editar=link_editar,
            link_eliminar=link_eliminar
        )
    )
    elemento["opciones"] = opciones
    return elemento