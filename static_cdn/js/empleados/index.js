$(document).ready(function(){
    window.tabla_usuarios = $("#tabla_empleados").DataTable({
        dom: '<"html5buttons"B>lTfgtip',
        autoWidth: true,
        initComplete: function() {
        let txtBuscar = $('.dataTables_filter input');
        txtBuscar.attr("placeholder", "Enter para filtrar");
        txtBuscar.unbind();
        txtBuscar.bind('keyup', function(e){
            let code = e.keyCode || e.which;
            if (code == 13 || !this.value) { 
                tabla_usuarios.search(this.value).draw();
            }
        });
        },
        processing: true,
        serverSide: true,
        lengthMenu: [[10, 25, 50, 100, -1], [10, 25, 50, 100, "Todos"]],
        ajax: {
            url: urlListaEmpleadp,
            type: 'post',
            data: function(extra) {
                extra.csrfmiddlewaretoken = csrf_token;
            }
        },
        columns: [
            {'data': 'numero', title: 'Numero de empleado'},
            {'data': 'nombre_completo', title: 'Nombre'},
            {'data': 'rol_descripcion', title: 'Rol'},
            {'data': 'activo', title: 'Activo'},
            {'data': 'opciones', title: ''},
        ],
        "order" : [[ 0, "asc" ]],
        buttons: [
            {
            extend: 'collection',
            text: 'Exportar',
            buttons: [ 'csv', 'excel', 'pdf']
            },
            {
            text: '<i class="fa fa-plus-square"></i> Crear',
            className: "btn-primary",
            action: function ( e, dt, node, config ) {
                $("#modal_titulo").html("Crear empleado");
                $("#modal_crear_editar").modal("show");
            }
            }
        ]
    });
    
    fnFormValidate();
    fnObtenerRol();
});


// Seccion de eventos
$(document).on("click", "#btn_guardar", fnCrearEditar);
$(document).on("click",".csj-editar", fnEditarEmpleado);
$(document).on("click",".cjs-eliminar",fnEliminarEmpleado);
$(document).on("click",".cerar_modal_crear_editar",fnLimpiarModalCrearEditar);
$(document).on("click","#btn_nuevo_modal",fnLimpiarModalCrearEditar);

function fnFormValidate(){
        window.formValidateCrearEditar = $("#form_crear_editar").validate({
            rules: {
                empleado_nombre: {
                  required: true,
               },
               empleado_paterno: {
                  required: true
               },
               empleado_rol_id: {
                  required: true,
                  number:true
               }
            },
            messages: {
                empleado_nombre:{
                   required:'Este campo es requerido.',
                },
                empleado_paterno:{
                   required:'Este campo es requerido.',
                },
                empleado_rol_id:{
                    required:'Este campo es requerido.',
                    number:'Por favor introduzca un número valido'
                 },
             }
        });
}

function fnCrearEditar(){
    const validarFormulario = $("#form_crear_editar").valid();
    if (validarFormulario){
        let form_data = new FormData($("#form_crear_editar")[0]);
        form_data.append("csrfmiddlewaretoken", csrf_token);
        $.ajax({
            url: urlCerearEditar,
            method: "POST",
            data:form_data,
            processData: false,
            contentType: false,
            dataType: "JSON",
            success: function (respuesta) {
            if (respuesta.exito) {
                $("#modal_crear_editar").modal("hide");
                fnLimpiarModalCrearEditar()
                swal(respuesta?.mensaje, "", "success");
                tabla_usuarios.ajax.reload()

            } else {
                swal("Advertencia", respuesta?.mensaje, "warning");
            }
                //    $('#ibox-modal-tasa').children('.ibox-content').toggleClass('sk-loading');
            },
            error: function(e){
                swal("Advertencia", "Servicio no disponible.", "warning");
                //    $('#ibox-modal-tasa').children('.ibox-content').toggleClass('sk-loading');
            }
        });
    }else{
        formValidateCrearEditar.focusInvalid();
    }
}

function fnEditarEmpleado(){
    let row = tabla_usuarios.row($(this).parents("tr"))
    let data = row.data()
    $("#empleado_id").val(data.id);
    $("#empleado_nombre").val(data.nombre);
    $("#empleado_paterno").val(data.paterno);
    $("#empleado_materno").val(data.materno);
    $("#empleado_rol_id").val(data.rol_id);

}

function fnEliminarEmpleado(){
    let data = tabla_usuarios.row($(this).parents("tr")).data()
    let form_data = new FormData();
    form_data.append("empleado_id", data.id);
    form_data.append("csrfmiddlewaretoken", csrf_token);
    swal({
        title:"¿Esta seguro de eliminar el registro?",
        text:`Empleado ${data.nombre_completo} con #: ${data.numero}`,
        type:"warning",
        showCancelButton:true,
        confirmButtonColor: '#3085d6',
        confirmButtonText: "Sí, Eliminar",
        cancelButtonText: "No, cancelar",
        closeOnConfirm: false,
        closeOnCancel: false
     },
     function(confirm){
        if(confirm){
            $.ajax({
                url: urlEliminar,
                method: "POST",
                data:form_data,
                processData: false,
                contentType: false,
                dataType: "JSON",
                success: function (respuesta) {
                if (respuesta.exito) {
                    swal(respuesta?.mensaje, "", "success");
                    tabla_usuarios.ajax.reload()
        
                } else {
                    swal("Advertencia", respuesta?.mensaje, "warning");
                }
                },
                error: function(e){
                    swal("Advertencia", "Servicio no disponible.", "warning");
                }
            });
        }else{
           swal({
              title:"Proceso cancelado",
              text:" ",
              type:"error",
              timer: 2000,
           });
        }

     });
}

function fnLimpiarModalCrearEditar(){
    $("#empleado_id").val("");
    $("#empleado_nombre").val("");
    $("#empleado_paterno").val("");
    $("#empleado_materno").val("");
    $("#empleado_rol_id").val("");
}

function fnObtenerRol(){
    let form_data = new FormData();
    form_data.append("csrfmiddlewaretoken", csrf_token);
    $.ajax({
        url: urlRoles,
        method: "POST",
        data:form_data,
        processData: false,
        contentType: false,
        dataType: "JSON",
        success: function (respuesta) {
        if (respuesta.exito) {
            for (const item of respuesta.data) {
                $("#empleado_rol_id").append(`
                    <option value="${item.id}" >${item.descripcion}</option>
                `);
            }

        } else {
            swal("Advertencia", respuesta?.mensaje, "warning");
        }
        },
        error: function(e){
            swal("Advertencia", "Servicio no disponible.", "warning");
        }
    });
}

