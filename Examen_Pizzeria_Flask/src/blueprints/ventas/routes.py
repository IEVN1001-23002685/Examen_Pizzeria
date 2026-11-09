from flask import Blueprint, jsonify
from database import mysql
from datetime import datetime

ventas_bp = Blueprint("ventas", __name__, url_prefix="/api/ventas")


@ventas_bp.route("/dia/<fecha>", methods=["GET"])
def obtener_ventas_dia(fecha):

    try:
        datetime.strptime(fecha, "%Y-%m-%d")

        cursor = mysql.connection.cursor()

        sql = """
            SELECT
                p.id_pedido,
                p.fecha_pedido,
                p.total,
                c.nombre,
                c.direccion,
                c.telefono
            FROM pedidos p
            INNER JOIN clientes c
                ON p.id_cliente = c.id_cliente
            WHERE p.fecha_pedido = %s
            ORDER BY p.id_pedido DESC
        """

        cursor.execute(sql, (fecha,))
        datos = cursor.fetchall()

        pedidos = []
        total_ventas = 0

        for fila in datos:
            total_ventas += float(fila[2])

            pedidos.append(
                {
                    "id_pedido": fila[0],
                    "fecha_pedido": str(fila[1]),
                    "total": float(fila[2]),
                    "cliente": {
                        "nombre": fila[3],
                        "direccion": fila[4],
                        "telefono": fila[5],
                    },
                }
            )

        cursor.close()

        return (
            jsonify(
                {
                    "fecha": fecha,
                    "total_pedidos": len(pedidos),
                    "total_ventas": round(total_ventas, 2),
                    "pedidos": pedidos,
                    "exito": True,
                }
            ),
            200,
        )

    except ValueError:
        return (
            jsonify(
                {"mensaje": "La fecha debe tener el formato YYYY-MM-DD", "exito": False}
            ),
            400,
        )

    except Exception as ex:
        return jsonify({"mensaje": str(ex), "exito": False}), 500


@ventas_bp.route("/dia-semana/<dia>", methods=["GET"])
def obtener_ventas_dia_semana(dia):

    dias = {
        "domingo": 1,
        "lunes": 2,
        "martes": 3,
        "miercoles": 4,
        "jueves": 5,
        "viernes": 6,
        "sabado": 7,
    }

    dia = dia.lower().strip()
    dia = (
        dia.replace("á", "a")
        .replace("é", "e")
        .replace("í", "i")
        .replace("ó", "o")
        .replace("ú", "u")
    )

    if dia not in dias:
        return jsonify({"mensaje": "Día de la semana no válido", "exito": False}), 400

    try:
        cursor = mysql.connection.cursor()

        sql = """
            SELECT
                fecha_pedido,
                COUNT(*) AS cantidad_pedidos,
                SUM(total) AS total_ventas
            FROM pedidos
            WHERE DAYOFWEEK(fecha_pedido) = %s
            GROUP BY fecha_pedido
            ORDER BY fecha_pedido DESC
        """

        cursor.execute(sql, (dias[dia],))
        datos = cursor.fetchall()

        ventas = []
        total_ventas = 0
        total_pedidos = 0

        for fila in datos:
            cantidad = fila[1]
            total = float(fila[2])

            ventas.append(
                {
                    "fecha": str(fila[0]),
                    "cantidad_pedidos": cantidad,
                    "total_ventas": total,
                }
            )

            total_pedidos += cantidad
            total_ventas += total

        cursor.close()

        return (
            jsonify(
                {
                    "dia_semana": dia,
                    "total_pedidos": total_pedidos,
                    "total_ventas": round(total_ventas, 2),
                    "ventas": ventas,
                    "exito": True,
                }
            ),
            200,
        )

    except Exception as ex:
        return jsonify({"mensaje": str(ex), "exito": False}), 500


@ventas_bp.route("/mes/<int:anio>/<int:mes>", methods=["GET"])
def obtener_ventas_mes(anio, mes):

    if mes < 1 or mes > 12:
        return (
            jsonify({"mensaje": "El mes debe estar entre 1 y 12", "exito": False}),
            400,
        )

    if anio < 2000 or anio > 2100:
        return jsonify({"mensaje": "El año no es válido", "exito": False}), 400

    try:
        cursor = mysql.connection.cursor()

        sql = """
            SELECT
                fecha_pedido,
                COUNT(*) AS cantidad_pedidos,
                SUM(total) AS total_ventas
            FROM pedidos
            WHERE YEAR(fecha_pedido) = %s
                AND MONTH(fecha_pedido) = %s
            GROUP BY fecha_pedido
            ORDER BY fecha_pedido ASC
        """

        cursor.execute(sql, (anio, mes))
        datos = cursor.fetchall()

        ventas_por_dia = []
        total_ventas = 0
        total_pedidos = 0

        for fila in datos:
            cantidad = fila[1]
            total = float(fila[2])

            ventas_por_dia.append(
                {
                    "fecha": str(fila[0]),
                    "cantidad_pedidos": cantidad,
                    "total_ventas": total,
                }
            )

            total_pedidos += cantidad
            total_ventas += total

        cursor.close()

        return (
            jsonify(
                {
                    "anio": anio,
                    "mes": mes,
                    "total_pedidos": total_pedidos,
                    "total_ventas": round(total_ventas, 2),
                    "ventas_por_dia": ventas_por_dia,
                    "exito": True,
                }
            ),
            200,
        )

    except Exception as ex:
        return jsonify({"mensaje": str(ex), "exito": False}), 500
