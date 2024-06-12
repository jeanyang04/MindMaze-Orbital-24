import React from 'react'
import TimetableRow from './TimetableRow';

/*
  Test prop
 */

const testBlock = {
  id: 'test',
  name: 'wash dishes',
  startTime: '10:00',
  duration: '1:00',
  endTime: '11:00',
  day: 'Monday',
}

type Props = {
  day: string;
};

function TimetableDay(props: Props) {
  const {day} = props

  return (
    <li className="flex items-center p-4 border border-gray-200 rounded-md w-full">
      <div className="mr-4 font-medium min-w-[50px]">
        {day}
      </div>
      <div className="text-gray-700 flex-grow w-full">
        <TimetableRow blocks={[testBlock]} />
      </div>
    </li>
  )
}

export default TimetableDay