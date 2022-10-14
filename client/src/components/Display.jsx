import React, { useEffect, useState } from "react";

const Display = () => {
    const [trains, setTrains] = useState([]);

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

    return (
        <p><strong>SEPTA Delay History</strong></p>
    )
};

export default Display;