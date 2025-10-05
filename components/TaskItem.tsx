
import React, { useState } from 'react';
import { Task } from '../types';
import { CheckIcon } from './Icons';

interface TaskItemProps {
  task: Task;
}

const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const [isCompleted, setIsCompleted] = useState(task.completed);

  return (
    <div
      onClick={() => setIsCompleted(!isCompleted)}
      className="flex items-center justify-between p-3 frosted-glass-card rounded-lg soft-shadow cursor-pointer border border-transparent hover:border-[#9B59B6]/40 transition-all duration-300"
    >
      <p className={`transition-colors duration-300 font-medium ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-200'}`}>
        {task.text}
      </p>
      <div className={`w-6 h-6 flex-shrink-0 rounded-md border-2 flex items-center justify-center transition-all duration-300 ${isCompleted ? 'bg-[#9B59B6] border-[#9B59B6]' : 'border-gray-500'}`}>
        {isCompleted && <CheckIcon className="w-4 h-4 text-white" />}
      </div>
    </div>
  );
};

export default TaskItem;
