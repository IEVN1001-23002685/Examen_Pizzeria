import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
    Pedido,
    NuevoPedido,
    RespuestaPedido,
    RespuestaPedidos,
    RespuestaDetallePedido
} from './pedido';

import {
    RespuestaVentasDia,
    RespuestaVentasSemana,
    RespuestaVentasMes
} from './venta';

@Injectable({
    providedIn: 'root'
})
export class PizzeriaApiService {

    private apiUrl = 'http://127.0.0.1:5000/api';

    constructor(private http: HttpClient) { }

    getPedidos(): Observable<{ pedidos: Pedido[]; exito: boolean }> {
        return this.http.get<{ pedidos: Pedido[]; exito: boolean }>(
            `${this.apiUrl}/pedidos`
        );
    }

    obtenerPedidos(): Observable<RespuestaPedidos> {
        return this.http.get<RespuestaPedidos>(`${this.apiUrl}/pedidos`);
    }

    obtenerPedido(id: number): Observable<RespuestaDetallePedido> {
        return this.http.get<RespuestaDetallePedido>(`${this.apiUrl}/pedidos/${id}`);
    }

    registrarPedido(pedido: NuevoPedido): Observable<RespuestaPedido> {
        return this.http.post<RespuestaPedido>(`${this.apiUrl}/pedidos`, pedido);
    }

    obtenerVentasDia(fecha: string): Observable<RespuestaVentasDia> {
        return this.http.get<RespuestaVentasDia>(`${this.apiUrl}/ventas/dia/${fecha}`);
    }

    obtenerVentasDiaSemana(dia: string): Observable<RespuestaVentasSemana> {
        return this.http.get<RespuestaVentasSemana>(
            `${this.apiUrl}/ventas/dia-semana/${encodeURIComponent(dia)}`
        );
    }

    obtenerVentasMes(anio: number, mes: number): Observable<RespuestaVentasMes> {
        return this.http.get<RespuestaVentasMes>(
            `${this.apiUrl}/ventas/mes/${anio}/${mes}`
        );
    }
}
