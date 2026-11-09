import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PizzeriaApiService } from '../pizzeria-api';
import { Pedido } from '../pedido';
import { Pizza } from '../pizza';
import { Cliente } from '../cliente';
import { RespuestaVentasDia } from '../venta';

@Component({
  selector: 'app-pedidos',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './pedidos.html',
  styleUrl: './pedidos.css'
})
export class Pedidos implements OnInit {

  cliente: Cliente = {
    nombre: '',
    direccion: '',
    telefono: ''
  };

  tamanos = [
    { nombre: 'Chica', precio: 40 },
    { nombre: 'Mediana', precio: 80 },
    { nombre: 'Grande', precio: 120 }
  ];

  ingredientes = [
    { nombre: 'Jamón', precio: 10 },
    { nombre: 'Piña', precio: 10 },
    { nombre: 'Champiñones', precio: 10 }
  ];

  tamanoSeleccionado = 'Chica';
  ingredientesSeleccionados: string[] = [];
  cantidad = 1;

  pizzas: Pizza[] = [];
  pedidos: Pedido[] = [];
  ventasHoy: RespuestaVentasDia | null = null;
  pizzaSeleccionada: number | null = null;

  mensaje = '';
  error = '';

  constructor(private api: PizzeriaApiService) { }

  ngOnInit(): void {
    this.cargarPedidos();
    this.cargarVentasDelDia();
  }

  get precioBase(): number {
    return this.tamanos.find(t => t.nombre === this.tamanoSeleccionado)?.precio || 0;
  }

  get subtotalActual(): number {
    const precioIngredientes = this.ingredientes
      .filter(i => this.ingredientesSeleccionados.includes(i.nombre))
      .reduce((total, ingrediente) => total + ingrediente.precio, 0);

    return (this.precioBase + precioIngredientes) * this.cantidad;
  }

  get totalPedido(): number {
    return this.pizzas.reduce((total, pizza) => total + pizza.subtotal, 0);
  }

  alternarIngrediente(nombre: string): void {
    if (this.ingredientesSeleccionados.includes(nombre)) {
      this.ingredientesSeleccionados =
        this.ingredientesSeleccionados.filter(i => i !== nombre);
    } else {
      this.ingredientesSeleccionados.push(nombre);
    }
  }

  agregarPizza(): void {
    if (this.cantidad < 1 || !Number.isInteger(this.cantidad)) {
      this.error = 'La cantidad debe ser un número entero mayor a cero.';
      return;
    }

    this.error = '';

    this.pizzas.push({
      tamano: this.tamanoSeleccionado,
      ingredientes: [...this.ingredientesSeleccionados],
      cantidad: this.cantidad,
      subtotal: this.subtotalActual
    });

    this.ingredientesSeleccionados = [];
    this.cantidad = 1;
  }

  quitarPizza(indice: number): void {
    this.pizzas.splice(indice, 1);
    this.pizzaSeleccionada = null;
  }

  seleccionarPizza(indice: number): void {
    this.pizzaSeleccionada = indice;
  }

  quitarPizzaSeleccionada(): void {
    if (this.pizzaSeleccionada !== null) {
      this.quitarPizza(this.pizzaSeleccionada);
    }
  }

  terminarPedido(): void {
    this.mensaje = '';
    this.error = '';

    if (!this.cliente.nombre.trim() ||
      !this.cliente.direccion.trim() ||
      !this.cliente.telefono.trim()) {
      this.error = 'Completa todos los datos del cliente.';
      return;
    }

    if (this.pizzas.length === 0) {
      this.error = 'Agrega al menos una pizza al pedido.';
      return;
    }

    this.api.registrarPedido({
      cliente: this.cliente,
      pizzas: this.pizzas
    }).subscribe({
      next: (respuesta: any) => {
        if (respuesta.exito) {
          this.mensaje = respuesta.mensaje || 'Pedido registrado correctamente.';

          this.cliente = {
            nombre: '',
            direccion: '',
            telefono: ''
          };

          this.pizzas = [];
          this.pizzaSeleccionada = null;
          this.cargarPedidos();
          this.cargarVentasDelDia();
        } else {
          this.error = respuesta.mensaje || 'No fue posible registrar el pedido.';
        }
      },
      error: (respuesta) => {
        this.error = respuesta.error?.mensaje || 'Error al conectar con el servidor.';
      }
    });
  }

  cargarPedidos(): void {
    this.api.getPedidos().subscribe({
      next: (respuesta) => {
        if (respuesta.exito) {
          this.pedidos = respuesta.pedidos;
        }
      },
      error: () => {
        this.error = 'No fue posible cargar los pedidos.';
      }
    });
  }

  cargarVentasDelDia(): void {
    const hoy = new Date();
    const fecha = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;

    this.api.obtenerVentasDia(fecha).subscribe({
      next: (respuesta) => {
        if (respuesta.exito) {
          this.ventasHoy = respuesta;
        }
      }
    });
  }
}
