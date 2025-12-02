import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X } from 'lucide-react';

interface SortableBrandItemProps {
    id: string;
    color: string;
    name: string;
    onRemove: (id: string) => void;
}

export const SortableBrandItem: React.FC<SortableBrandItemProps> = ({ id, color, name, onRemove }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 1 : 0,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="group flex items-center justify-between p-2.5 bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-all mb-2"
        >
            <div className="flex items-center gap-2 overflow-hidden flex-1">
                <div {...attributes} {...listeners} className="cursor-grab text-gray-300 hover:text-gray-500 mr-1 touch-none focus:outline-none">
                    <GripVertical className="w-4 h-4" />
                </div>
                <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: color }}
                />
                <span className="text-sm font-medium text-gray-700 truncate select-none" title={name}>{name}</span>
            </div>
            <button
                onClick={() => onRemove(id)}
                className="text-gray-300 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors"
            >
                <X className="w-3.5 h-3.5" />
            </button>
        </div>
    );
};
