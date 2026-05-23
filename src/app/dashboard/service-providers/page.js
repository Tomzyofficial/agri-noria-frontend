import React, { useEffect, useState } from "react";

const ServiceProvidersDashboard = () => {
  const [services, setServices] = useState([]);

  useEffect(() => {
    fetch("/api/services")
      .then((response) => response.json())
      .then((data) => setServices(data));
  }, []);

  return (
    <div>
      <h1>Service Providers Dashboard</h1>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {services.map((service) => (
            <tr key={service.id}>
              <td>{service.title}</td>
              <td>{service.description}</td>
              <td>{service.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ServiceProvidersDashboard;
