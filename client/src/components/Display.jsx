import "../index.css";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Form, Button } from "react-bootstrap";
import { updateData } from "../store/inputSlice";

import BarChart from 'react-bar-chart';

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

  // data for chart
  const [chartData, setChartData] = useState([]);
  const margin = {top: 20, right: 20, bottom: 30, left: 40};

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

      chartData.length = 0; // clear original arr

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
      const PUNCTUAL_THRESHOLD = 5;
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

          // add in known delay data
          if (chartData.some(e => e.text === delay.amount)) {
            const delayIndex = chartData.findIndex(e => e.text === delay.amount);
            chartData[delayIndex].value++;
          } else {
            chartData.push({ text: delay.amount, value: 1 });
          }

          if (delay.amount <= PUNCTUAL_THRESHOLD) punctualDelays++;

          if (maxDelayAmt === -1 || delay.amount >= maxDelayAmt) {
            maxDelayAmt = delay.amount;
            maxDelay = delay;
          }
          if (minDelayAmt === -1 || delay.amount <= minDelayAmt) {
            minDelayAmt = delay.amount;
            minDelay = delay;
          }
        } else {
          if (onlySpecified && resultsFound) break;
        }
      }

      let medianDelay = 0;
      train.delays.sort((a, b) => {
        return a.amount - b.amount;
      });
      
      
      if (train.delays.length % 2 !== 0 && train.delays.length !== 1) {
        medianDelay =
          (train.delays[Math.floor(train.delays.length / 2)].amount +
            train.delays[Math.ceil(train.delays.length / 2)].amount) /
          2;
      } else if (train.delays.length % 2 === 0) {
        medianDelay = train.delays[train.delays.length / 2].amount;
      } else {
        medianDelay = train.delays[0].amount;
      }

      // add in missing gaps
      for (let i = 0; i < maxDelayAmt; i++) {
        if (!chartData.some(e => e.text === i)) {
          chartData.push({ text: i, value: 0 });
        }
      }

      // sort the delay data by amount
      chartData.sort((a, b) => {
        return a.text - b.text;
      });
      setChartData(chartData); // to force refresh of chart

      if (!resultsFound) {
        setDelayDisplay(
          <div>
            <p>No data was found (no data for selected day).</p>
          </div>
        );
      } else {
        setDelayDisplay(
          <div>
            <p><strong>
              Train {train.service} had an average delay of{" "}
              {Math.round((delaySum / count) * 100) / 100} minutes{" "}
              {onlySpecified ? `on ${date}` : `over the past ${intervalText}`},
              and a median delay of {Math.round(medianDelay * 100) / 100}{" "}
              minutes.
            </strong></p>
            <p>
              This train's punctuality ({PUNCTUAL_THRESHOLD} or less minutes late) is{" "}
              {Math.round((punctualDelays / count) * 100)}%
            </p>
            <p>
              Highest delay: {maxDelay.amount} minutes at {maxDelay.time} on {maxDelay.date}
            </p>
            <p>
              Smallest delay: {minDelay.amount} minutes at {minDelay.time} on {minDelay.date}
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const showChart = () => {
    return (
      <BarChart 
          width={1000}
          height={200}
          margin={margin}
          data={chartData}/>
    )
  }

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
      {data.service ? showChart() : ""}
    </div>
  );
};

export default Display;
