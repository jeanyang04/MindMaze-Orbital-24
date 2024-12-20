import React from "react";
import Timetable from "../../components/timetable/Timetable";
import { TimetablePopupProvider } from "../../contexts/TimetablePopupProvider";
import { TimeblockProvider } from "../../contexts/TimeblockProvider";

function TimetablePage() {
  return (
    <>
      <TimeblockProvider>
        <TimetablePopupProvider>
          <div className="pb-[51px]">
            <h1 className="text-3xl font-bold text-center text-white my-6">
              Timetable
            </h1>
            <div className="flex w-[99vw] justify-center items-center flex-col">
              <Timetable />
            </div>
          </div>
        </TimetablePopupProvider>
      </TimeblockProvider>
    </>
  );
}

export default TimetablePage;
