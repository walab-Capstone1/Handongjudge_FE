import React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import './DraggablePanel.css';

const ItemTypes = {
  PANEL: 'panel'
};

const DraggablePanel = ({ 
  id, 
  type, 
  title, 
  children, 
  onMove, 
  canDrop = true,
  showDragHandle = true 
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.PANEL,
    item: { id, type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const [{ isOver, canDrop: canDropHere }, drop] = useDrop(() => ({
    accept: ItemTypes.PANEL,
    drop: (item) => {
      if (item.id !== id && onMove) {
        onMove(item.id, id);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));

  const opacity = isDragging ? 0.5 : 1;
  const backgroundColor = isOver && canDropHere ? 'rgba(88, 166, 255, 0.1)' : 'transparent';

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`draggable-panel ${isDragging ? 'dragging' : ''}`}
      data-panel-id={id}
      style={{ 
        opacity, 
        backgroundColor,
        transition: 'all 0.2s ease',
        position: 'relative',
        height: '100%',
        cursor: showDragHandle ? (isDragging ? 'grabbing' : 'grab') : 'default',
        zIndex: isDragging ? 1000 : 1
      }}
    >
      {showDragHandle && (
        <div className="drag-handle">
          <span className="drag-icon">⋮⋮</span>
          <span className="panel-title">{title}</span>
          {isOver && canDropHere && (
            <div className="drop-indicator">
              Drop here to swap panels
            </div>
          )}
        </div>
      )}
      <div className="panel-content">
        {children}
      </div>
    </div>
  );
};

export default DraggablePanel;
export { ItemTypes };
