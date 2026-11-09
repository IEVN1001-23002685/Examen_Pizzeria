import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'pizzas',
        children: [
            {
                path: 'pedidos',
                loadComponent: () =>
                    import('./pizzas/pedidos/pedidos').then((c) => c.Pedidos),
            },
            {
                path: 'ventas',
                loadComponent: () =>
                    import('./pizzas/ventas/ventas').then((c) => c.Ventas),
            },
            {
                path: 'detalle-pedido/:id',
                loadComponent: () =>
                    import('./pizzas/detalle-pedido/detalle-pedido').then((c) => c.DetallePedido),
            },
        ]
    },
    {
        path: '',
        redirectTo: 'pizzas/pedidos',
        pathMatch: 'full'
    },
    {
        path: '**',
        redirectTo: 'pizzas/pedidos'
    }
];