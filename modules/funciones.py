def dictfetchall(cursor):
    "Devuelve todas las filas de un cursor como un dictado"
    columns = [col[0] for col in cursor.description]
    return [
        dict(zip(columns, row))
        for row in cursor.fetchall()]