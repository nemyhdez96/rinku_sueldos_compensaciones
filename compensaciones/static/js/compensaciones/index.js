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
                extra.filtro = JSON.stringify(filtro);
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
                className: "ml-1  btn-primary",
                action: function ( e, dt, node, config ) {
                    $("#modal_crear_editar").modal("show");
                }
            },
            {
                text: '<i class="fa fa-filter"></i> Filtrar',
                className: 'ml-1 btn btn-success',
                action: function ( e, dt, node, config ) {
                   $("#filtrar_por").val("")
                   $("#modal_filtro").modal('show');
                }
             },
        ]
    });
    $('.cjs-mask-numero').mask('#,##0', {reverse: true});
    fnFormValidate();
    fnIniciarEventos();
    fnObtenerMeses();
    fnCargarEmpleados();
    fnObtenerRol();
});


// Seccion de eventos
$(document).on("click", "#btn_guardar", fnCrearEditar);
$(document).on("click",".cjs-eliminar",fnEliminarCompensacion);
$(document).on("click",".cerar_modal_crear_editar",fnLimpiarModalCrearEditar);
$(document).on("click","#btn_nuevo_modal",fnLimpiarModalCrearEditar);
$(document).on("click","#btn_buscar_numero",fnBuscarEmpleado);
$(document).on("click","#btn-filtrar",fnFiltrar);
$(document).on("click","#btn-limpiar",fnLimpiarFiltro);

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

function fnEliminarCompensacion(){
    let data = tabla_compensaciones.row($(this).parents("tr")).data()
    let form_data = new FormData();
    form_data.append("compensacion_id", data.id);
    form_data.append("csrfmiddlewaretoken", csrf_token);
    swal({
        title:"¿Esta seguro de eliminar el registro?",
        text:``,
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
                    tabla_compensaciones.ajax.reload()
        
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
    $("#empleado_numero").val("");
    $("#empleado_nombre").val("");
    $("#empleado_rol").val("");
    $("#c_mes").val("");
    $("#c_cantidad").val("");
    $("#c_id").val("");
    $("#empleado_id").val("");
    $("#rol_id").val("");
    $("#rol_nombre").val("");
}

async function fnBuscarEmpleado(){
    const validarFormulario = $("#form_crear_editar").valid();
    if (validarFormulario){
        let data = await fnListaEmpleados($("#empleado_numero").val())
        if (data.length > 0){
            let empleado = data[0];
            $("#empleado_nombre").val(empleado.nombre_completo);
            $("#empleado_rol").val(empleado.rol_descripcion);
            $("#empleado_id").val(empleado.id);
            $("#rol_id").val(empleado.rol_id);
            $("#rol_nombre").val(empleado.rol_nombre);
        }else{
        swal("No se encontraron registro con los datos enviados.", "", "warning");
        }
    }else{
        formBuscar.focusInvalid();
    }
    
}

async function fnListaEmpleados(empleado_numero){
    let form_data = new FormData();
    form_data.append("empleado_numero", empleado_numero);
    form_data.append("csrfmiddlewaretoken", csrf_token);
    let respuesta_data = [];
    await $.ajax({
        url: urlBuscarEmpleado,
        method: "POST",
        data:form_data,
        processData: false,
        contentType: false,
        dataType: "JSON",
        success: function (respuesta) {
            if (respuesta.exito) {
                respuesta_data = respuesta.data;         
                // tabla_compensaciones.ajax.reload()

            } else {
                swal("Advertencia", respuesta?.mensaje, "warning");
            }
        },
        error: function(e){
            swal("Advertencia", "Servicio no disponible.", "warning");
        }
    });
    return respuesta_data;
}

function fnObtenerMeses(){
    let form_data = new FormData();
    form_data.append("csrfmiddlewaretoken", csrf_token);
    $.ajax({
        url: urlBuscarMeses,
        method: "GET",
        data:form_data,
        processData: false,
        contentType: false,
        dataType: "JSON",
        success: function (respuesta) {
        if (respuesta.exito) {
            for (const item of respuesta.data) {
                $("#c_mes").append(`
                    <option value="${item.numero}" >${item.descripcion}</option>
                `);
                $("#c_mes_f").append(`
                    <option value="${item.numero}" >${item.descripcion}</option>
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

function fnFiltrar(){ 
    filtro.e_rol_id = $("#empleado_rol_id").val();
    filtro.c_empleado_id = $("#c_empleado").val();
    filtro.c_entrega = $("#c_cantidad").val();
    filtro.c_mes = $("#c_mes_f").val();
    tabla_compensaciones.ajax.reload();
    $("#modal_filtro").modal('hide');
}

function fnLimpiarFiltro(){
    delete filtro.e_rol_id;
    delete filtro.c_empleado_id;
    delete filtro.c_entrega;
    delete filtro.c_mes;
    tabla_compensaciones.ajax.reload();
    $("#modal_filtro").modal('hide');
}

async function fnCargarEmpleados(){
    let data = await fnListaEmpleados("");
    for (const item of data) {
        $("#c_empleado").append(`
            <option value="${item.id}" >${item.numero}| ${item.nombre_completo}</option>
        `);
    }
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