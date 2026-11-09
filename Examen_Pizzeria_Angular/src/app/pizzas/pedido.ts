
import { Pizza } from './pizza';

export interface Cliente {
  id_cliente?: number;
  nombre: string;
  direccion: string;
  telefono: string;
}

export interface Pedido {
  id_pedido: number;
  fecha_pedido: string;
  total: number;
  cliente: Cliente;
  detalles?: Pizza[];
}

export interface NuevoPedido {
  cliente: Cliente;
  pizzas: Pizza[];
}

export interface RespuestaPedido {
  mensaje: string;
  id_pedido: number;
  id_cliente: number;
  total: number;
  exito: boolean;
}

export interface RespuestaPedidos {
  pedidos: Pedido[];
  exito: boolean;
}

export interface RespuestaDetallePedido {
  pedido: Pedido;
  exito: boolean;
}
