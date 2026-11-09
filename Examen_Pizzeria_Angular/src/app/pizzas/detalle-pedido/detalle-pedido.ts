import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PizzeriaApiService } from '../pizzeria-api';
import { Pedido } from '../pedido';

@Component({
  imports: [CommonModule, RouterLink],
  selector: 'app-detalle-pedido',
  styleUrl: './detalle-pedido.css',
  templateUrl: './detalle-pedido.html',
})
export class DetallePedido implements OnInit {
  pedido: Pedido | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly api: PizzeriaApiService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (Number.isInteger(id) && id > 0) {
      this.api.obtenerPedido(id).subscribe({
        next: (respuesta) => {
          if (respuesta.exito) {
            this.pedido = respuesta.pedido;
          }
        }
      });
    }
  }

  ingredientesComoTexto(ingredientes: string[] | string): string {
    return Array.isArray(ingredientes) ? ingredientes.join(', ') : ingredientes;
  }
}
