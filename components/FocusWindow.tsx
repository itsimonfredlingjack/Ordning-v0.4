import React from 'react';
import { Task, CalendarEvent } from '../types';
import TaskItem from './TaskItem';
import { useCountdown } from '../hooks/useCountdown';

interface FocusWindowProps {
  tasks: Task[];
  event: CalendarEvent;
}

const FocusWindow: React.FC<FocusWindowProps> = ({ tasks, event }) => {
  const timeLeft = useCountdown(event.time);

  return (
    <div className="w-full h-full p-8 frosted-glass rounded-2xl soft-shadow flex flex-col">
      <h2 className="text-sm font-semibold tracking-widest text-gray-400 uppercase mb-2">NEXT EVENT</h2>
      <div className="mb-8">
        <p className="text-xl text-white mb-1">{event.title}</p>
        <div className="flex items-baseline space-x-2 text-[#9B59B6]">
          <span className="text-5xl font-semibold tracking-tighter">{timeLeft.hours}</span>
          <span className="text-2xl opacity-75">h</span>
          <span className="text-5xl font-semibold tracking-tighter">{timeLeft.minutes}</span>
          <span className="text-2xl opacity-75">m</span>
          <span className="text-5xl font-semibold tracking-tighter">{timeLeft.seconds}</span>
          <span className="text-2xl opacity-75">s</span>
        </div>
      </div>
      <h2 className="text-sm font-semibold tracking-widest text-gray-400 uppercase mb-4">PRIORITY TASKS</h2>
      <div className="space-y-3">
        {tasks.map(task => (
          <TaskItem key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
};

export default FocusWindow;
