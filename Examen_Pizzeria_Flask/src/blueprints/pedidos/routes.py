from flask import Blueprint, jsonify, request
from database import mysql
import json

pedidos_bp = Blueprint("pedidos", __name__, url_prefix="/api/pedidos")

@pedidos_bp.route("", methods=["GET"])
def obtener_pedidos():

    try:
        cursor = mysql.connection.cursor()

        sql = """
            SELECT
                p.id_pedido,
                p.fecha_pedido,
                p.total,
                c.id_cliente,
                c.nombre,
                c.direccion,
                c.telefono
            FROM pedidos p
            INNER JOIN clientes c
                ON p.id_cliente = c.id_cliente
            ORDER BY p.fecha_pedido DESC
        """

        cursor.execute(sql)
        datos = cursor.fetchall()

        pedidos = []

        for fila in datos:
            pedidos.append(
                {
                    "id_pedido": fila[0],
                    "fecha_pedido": str(fila[1]),
                    "total": float(fila[2]),
                    "cliente": {
                        "id_cliente": fila[3],
                        "nombre": fila[4],
                        "direccion": fila[5],
                        "telefono": fila[6],
                    },
                }
            )

        cursor.close()

        return jsonify({"pedidos": pedidos, "exito": True}), 200

    except Exception as ex:
        return jsonify({"mensaje": str(ex), "exito": False}), 500


# ==========================================
# GET: Consultar un pedido por ID
# ==========================================
@pedidos_bp.route("/<int:id_pedido>", methods=["GET"])
def obtener_pedido(id_pedido):

    try:
        cursor = mysql.connection.cursor()

        sql_pedido = """
            SELECT
                p.id_pedido,
                p.fecha_pedido,
                p.total,
                c.id_cliente,
                c.nombre,
                c.direccion,
                c.telefono
            FROM pedidos p
            INNER JOIN clientes c
                ON p.id_cliente = c.id_cliente
            WHERE p.id_pedido = %s
        """

        cursor.execute(sql_pedido, (id_pedido,))
        pedido = cursor.fetchone()

        if pedido is None:
            cursor.close()

            return jsonify({"mensaje": "Pedido no encontrado", "exito": False}), 404

        sql_detalle = """
            SELECT
                id_detalle,
                tamano,
                ingredientes,
                cantidad,
                subtotal
            FROM detalle_pedido
            WHERE id_pedido = %s
        """

        cursor.execute(sql_detalle, (id_pedido,))
        detalles = cursor.fetchall()

        pizzas = []

        for fila in detalles:
            try:
                ingredientes = json.loads(fila[2])
            except (TypeError, ValueError):
                ingredientes = fila[2]

            pizzas.append(
                {
                    "id_detalle": fila[0],
                    "tamano": fila[1],
                    "ingredientes": ingredientes,
                    "cantidad": fila[3],
                    "subtotal": float(fila[4]),
                }
            )

        cursor.close()

        return (
            jsonify(
                {
                    "pedido": {
                        "id_pedido": pedido[0],
                        "fecha_pedido": str(pedido[1]),
                        "total": float(pedido[2]),
                        "cliente": {
                            "id_cliente": pedido[3],
                            "nombre": pedido[4],
                            "direccion": pedido[5],
                            "telefono": pedido[6],
                        },
                        "detalles": pizzas,
                    },
                    "exito": True,
                }
            ),
            200,
        )

    except Exception as ex:
        return jsonify({"mensaje": str(ex), "exito": False}), 500

@pedidos_bp.route("", methods=["POST"])
def registrar_pedido():

    datos = request.get_json()

    if not datos:
        return jsonify({"mensaje": "No se recibieron datos", "exito": False}), 400

    cliente = datos.get("cliente", {})
    pizzas = datos.get("pizzas", [])

    if not all(cliente.get(campo) for campo in ["nombre", "direccion", "telefono"]):
        return jsonify({"mensaje": "Faltan datos del cliente", "exito": False}), 400

    if not isinstance(pizzas, list) or len(pizzas) == 0:
        return (
            jsonify(
                {
                    "mensaje": "El pedido debe contener al menos una pizza",
                    "exito": False,
                }
            ),
            400,
        )

    cursor = None

    try:
        cursor = mysql.connection.cursor()

        # Iniciar transacción
        mysql.connection.begin()

        # 1. Registrar cliente
        sql_cliente = """
            INSERT INTO clientes
                (nombre, direccion, telefono)
            VALUES (%s, %s, %s)
        """

        cursor.execute(
            sql_cliente, (cliente["nombre"], cliente["direccion"], cliente["telefono"])
        )

        id_cliente = cursor.lastrowid

        # 2. Validar y calcular total
        total = 0
        detalles_validos = []

        for pizza in pizzas:

            tamano = pizza.get("tamano")
            ingredientes = pizza.get("ingredientes")
            cantidad = pizza.get("cantidad")
            subtotal = pizza.get("subtotal")

            if not tamano or ingredientes is None:
                raise ValueError("Cada pizza debe tener tamaño e ingredientes")

            if not isinstance(cantidad, int) or cantidad <= 0:
                raise ValueError("La cantidad debe ser un entero mayor a cero")

            if not isinstance(subtotal, (int, float)) or subtotal <= 0:
                raise ValueError("El subtotal debe ser mayor a cero")

            detalles_validos.append(
                (
                    tamano,
                    json.dumps(ingredientes, ensure_ascii=False),
                    cantidad,
                    subtotal,
                )
            )

            total += subtotal

        # 3. Registrar pedido
        sql_pedido = """
            INSERT INTO pedidos
                (id_cliente, fecha_pedido, total)
            VALUES (%s, NOW(), %s)
        """

        cursor.execute(sql_pedido, (id_cliente, total))

        id_pedido = cursor.lastrowid

        # 4. Registrar detalle de las pizzas
        sql_detalle = """
            INSERT INTO detalle_pedido
                (id_pedido, tamano, ingredientes, cantidad, subtotal)
            VALUES (%s, %s, %s, %s, %s)
        """

        for pizza in detalles_validos:
            cursor.execute(
                sql_detalle, (id_pedido, pizza[0], pizza[1], pizza[2], pizza[3])
            )

        # Confirmar todos los cambios
        mysql.connection.commit()

        return (
            jsonify(
                {
                    "mensaje": "Pedido registrado correctamente",
                    "id_pedido": id_pedido,
                    "id_cliente": id_cliente,
                    "total": float(total),
                    "exito": True,
                }
            ),
            201,
        )

    except ValueError as ex:
        mysql.connection.rollback()

        return jsonify({"mensaje": str(ex), "exito": False}), 400

    except Exception as ex:
        mysql.connection.rollback()

        return jsonify({"mensaje": str(ex), "exito": False}), 500

    finally:
        if cursor:
            cursor.close()
