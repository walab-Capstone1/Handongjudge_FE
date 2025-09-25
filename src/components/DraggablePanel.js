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
    canDrag: showDragHandle,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const [{ isOver, canDrop: canDropHere }, drop] = useDrop(() => ({
    accept: ItemTypes.PANEL,
    drop: (item, monitor) => {
      // 이미 처리된 드롭인지 확인
      if (monitor.didDrop()) {
        return;
      }
      
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
      ref={drop}
      className={`draggable-panel ${isDragging ? 'dragging' : ''}`}
      data-panel-id={id}
      style={{ 
        opacity, 
        backgroundColor,
        transition: 'all 0.2s ease',
        position: 'relative',
        height: '100%',
        cursor: 'default',
        zIndex: isDragging ? 1000 : 1
      }}
    >
      {showDragHandle && (
        <div 
          ref={drag} 
          className="drag-handle"
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
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
