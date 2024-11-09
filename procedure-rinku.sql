create function p_empleado_max_numero_b() returns integer
    language plpgsql
as
$$
    BEGIN
        RETURN
        (SELECT
            CASE
                WHEN MAX(e.numero::integer) IS NULL THEN  1
                ELSE MAX(e.numero::integer) + 1 END numero
        FROM empleados e);
    END
    $$;

alter function p_empleado_max_numero_b() owner to postgres;

create function p_empleados_c(empleado_nombre character varying, empleado_paterno character varying, empleado_materno character varying, empleado_rol_id integer, empleado_numero character varying)
    returns TABLE(id integer)
    language plpgsql
as
$$
    BEGIN
        RETURN QUERY
        WITH new_rows AS (
            INSERT INTO empleados (
                               nombre,
                               paterno,
                               materno,
                               rol_id,
                               numero,
                               activo
                        )
            VALUES (
                    empleado_nombre,
                    empleado_paterno,
                    empleado_materno,
                    empleado_rol_id,
                    empleado_numero,
                    true
                    )
            RETURNING empleados.id::integer
        )
        SELECT
            nr.id::integer
        from new_rows nr;
    END
    $$;

alter function p_empleados_c(varchar, varchar, varchar, integer, varchar) owner to postgres;

create function p_empleados_e(empleado_id integer, empleado_nombre character varying, empleado_paterno character varying, empleado_materno character varying, empleado_rol_id integer)
    returns TABLE(id integer)
    language plpgsql
as
$$
    BEGIN
        RETURN QUERY
        WITH new_rows AS (
            UPDATE empleados SET
                nombre=empleado_nombre,
                paterno=empleado_paterno,
                materno=empleado_materno,
                rol_id=empleado_rol_id
            WHERE empleados.id = empleado_id
            RETURNING empleados.id::integer
        )
        SELECT
            nr.id::integer
        from new_rows nr;
    END
    $$;

alter function p_empleados_e(integer, varchar, varchar, varchar, integer) owner to postgres;

create function p_empleados_d(empleado_id integer)
    returns TABLE(id integer)
    language plpgsql
as
$$
    BEGIN
        RETURN QUERY
        WITH new_rows AS (
            UPDATE empleados SET
                activo = false
            WHERE empleados.id = empleado_id
            RETURNING empleados.id::integer
        )
        SELECT
            nr.id::integer
        from new_rows nr;
    END
    $$;

alter function p_empleados_d(integer) owner to postgres;

create function p_conpensaciones_b(c_id integer DEFAULT '-99'::integer, c_sueldo_bruto numeric DEFAULT '-99'::integer, c_sueldo_neto numeric DEFAULT '-99'::integer, c_bono_entrega numeric DEFAULT '-99'::integer, c_bono_horas numeric DEFAULT '-99'::integer, c_isr numeric DEFAULT '-99'::integer, c_vales_despensa numeric DEFAULT '-99'::integer, c_entrega integer DEFAULT '-99'::integer, c_mes integer DEFAULT '-99'::integer, c_empleado_id integer DEFAULT '-99'::integer, e_rol_id integer DEFAULT '-99'::integer, e_activo boolean DEFAULT true, busqueda character varying DEFAULT ''::character varying, limite integer DEFAULT 1, start integer DEFAULT 0)
    returns TABLE(id integer, sueldo_bruto numeric, sueldo_neto numeric, horas integer, bono_entrega numeric, bono_horas numeric, isr numeric, vales_despensa numeric, entrega integer, mes integer, empleado_id integer, numero_empleado character varying, nombre character varying, paterno character varying, materno character varying, activo boolean, rol_id integer, rol_descripcion character varying, total integer)
    language plpgsql
