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
     * Get all delay data for this train, either on an interval or specific date
     * @param {Date} date If onlySpecified is true, the date to pick data from. Else, the date to START picking data from
     * @param {boolean} onlySpecified See above
     */
    async function getTrain(date, onlySpecified) {
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
      if (!train) {
        setDelayDisplay(`No data was found (no data for this train).`);
        return;
      }
      let resultsFound = false;
      let delaySum = 0;
      let punctualDelays = 0; // 5 or less minutes late
      let count = 0;

      let intervalText = "";

      let maxDelayAmt = -1;
      let minDelayAmt = -1;
      let maxDelay, minDelay;

      if (!onlySpecified) {
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
      }

      for (const delay of train.delays) {
        if (
          (new Date(delay.datestring) >= date && !onlySpecified) ||
          (new Date(delay.datestring).toLocaleDateString("en-US") === date &&
            onlySpecified)
        ) {
          resultsFound = true;
          delaySum += delay.amount;
          count++;

          if (delay.amount <= 5) punctualDelays++;

          if (maxDelayAmt === -1 || delay.amount > maxDelayAmt) {
            maxDelayAmt = delay.amount;
            maxDelay = delay;
          }
          if (minDelayAmt === -1 || delay.amount < minDelayAmt) {
            minDelayAmt = delay.amount;
            minDelay = delay;
          }
        } else {
          if (onlySpecified && resultsFound) break;
        }
      }

      let medianDelay = 0;
      if (train.delays.length % 2 !== 0) {
        medianDelay =
          (train.delays[Math.floor(train.delays.length / 2)].amount +
            train.delays[Math.ceil(train.delays.length / 2)].amount) /
          2;
      } else {
        medianDelay = train.delays[train.delays.length / 2].amount;
      }

      if (!resultsFound) {
        setDelayDisplay(
          <div>
            <p>No data was found (no data for selected day).</p>
          </div>
        );
      } else {
        setDelayDisplay(
          <div>
            <p>
              Train {train.service} had an average delay of{" "}
              {Math.round((delaySum / count) * 100) / 100} minutes{" "}
              {onlySpecified ? `on ${date}` : `over the past ${intervalText}`},
              and a median delay of {Math.round(medianDelay * 100) / 100}{" "}
              minutes.
            </p>
            <p>
              This train's punctuality (5 or less minutes late) is{" "}
              {Math.round((punctualDelays / count) * 100)}%
            </p>
            <p>
              Highest delay: {maxDelay.amount} minutes at {maxDelay.time}
            </p>
            <p>
              Smallest delay: {minDelay.amount} minutes at {minDelay.time}
            </p>
          </div>
        );
      }
    }

    if (data.intervalDays === "D") {
      getTrain(data.date, true);
    } else {
      const d = new Date();
      d.setDate(d.getDate() - data.intervalDays);
      getTrain(d, false);
    }
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
          maxDate={new Date()}
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
              date: date,
            })
          );
        }}
        disabled={intervalDays === "0" || !intervalDays || !service}
      >
        Submit
      </Button>
      <br />
      {delayDisplay}
    </div>
  );
};

export default Display;
