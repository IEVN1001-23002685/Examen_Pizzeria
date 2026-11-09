import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PizzeriaApiService } from '../pizzeria-api';
import { RespuestaVentasDia, RespuestaVentasMes, RespuestaVentasSemana } from '../venta';

@Component({
  imports: [CommonModule, FormsModule],
  selector: 'app-ventas',
  styleUrl: './ventas.css',
  templateUrl: './ventas.html',
})
export class Ventas {
  fecha = new Date().toISOString().slice(0, 10);
  diaSemana = 'lunes';
  anio = new Date().getFullYear();
  mes = new Date().getMonth() + 1;

  ventaDia: RespuestaVentasDia | null = null;
  ventaSemana: RespuestaVentasSemana | null = null;
  ventaMes: RespuestaVentasMes | null = null;

  diasSemana = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
  meses = [
    { valor: 1, nombre: 'Enero' }, { valor: 2, nombre: 'Febrero' }, { valor: 3, nombre: 'Marzo' },
    { valor: 4, nombre: 'Abril' }, { valor: 5, nombre: 'Mayo' }, { valor: 6, nombre: 'Junio' },
    { valor: 7, nombre: 'Julio' }, { valor: 8, nombre: 'Agosto' }, { valor: 9, nombre: 'Septiembre' },
    { valor: 10, nombre: 'Octubre' }, { valor: 11, nombre: 'Noviembre' }, { valor: 12, nombre: 'Diciembre' }
  ];

  constructor(private readonly api: PizzeriaApiService) {}

  consultarPorFecha(): void {
    if (this.fecha) {
      this.api.obtenerVentasDia(this.fecha).subscribe({
        next: (respuesta) => this.ventaDia = respuesta.exito ? respuesta : null
      });
    }
  }

  consultarPorDiaSemana(): void {
    this.api.obtenerVentasDiaSemana(this.diaSemana).subscribe({
      next: (respuesta) => this.ventaSemana = respuesta.exito ? respuesta : null
    });
  }

  consultarPorMes(): void {
    if (Number.isInteger(this.anio) && this.anio >= 2000 && this.anio <= 2100) {
      this.api.obtenerVentasMes(this.anio, this.mes).subscribe({
        next: (respuesta) => this.ventaMes = respuesta.exito ? respuesta : null
      });
    }
  }
}
