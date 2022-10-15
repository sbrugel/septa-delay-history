import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Form, Button } from "react-bootstrap";
import { updateData } from "../store/inputSlice";

const Display = () => {
  const [trains, setTrains] = useState([]);
  const [service, setService] = useState("");
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
    async function getTrain() {
      const response = await fetch(`http://localhost:5000/train/${data.service}/`);

      if (!response.ok) {
        const message = `An error occurred: ${response.statusText}`;
        window.alert(message);
        return;
      }

      const train = await response.json();
      if (!train) setDelayDisplay(``);
      else setDelayDisplay(`Train ${train.service} was last seen running ${train.delays[1].amount > 0 ? `${train.delays[1].amount} minute${train.delays[1].amount !== 1 ? 's' : ''} late` : `on time`}`);
    }

    getTrain();

    return;
  }, [data.service])

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
        <Form.Select
          onChange={(e) => {
            console.log(e.target.value);
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