as
$$
    BEGIN
        RETURN QUERY
        with total as (
            SELECT count(*) total
            FROM compensaciones co
            INNER JOIN empleados em ON em.id=co.empleado_id
            INNER JOIN rol ro on ro.id = em.rol_id
            WHERE
                CASE
                    WHEN c_id = -99 THEN c_id
                    ELSE co.id END = c_id
                AND CASE
                    WHEN c_empleado_id = -99 THEN c_empleado_id
                    ELSE co.empleado_id END = c_empleado_id
                AND CASE
                    WHEN c_sueldo_bruto = -99 THEN c_sueldo_bruto
                    ELSE co.sueldo_bruto END = c_sueldo_bruto
                AND CASE
                    WHEN c_sueldo_neto = -99 THEN c_sueldo_neto
                    ELSE co.sueldo_neto END = c_sueldo_neto
                AND CASE
                    WHEN c_bono_entrega = -99 THEN c_bono_entrega
                    ELSE co.bono_entrega END = c_bono_entrega
                AND CASE
                    WHEN c_bono_horas = -99 THEN c_bono_horas
                    ELSE co.bono_horas END = c_bono_horas
                AND CASE
                    WHEN c_isr = -99 THEN c_isr
                    ELSE co.isr END = c_isr
                AND CASE
                    WHEN c_vales_despensa = -99 THEN c_vales_despensa
                    ELSE co.vales_despensa END = c_vales_despensa
                AND CASE
                    WHEN c_entrega = -99 THEN c_entrega
                    ELSE co.entrega END = c_entrega
                AND CASE
                    WHEN c_mes = -99 THEN c_mes
                    ELSE co.mes END = c_mes
                AND CASE
                    WHEN busqueda = '' THEN busqueda
                    ELSE concat_ws(
                        ' ',
                        em.nombre,
                        em.paterno,
                        em.materno,
                        em.numero,
                        ro.descripcion,
                        co.mes,
                        co.sueldo_bruto,
                        co.sueldo_neto,
                        co.bono_entrega,
                        co.bono_horas,
                        co.isr,
                        co.vales_despensa,
                        co.horas
                    )  END ILIKE format('%%%s%%', busqueda)
                AND CASE
                    WHEN e_rol_id = -99 THEN e_rol_id
                    ELSE em.rol_id END = e_rol_id
                AND em.activo = e_activo AND co.activo = e_activo
        )
        SELECT
            com.id::integer,
            com.sueldo_bruto,
            com.sueldo_neto,
            com.horas,
            com.bono_entrega,
            com.bono_horas,
            com.isr,
            com.vales_despensa,
            com.entrega::integer,
            com.mes::integer,
            com.empleado_id::integer,
            e.numero numero_empleado,
            e.nombre,
            e.paterno,
            e.materno,
            e.activo,
            e.rol_id::integer,
            r.descripcion rol_descripcion,
            t.total::integer
        FROM compensaciones com
            INNER JOIN empleados e ON e.id = com.empleado_id
            INNER JOIN rol r on r.id = e.rol_id
           , total t
        WHERE
             CASE
                WHEN c_id = -99 THEN c_id
                ELSE com.id END = c_id
            AND CASE
                WHEN c_empleado_id = -99 THEN c_empleado_id
                ELSE com.empleado_id END = c_empleado_id
            AND CASE
                WHEN c_sueldo_bruto = -99 THEN c_sueldo_bruto
                ELSE com.sueldo_bruto END = c_sueldo_bruto
            AND CASE
                WHEN c_sueldo_neto = -99 THEN c_sueldo_neto
                ELSE com.sueldo_neto END = c_sueldo_neto
            AND CASE
                WHEN c_bono_entrega = -99 THEN c_bono_entrega
                ELSE com.bono_entrega END = c_bono_entrega
            AND CASE
                WHEN c_bono_horas = -99 THEN c_bono_horas
                ELSE com.bono_horas END = c_bono_horas
            AND CASE
                WHEN c_isr = -99 THEN c_isr
                ELSE com.isr END = c_isr
            AND CASE
                WHEN c_vales_despensa = -99 THEN c_vales_despensa
                ELSE com.vales_despensa END = c_vales_despensa
            AND CASE
                WHEN c_entrega = -99 THEN c_entrega
                ELSE com.entrega END = c_entrega
            AND CASE
                WHEN c_mes = -99 THEN c_mes
                ELSE com.mes END = c_mes
            AND CASE
                WHEN busqueda = '' THEN busqueda
                ELSE concat_ws(
                    ' ',
                    e.nombre,
                    e.paterno,
                    e.materno,
                    e.numero,
                    r.descripcion,
                    com.mes,
                    com.sueldo_bruto,
                    com.sueldo_neto,
                    com.bono_entrega,
                    com.bono_horas,
                    com.isr,
                    com.vales_despensa,
                    com.horas
                )  END ILIKE format('%%%s%%', busqueda)
            AND CASE
                WHEN e_rol_id = -99 THEN e_rol_id
                ELSE  e.rol_id END = e_rol_id
            AND e.activo = e_activo AND com.activo = e_activo
        ORDER BY com.mes, e.nombre ASC
        LIMIT CASE WHEN limite > 0 THEN limite end
        OFFSET start;
    END
    $$;

alter function p_conpensaciones_b(integer, numeric, numeric, numeric, numeric, numeric, numeric, integer, integer, integer, integer, boolean, varchar, integer, integer) owner to postgres;

create function p_compensaciones_c(c_sueldo_bruto numeric, c_sueldo_neto numeric, c_bono_entrega numeric, c_bono_horas numeric, c_vales_despensa numeric, c_isr numeric, c_entregas integer, c_mes integer, c_empleado_id integer, c_horas integer)
    returns TABLE(id integer)
    language plpgsql
as
$$
    BEGIN
        RETURN QUERY
        WITH new_rows AS (
            INSERT
                INTO compensaciones (
                                     sueldo_bruto,
                                     sueldo_neto,
                                     bono_entrega,
                                     bono_horas,
                                     isr,
                                     vales_despensa,
                                     entrega,
                                     mes,
                                     horas,
                                     activo,
                                     empleado_id
                    )
            VALUES (
                    c_sueldo_bruto,
                    c_sueldo_neto,
                    c_bono_entrega,
                    c_bono_horas,
                    c_isr,
                    c_vales_despensa,
                    c_entregas,
                    c_mes,
                    c_horas,
                    true,
                    c_empleado_id
                    )
            RETURNING compensaciones.id::integer
        )
        SELECT
            nr.id::integer
        from new_rows nr;
    END
    $$;

