import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Form, Button } from "react-bootstrap";
import { updateData } from "../store/inputSlice";

import { Calendar } from "react-calendar";
import 'react-calendar/dist/Calendar.css';

const Display = () => {
  // trains from database
  const [trains, setTrains] = useState([]);

  // user selections
  const [service, setService] = useState("");
  const [intervalDays, setIntervalDays] = useState("");
  const [date, setDate] = useState(null);

  // what to show
  const [delayDisplay, setDelayDisplay] = useState("");

  // temp store of user filled fields
  const dispatch = useDispatch();
  const data = useSelector((state) => state.input);

  // fetch trains from our DB
  useEffect(() => {
    async function getTrains() {
      const response = await fetch(`http://localhost:5000/train/`);

      if (!response.ok) {
        const message = `An error occurred: ${response.statusText}`;
        window.alert(message);
        return;
      }

      const trains = await response.json();
      setTrains(trains);
    }

    getTrains();

    return;
  }, [trains.length]);

  // if OK button pressed, display data
  useEffect(() => {
    /**
     * Get all delay data for this train from a specified earliest date
     * @param {*} date 
     */
    async function getTrain(date) {
      const response = await fetch(`http://localhost:5000/train/${data.service}/`);

      if (!response.ok) {
        const message = `An error occurred: ${response.statusText}`;
        window.alert(message);
        return;
      }

      const train = await response.json();
      if (!train) setDelayDisplay(``);
      else {
        let delaySum = 0;
        const numDelays = train.delays.length;

        let intervalText = '';

        switch (data.intervalDays) {
          case '1':
            intervalText = '24 hours';
            break;
          case '7':
            intervalText = '7 days';
            break;
          case '30':
            intervalText = '30 days';
            break;
          case '180':
            intervalText = '180 days';
            break;
          default:
            break;
        }

        const d = new Date(); // get the current date
        d.setDate(d.getDate() - data.intervalDays); // subtract days based on what we picked in dropdown (will only be any of 1 / 7 / 30 / 180 days here)

        console.log('A week before today is' + d.toLocaleDateString("en-US"));
        console.log(d > new Date(train.delays[0].datestring));
        console.log(new Date(train.delays[0].datestring) > d);

        for (let delay of train.delays) {
          delaySum += delay.amount;
        }
        
        setDelayDisplay(`Train ${train.service} had an average delay of ${Math.round(delaySum / numDelays)} minutes over the past ${intervalText}.`);
      }
    }

    /**
     * 
     * @param {*} date 
     */
    async function getTrainOnDay(date) {
      // TODO: implement this
    }

    getTrain(0);

    return;
  }, [data.service, data.intervalDays])

  const showCalendar = () => {
    return (
      <Calendar onChange={(value) => {
        setDate(value.toLocaleDateString("en-US"));
      }} />
    )
  }

  return (
    <div>
      <p>
        <strong>SEPTA Delay History</strong>
      </p>
      <Form>
        <Form.Label>Service </Form.Label>
        <Form.Control
          type="text"
          style={{ cursor: "text" }}
          placeholder="Service"
          onChange={(e) => {
            setService(e.target.value);
          }}
        />
        <br />
        <br />
        <Form.Label>Interval </Form.Label>
        <Form.Select
          onChange={(e) => {
            setIntervalDays(e.target.value);
          }}
        >
          <option value="0">(Select)</option>
          <option value="D">Choose Date</option>
          <option value="1">24 hours</option>
          <option value="7">7 days</option>
          <option value="30">30 days</option>
          <option value="180">180 days</option>
        </Form.Select>
      </Form>

      { intervalDays === 'D' ? showCalendar() : <br />}

      <Button
        variant="outline-primary"
        onClick={() => {
          dispatch(
            updateData({
              service: service,
              intervalDays: intervalDays
            })
          );
        }}
        disabled={intervalDays === '0'}
      >
        Submit
      </Button>
      
      <p>
        <em>{delayDisplay}</em>
      </p>
    </div>
  );
};

export default Display;
