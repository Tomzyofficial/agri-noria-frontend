import React, { useEffect, useState } from "react";

const ServicesListing = () => {
  const [services, setServices] = useState([]);

  useEffect(() => {
    fetch("/api/services")
      .then((response) => response.json())
      .then((data) => setServices(data));
  }, []);

  return (
    <div>
      <h1>Available Services</h1>
      <div>
        {services.map((service) => (
          <div key={service.id}>
            <h2>{service.title}</h2>
            <p>{service.description}</p>
            <p>Price: ${service.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServicesListing;
