import "../index.css";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Form, Button } from "react-bootstrap";
import { updateData } from "../store/inputSlice";

import { Calendar } from "react-calendar";
import "react-calendar/dist/Calendar.css";

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
     * @param {*} date The earliest date to use data from
     */
    async function getTrain(date) {
      if (!data.service) return; // function executed on page load

      const response = await fetch(
        `http://localhost:5000/train/${data.service}/`
      );

      if (!response.ok) {
        const message = `An error occurred: ${response.statusText}`;
        window.alert(message);
        return;
      }

      const train = await response.json();
      if (!train)
        setDelayDisplay(`No data was found (no data for this train).`);
      else {
        let resultsFound = false;
        let delaySum = 0;
        const numDelays = train.delays.length;

        let intervalText = "";

        switch (data.intervalDays) {
          case "1":
            intervalText = "24 hours";
            break;
          case "7":
            intervalText = "7 days";
            break;
          case "30":
            intervalText = "30 days";
            break;
          case "180":
            intervalText = "180 days";
            break;
          default:
            break;
        }

        for (let delay of train.delays) {
          if (new Date(delay.datestring) >= date) {
            resultsFound = true;
            delaySum += delay.amount;
          }
        }

        setDelayDisplay(
          resultsFound
            ? `Train ${train.service} had an average delay of ${Math.round(
                delaySum / numDelays
              )} minutes over the past ${intervalText}.`
            : `No data was found (no data over selected interval).`
        );
      }
    }

    /**
     *
     * @param {*} date
     */
    async function getTrainOnDay(date) {
      if (!data.service) return; // function executed on page load

      const response = await fetch(
        `http://localhost:5000/train/${data.service}/`
      );

      if (!response.ok) {
        const message = `An error occurred: ${response.statusText}`;
        window.alert(message);
        return;
      }

      const train = await response.json();
      if (!train)
        setDelayDisplay(`No data was found (no data for this train).`);
      else {
        let resultsFound = false;
        let delaySum = 0;
        const numDelays = train.delays.length;

        for (let delay of train.delays) {
          if (new Date(delay.datestring).toLocaleDateString("en-US") === date) {
            resultsFound = true;
            delaySum += delay.amount;
          } else {
            if (resultsFound) {
              break;
            }
          }
        }

        setDelayDisplay(
          resultsFound
            ? `Train ${train.service} had an average delay of ${Math.round(
                delaySum / numDelays
              )} minutes on ${date}.`
            : `No data was found (no data for selected day).`
        );
      }
    }

    if (data.intervalDays === 'D') {
      console.log('h');
      getTrainOnDay(data.date);
    } else {
      const d = new Date();
      d.setDate(d.getDate() - data.intervalDays);
      getTrain(d);
    }

    return;
  }, [data.service, data.intervalDays, data.date]);

  const showCalendar = () => {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Calendar
          onChange={(value) => {
            setDate(value.toLocaleDateString("en-US"));
          }}
        />
      </div>
    );
  };

  return (
    <div>
      <p>
        <strong>SEPTA Delay History</strong>
      </p>
      <Form>
        <Form.Label>Train Number </Form.Label>
        <Form.Control
          type="text"
          style={{ cursor: "text" }}
          placeholder="Train Number"
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
      <br />
      {intervalDays === "D" ? showCalendar() : ""}

      <Button
        variant="outline-primary"
        onClick={() => {
          dispatch(
            updateData({
              service: service,
              intervalDays: intervalDays,
              date: date
            })
          );
        }}
        disabled={intervalDays === "0"}
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
