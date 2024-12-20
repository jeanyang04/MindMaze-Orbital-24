import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { useAuth } from "./AuthProvider";
import axios from "axios";
import { unpackHabitData } from "../utils/habits";
import { HabitData } from "../types/habits";
import { setHeapSnapshotNearHeapLimit } from "v8";

interface Habit {
  id: string;
  name: string;
  day: string;
  streak: number;
  completed: boolean;
  lastCompleted?: Date;
}

interface HabitsContextType {
  habits: Habit[];
  addHabit: (habit: Habit) => void;
  deleteHabit: (id: string) => void;
  fetchHabits: () => void;
  completeHabit: (habit: Habit) => void;
}

const HabitsContext = createContext<HabitsContextType | undefined>(undefined);

export const useHabits = (): HabitsContextType => {
  const context = useContext(HabitsContext);
  if (!context) {
    throw new Error("useHabits must be used within a HabitsProvider");
  }
  return context;
};

export const handleCompleteHabit = (habit: Habit) => {

}

export const HabitsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { currentUser, token } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);

  const getUid = async () => currentUser?.uid;
  const fetchHabits = async () => {
    try {
      const uid = await getUid();
      console.log(uid);
      const response = await axios.get(`/api/habits/${uid}`, {
        headers: {
          Authorization: "Bearer " + token,
        },
      });
      console.log("Response data:", response.data);
      const habits = unpackHabitData(response.data);
      setHabits(habits);
      console.log("Successfully fetched habits");
    } catch (error) {
      console.error("Error fetching habits:", error);
    }
  };

  const addHabit = (habit: Habit) => {
    setHabits((prevHabits) => [...prevHabits, habit]);
  };

  const deleteHabit = async (id: string) => {
    const uid = currentUser?.uid;
    try {
      await axios.delete(`/api/habits/${uid}/${id}`, {
        headers: {
          Authorization: "Bearer " + token,
        },
      });
      console.log(id + "Habit deleted successfully!");
      setHabits((prevHabits) => prevHabits.filter((habit) => habit.id !== id));
    } catch (error) {
      console.error("Error deleting habit:", error);
    }
  };

  // CHANGE TO COMPLETION LOGIC
  const completeHabit = async (updatedHabit: Habit) => {
    const uid = currentUser?.uid;
    try {
      // await axios.put(`/api/habits/${uid}/${updatedHabit.id}`, {
      //   headers: {
      //     Authorization: "Bearer " + token,
      //   },
      // });
      await axios.put(`/api/habits/${uid}/${updatedHabit.id}`, {}, {
        headers: {
          Authorization: 'Bearer ' + token,
        },
      });
      console.log(uid, updatedHabit.id)
      console.log("Habit updated successfully!");
      setHabits((prevHabits) =>
        prevHabits.map((habit) =>
          (habit.id === updatedHabit.id && habit.day === updatedHabit.day) ? updatedHabit : habit
        )
      );
      setHabits((prevHabits) =>
        prevHabits.map((habit) =>
          (habit.id === updatedHabit.id && habit.day !== updatedHabit.day) ? {...habit, streak: habit.streak + 1} : habit
        )
      );
    } catch (error) {
      console.error("Error updating habit:", error);
    }
  };

  return (
    <HabitsContext.Provider
      value={{ habits, addHabit, deleteHabit, fetchHabits, completeHabit }}
    >
      {children}
    </HabitsContext.Provider>
  );
};
