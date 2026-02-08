import type React from "react";
import { useDrag, useDrop } from "react-dnd";
import * as S from "./styles";

const ItemTypes = {
	PANEL: "panel",
};

interface DragItem {
	id: string;
	type: string;
}

interface DraggablePanelProps {
	id: string;
	type: string;
	title: string;
	children: React.ReactNode;
	onMove?: (draggedId: string, hoverId: string) => void;
	canDrop?: boolean;
	showDragHandle?: boolean;
}

const DraggablePanel: React.FC<DraggablePanelProps> = ({
	id,
	type,
	title,
	children,
	onMove,
	canDrop = true,
	showDragHandle = true,
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
		drop: (item: DragItem, monitor) => {
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
	const backgroundColor =
		isOver && canDropHere ? "rgba(88, 166, 255, 0.1)" : "transparent";

	return (
		<div
			ref={drop as unknown as React.Ref<HTMLDivElement>}
			style={{
				opacity,
				backgroundColor,
				transition: "all 0.2s ease",
				position: "relative",
				height: "100%",
				cursor: "default",
				zIndex: isDragging ? 1000 : 1,
			}}
		>
			<S.Panel data-panel-id={id} $dragging={isDragging}>
				{showDragHandle && (
					<div
						ref={drag as unknown as React.Ref<HTMLDivElement>}
						style={{ cursor: isDragging ? "grabbing" : "grab" }}
					>
						<S.DragHandle $dragging={isDragging}>
							<S.DragIcon>⋮⋮</S.DragIcon>
							<S.PanelTitle>{title}</S.PanelTitle>
							{isOver && canDropHere && (
								<S.DropIndicator>Drop here to swap panels</S.DropIndicator>
							)}
						</S.DragHandle>
					</div>
				)}
				<S.PanelContent>{children}</S.PanelContent>
			</S.Panel>
		</div>
	);
};

export default DraggablePanel;
export { ItemTypes };
