const pedidos = [
    {
      _id: "650c2f9a1f9f1a0098765432",
      cliente: "Juan Perez",
      mesa: 5,
      productos: [
        {
          productoId: "650c2f1a1f9f1a0012345678",
          nombre: "Pizza Margarita",
          cantidad: 2,
          precioUnitario: 1200
        },
        {
          productoId: "650c2f4d1f9f1a0012345681",
          nombre: "Bebida Cola",
          cantidad: 2,
          precioUnitario: 300
        }
      ],
      total: 3000, 
      estado: "pendiente",
      fechaPedido: new Date("2025-10-26T00:00:00Z"),
      fechaActualizacion: new Date("2025-10-26T00:00:00Z")
    }
  ];
  
  module.exports = pedidos;
  