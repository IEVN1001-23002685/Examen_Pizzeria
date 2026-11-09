from flask import Flask, jsonify
from flask_cors import CORS

from config import config
from database import mysql

from blueprints.pedidos.routes import pedidos_bp
from blueprints.ventas.routes import ventas_bp

app = Flask(__name__)

app.config.from_object(config["development"])

mysql.init_app(app)

CORS(app)

app.register_blueprint(pedidos_bp)
app.register_blueprint(ventas_bp)


def pagina_no_encontrada(error):
    return jsonify({"mensaje": "Recurso no encontrado", "exito": False}), 404


app.register_error_handler(404, pagina_no_encontrada)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=app.config["DEBUG"])
