import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Form, Button } from "react-bootstrap";
import { updateData } from "../store/inputSlice";

const Display = () => {
  const [trains, setTrains] = useState([]);

  const [service, setService] = useState("");
  const [intervalDays, setIntervalDays] = useState("");

  const [delayDisplay, setDelayDisplay] = useState("");

  const dispatch = useDispatch();
  const data = useSelector((state) => state.input);

  // fetch Trains from our DB
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

  useEffect(() => {
    if (data.intervalDays === '0') {
      alert("Please select an interval")
      return;
    }

    async function getTrain() {
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
        let numDelays = train.delays.length;

        for (let delay of train.delays) {
          delaySum += delay.amount;
        }

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
        
        setDelayDisplay(`Train ${train.service} had an average delay of ${Math.round(delaySum / numDelays)} minutes over the past ${intervalText}.`);
      }
    }

    getTrain();

    return;
  }, [data.service, data.intervalDays])

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
          <option value="1">24 hours</option>
          <option value="7">7 days</option>
          <option value="30">30 days</option>
          <option value="180">180 days</option>
        </Form.Select>
      </Form>
      <br />
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
