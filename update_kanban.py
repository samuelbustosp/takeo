import re

with open('app/dashboard/orders/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Add imports
code = code.replace("import { OrderCard } from '@/components/dashboard/OrderCard';",
"""import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { OrderCard } from '@/components/dashboard/OrderCard';""")

# 2. Add onDragEnd function inside OrdersManagementPage
drag_end_fn = """
  const onDragEnd = async (result: any) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;

    if (source.droppableId !== destination.droppableId) {
      const targetCol = KANBAN_COLUMNS.find((c) => c.id === destination.droppableId);
      if (targetCol && targetCol.statuses.length > 0) {
        const orderId = draggableId;
        const newStatus = targetCol.statuses[0];
        
        // Optimistic UI update
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));

        try {
          await updateOrderStatus(orderId, newStatus, true);
        } catch(e) {
          console.error(e);
          loadOrders();
        }
      }
    }
  };

  const handleAdvanceStatus = async (e: React.MouseEvent, orderId: string, nextStatus: OrderStatus) => {"""
code = code.replace("  const handleAdvanceStatus = async (e: React.MouseEvent, orderId: string, nextStatus: OrderStatus) => {", drag_end_fn)

# 3. Replace Kanban view rendering
old_kanban = """      {/* Kanban Board View */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-start">
          {KANBAN_COLUMNS.map((col) => {
            const colOrders = filteredOrders.filter((o) => col.statuses.includes(o.status));
            const Icon = col.icon;

            return (
              <div
                key={col.id}
                className="bg-zinc-100/70 dark:bg-zinc-900/60 rounded-3xl p-3.5 border border-zinc-200/60 dark:border-zinc-800/60 flex flex-col gap-3 min-h-[450px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between px-2 pt-1">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-orange-500" />
                    <h3 className="font-extrabold text-xs uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      {col.title}
                    </h3>
                  </div>
                  <span className="w-6 h-6 rounded-full bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs font-bold flex items-center justify-center shadow-2xs">
                    {colOrders.length}
                  </span>
                </div>

                {/* Orders in this column */}
                <div className="flex flex-col gap-3 flex-1 overflow-y-auto max-h-[70vh] pr-0.5">
                  {colOrders.length === 0 ? (
                    <div className="h-32 flex items-center justify-center text-center text-xs text-zinc-400 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl">
                      Sin pedidos
                    </div>
                  ) : (
                    colOrders.map((order) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        onClick={() => setSelectedOrder(order)}
                        onAdvanceStatus={(e, next) => handleAdvanceStatus(e, order.id, next)}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : ("""

new_kanban = """      {/* Kanban Board View */}
      {viewMode === 'kanban' ? (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-start">
            {KANBAN_COLUMNS.map((col) => {
              const colOrders = filteredOrders.filter((o) => col.statuses.includes(o.status));
              const Icon = col.icon;

              return (
                <div
                  key={col.id}
                  className="bg-zinc-100/70 dark:bg-zinc-900/60 rounded-3xl p-3.5 border border-zinc-200/60 dark:border-zinc-800/60 flex flex-col gap-3 min-h-[450px]"
                >
                  <div className="flex items-center justify-between px-2 pt-1">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-orange-500" />
                      <h3 className="font-extrabold text-xs uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                        {col.title}
                      </h3>
                    </div>
                    <span className="w-6 h-6 rounded-full bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs font-bold flex items-center justify-center shadow-2xs">
                      {colOrders.length}
                    </span>
                  </div>

                  <Droppable droppableId={col.id}>
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`flex flex-col gap-3 flex-1 overflow-y-auto max-h-[70vh] pr-0.5 rounded-2xl transition-colors ${
                          snapshot.isDraggingOver ? 'bg-orange-50/50 dark:bg-orange-900/20' : ''
                        }`}
                      >
                        {colOrders.length === 0 && !snapshot.isDraggingOver && (
                          <div className="h-32 flex items-center justify-center text-center text-xs text-zinc-400 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl">
                            Sin pedidos
                          </div>
                        )}
                        {colOrders.map((order, index) => (
                          <Draggable key={order.id} draggableId={order.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={snapshot.isDragging ? 'opacity-90 shadow-2xl scale-105 transition-transform' : ''}
                              >
                                <OrderCard
                                  order={order}
                                  onClick={() => setSelectedOrder(order)}
                                  onAdvanceStatus={(e, next) => handleAdvanceStatus(e, order.id, next)}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      ) : ("""

code = code.replace(old_kanban, new_kanban)

with open('app/dashboard/orders/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
