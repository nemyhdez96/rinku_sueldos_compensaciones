const filtro = {};
$(document).ready(function(){
    window.tabla_compensaciones = $("#tabla_compensaciones").DataTable({
        dom: '<"html5buttons"B>lTfgtip',
        autoWidth: true,
        initComplete: function() {
        let txtBuscar = $('.dataTables_filter input');
        txtBuscar.attr("placeholder", "Enter para filtrar");
        txtBuscar.unbind();
        txtBuscar.bind('keyup', function(e){
            let code = e.keyCode || e.which;
            if (code == 13 || !this.value) { 
                tabla_compensaciones.search(this.value).draw();
            }
        });
        },
        processing: true,
        serverSide: true,
        lengthMenu: [[10, 25, 50, 100, -1], [10, 25, 50, 100, "Todos"]],
        ajax: {
            url: urlListaCompensaciones,
            type: 'post',
            data: function(extra) {
                extra.csrfmiddlewaretoken = csrf_token;
                extra.filtro = filtro;
            }
        },
        columns: [
            {'data': 'numero_empleado', title: 'Numero de empleado'},
            {'data': 'nombre_completo', title: 'Nombre'},
            {'data': 'sueldo_bruto', title: 'Sueldo bruto'},
            {'data': 'sueldo_neto', title: 'Sueldo neto'},
            {'data': 'bono_entrega', title: 'Bonos de entrega'},
            {'data': 'bono_horas', title: 'Bonos Horas'},
            {'data': 'isr', title: 'ISR'},
            {'data': 'vales_despensa', title: 'Vales de despensa'},
            {'data': 'entrega', title: 'Entregas'},
            {'data': 'mes', title: 'mes'},
            {'data': 'horas', title: 'Horas trabajadas'},
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
                $("#modal_crear_editar").modal("show");
            }
            }
        ]
    });
    $('.cjs-mask-numero').mask('#,##0', {reverse: true});
    fnFormValidate();
    fnIniciarEventos();
});


// Seccion de eventos
$(document).on("click", "#btn_guardar", fnCrearEditar);
$(document).on("click",".csj-editar", fnEditarEmpleado);
$(document).on("click",".cjs-eliminar",fnEliminarEmpleado);
$(document).on("click",".cerar_modal_crear_editar",fnLimpiarModalCrearEditar);
$(document).on("click","#btn_nuevo_modal",fnLimpiarModalCrearEditar);
$(document).on("click","#btn_buscar_numero",fnBuscarEmpleado);

function fnIniciarEventos(){
    let txtBuscar = $("#empleado_numero");
    txtBuscar.attr("placeholder", "Enter para buscar");
    txtBuscar.unbind();
    txtBuscar.bind('keyup', function(e){
        let code = e.keyCode || e.which;
        if (code == 13 || !this.value) { 
            fnBuscarEmpleado();
        }
    });
}

function fnFormValidate(){
        window.formBuscar= $("#form_crear_editar").validate({
            rules: {
                empleado_numero: {
                  required: true,
               },
            },
            messages: {
                empleado_numero:{
                   required:'Este campo es requerido.',
                },
             }
        });
        window.formGuardar = $("#form_guardar").validate({
            rules: {
                c_mes: {
                  required: true,
                  number:true,
               },
               c_cantidad: {
                required: true,
                number:true,
             },
            },
            messages: {
                c_mes:{
                   required:'Este campo es requerido.',
                   number:'Por favor introduzca un número valido.'
                },
                c_cantidad:{
                    required:'Este campo es requerido.',
                    number:'Por favor introduzca un número valido.'
                 },
             }
        });
}

function fnCrearEditar(){
    const validarFormulario = $("#form_guardar").valid();
    if (validarFormulario){
        $('.cjs-mask-numero').unmask();
        let form_data = new FormData($("#form_guardar")[0]);
        form_data.append("csrfmiddlewaretoken", csrf_token);
        $.ajax({
            url: urlCerear,
            method: "POST",
            data:form_data,
            processData: false,
            contentType: false,
            dataType: "JSON",
            success: function (respuesta) {
                if (respuesta.exito) {
                    $("#modal_crear_editar").modal("hide");
                    // fnLimpiarModalCrearEditar()
                    swal(respuesta?.mensaje, "", "success");
                    tabla_compensaciones.ajax.reload()

                } else {
                    swal("Advertencia", respuesta?.mensaje, "warning");
                }
                $('.cjs-mask-numero').mask('#,##0', {reverse: true});
            },
            error: function(e){
                swal("Advertencia", "Servicio no disponible.", "warning");
                $('.cjs-mask-numero').mask('#,##0', {reverse: true});
            }
        });
    }else{
        formGuardar.focusInvalid();
    }
}

function fnEditarEmpleado(){
    let row = tabla_compensaciones.row($(this).parents("tr"))
    let data = row.data()
    $("#empleado_id").val(data.id);
    $("#empleado_nombre").val(data.nombre);
    $("#empleado_paterno").val(data.paterno);
    $("#empleado_materno").val(data.materno);
    $("#empleado_rol_id").val(data.rol_id);

}

function fnEliminarEmpleado(){
    let data = tabla_compensaciones.row($(this).parents("tr")).data()
    let form_data = new FormData();
    form_data.append("empleado_id", data.id);
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
            tabla_compensaciones.ajax.reload()

        } else {
            swal("Advertencia", respuesta?.mensaje, "warning");
        }
        },
        error: function(e){
            swal("Advertencia", "Servicio no disponible.", "warning");
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

function fnBuscarEmpleado(){
    const validarFormulario = $("#form_crear_editar").valid();
    if (validarFormulario){
        let form_data = new FormData();
        form_data.append("empleado_numero", $("#empleado_numero").val());
        form_data.append("csrfmiddlewaretoken", csrf_token);
        $.ajax({
            url: urlBuscarEmpleado,
            method: "POST",
            data:form_data,
            processData: false,
            contentType: false,
            dataType: "JSON",
            success: function (respuesta) {
            if (respuesta.exito) {
                if (respuesta.data.length > 0){
                    let empleado = respuesta.data[0];
                    $("#empleado_nombre").val(empleado.nombre_completo);
                    $("#empleado_rol").val(empleado.rol_descripcion);
                    $("#empleado_id").val(empleado.id);
                    $("#rol_id").val(empleado.rol_id);
                    $("#rol_nombre").val(empleado.rol_nombre);
                }else{
                swal("No se encontraron registro con los datos enviados.", "", "warning");
                }
                // tabla_compensaciones.ajax.reload()

            } else {
                swal("Advertencia", respuesta?.mensaje, "warning");
            }
            },
            error: function(e){
                swal("Advertencia", "Servicio no disponible.", "warning");
            }
        });
    }else{
        formBuscar.focusInvalid();
    }
    
}

