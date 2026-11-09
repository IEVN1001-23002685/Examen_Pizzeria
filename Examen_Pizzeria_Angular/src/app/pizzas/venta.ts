
export interface VentaDia {
  fecha: string;
  cantidad_pedidos: number;
  total_ventas: number;
}

export interface VentaPedido {
  id_pedido: number;
  fecha_pedido: string;
  total: number;
  cliente: {
    nombre: string;
    direccion: string;
    telefono: string;
  };
}

export interface RespuestaVentasDia {
  fecha: string;
  total_pedidos: number;
  total_ventas: number;
  pedidos: VentaPedido[];
  exito: boolean;
}

export interface RespuestaVentasSemana {
  dia_semana: string;
  total_pedidos: number;
  total_ventas: number;
  ventas: VentaDia[];
  exito: boolean;
}

export interface RespuestaVentasMes {
  anio: number;
  mes: number;
  total_pedidos: number;
  total_ventas: number;
  ventas_por_dia: VentaDia[];
  exito: boolean;
}