alter function p_compensaciones_c(numeric, numeric, numeric, numeric, numeric, numeric, integer, integer, integer, integer) owner to postgres;

create function p_rol_b(limite integer DEFAULT 0, start integer DEFAULT 0)
    returns TABLE(id integer, nombre character varying, descripcion character varying)
    language plpgsql
as
$$
    BEGIN
        RETURN QUERY
        with total as (
            select count(*) total
            from rol as r
            where r.activo = true

        )
        SELECT
            r.id::integer,
            r.nombre,
            r.descripcion
        FROM rol r
        WHERE r.activo = true
        ORDER BY nombre ASC
        LIMIT CASE WHEN limite > 0 THEN limite end
        OFFSET start

        ;
    END
    $$;

alter function p_rol_b(integer, integer) owner to postgres;

create function p_empleados_b(empleado_id integer DEFAULT '-99'::integer, empleado_nombre character varying DEFAULT ''::character varying, empleado_paterno character varying DEFAULT ''::character varying, empleado_materno character varying DEFAULT ''::character varying, empleado_rol_id integer DEFAULT '-99'::integer, empleado_numero character varying DEFAULT ''::character varying, empleado_activo boolean DEFAULT true, busqueda character varying DEFAULT ''::character varying, limite integer DEFAULT 1, start integer DEFAULT 0)
    returns TABLE(id integer, numero character varying, nombre character varying, paterno character varying, materno character varying, activo boolean, rol_id integer, rol_nombre character varying, rol_descripcion character varying, total integer)
    language plpgsql
as
$$
    BEGIN
        RETURN QUERY
        with total as (
            select count(*) total
            from empleados as em
            WHERE
                CASE
                    WHEN empleado_id = - 99 THEN empleado_id
                    ELSE em.id END = empleado_id
                AND CASE
                    WHEN empleado_nombre = '' THEN empleado_nombre
                    ELSE em.nombre END = empleado_nombre
                AND CASE
                    WHEN empleado_paterno = '' THEN empleado_paterno
                    ELSE em.paterno END = empleado_paterno
                AND CASE
                    WHEN empleado_materno = '' THEN empleado_materno
                    ELSE em.materno END = empleado_materno
                AND CASE
                    WHEN empleado_numero = '' THEN empleado_numero
                    ELSE em.numero END = empleado_numero
                AND CASE
                    WHEN busqueda = '' THEN busqueda
                    ELSE concat_ws(' ', em.nombre, em.paterno, em.materno, em.numero, em.rol_id) END ILIKE format('%%%s%%', busqueda)
                AND CASE
                    WHEN empleado_rol_id = -99 THEN empleado_rol_id
                    ELSE  em.rol_id END = empleado_rol_id
                AND em.activo = empleado_activo

        )
        SELECT
            e.id::integer,
            e.numero,
            e.nombre,
            e.paterno,
            e.materno,
            e.activo,
            e.rol_id::integer,
            r.nombre rol_nombre,
            r.descripcion rol_descripcion,
            t.total::integer
        FROM empleados e
           INNER JOIN rol r on r.id = e.rol_id
           , total t
        WHERE
            CASE
                WHEN empleado_id = - 99 THEN empleado_id
                ELSE e.id END = empleado_id
            AND CASE
                    WHEN empleado_nombre = '' THEN empleado_nombre
                    ELSE e.nombre END = empleado_nombre
            AND CASE
                    WHEN empleado_paterno = '' THEN empleado_paterno
                    ELSE e.paterno END = empleado_paterno
            AND CASE
                    WHEN empleado_materno = '' THEN empleado_materno
                    ELSE e.materno END = empleado_materno
            AND CASE
                    WHEN empleado_numero = '' THEN empleado_numero
                    ELSE e.numero END = empleado_numero
            AND CASE
                WHEN busqueda = '' THEN busqueda
                ELSE concat_ws(' ', e.nombre, e.paterno, e.materno, e.numero, e.rol_id)  END ILIKE format('%%%s%%', busqueda)
            AND CASE
                WHEN empleado_rol_id = -99 THEN empleado_rol_id
                ELSE  e.rol_id END = empleado_rol_id
            AND E.activo = empleado_activo
        ORDER BY nombre ASC
        LIMIT CASE WHEN limite > 0 THEN limite end
        OFFSET start

        ;
    END
    $$;

alter function p_empleados_b(integer, varchar, varchar, varchar, integer, varchar, boolean, varchar, integer, integer) owner to postgres;

create function p_compensaciones_d(compensacion_id integer)
    returns TABLE(id integer)
    language plpgsql
as
$$
    BEGIN
        RETURN QUERY
        WITH new_rows AS (
            UPDATE compensaciones SET
                activo = false
            WHERE compensaciones.id = compensacion_id
            RETURNING compensaciones.id::integer
        )
        SELECT
            nr.id::integer
        from new_rows nr;
    END
    $$;

alter function p_compensaciones_d(integer) owner to postgres;
