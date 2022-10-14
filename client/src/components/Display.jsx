import React, { useEffect, useState } from "react";

const Display = () => {
    const [trains, setTrains] = useState([]);
    const [test, setTest] = useState(null); // TESTING

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

      // just a test function - to be removed later
      useEffect(() => {
        async function getTrain() {
            const response = await fetch(`http://localhost:5000/train/4571`);
        
            if (!response.ok) {
              const message = `An error occurred: ${response.statusText}`;
              window.alert(message);
              return;
            }
        
            const train = await response.json();
            setTest(`Train ${train.service} was ${train.delays[1].amount} minutes late today.`);
          }
        
          getTrain();
  
          return;
      }, [])

    return (
        <div>
            <p><strong>SEPTA Delay History</strong></p>
            <p>{ test }</p>
        </div>
    )
};

export default Display;