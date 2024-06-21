import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Habit {
  id: number;
  name: string;
  day: string;
}

interface HabitsContextType {
  habits: Habit[];
  addHabit: (habit: Habit) => void;
  deleteHabit: (id: number) => void
}

const HabitsContext = createContext<HabitsContextType | undefined>(undefined);

export const useHabits = (): HabitsContextType => {
    const context = useContext(HabitsContext);
    if (!context) {
      throw new Error('useHabits must be used within a HabitsProvider');
    }
    return context;
};
  

export const HabitsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [habits, setHabits] = useState<Habit[]>([]);

  const addHabit = (habit: Habit) => {
    setHabits((prevHabits) => [...prevHabits, habit]);
  };

  const deleteHabit = (id: number) => {
    setHabits((prevHabits) => prevHabits.filter((habit) => habit.id !== id));
  }

  return (
    <HabitsContext.Provider value={{ habits, addHabit, deleteHabit}}>
      {children}
    </HabitsContext.Provider>
  );
};