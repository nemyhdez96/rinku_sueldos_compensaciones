
def opciones_compensaciones(elemento):
    
    link_eliminar = """
        <a href="javascript:void(0);" class="table-icon text-danger cjs-eliminar"
            title="Eliminar"><i class="fa fa-trash"></i>
        </a>
    """
    opciones = "{link_eliminar}".format(**
        dict(
            link_eliminar=link_eliminar
        )
    )
    elemento["opciones"] = opciones
    return elemento