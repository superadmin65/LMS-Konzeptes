import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { Card, CardBody, CardTitle } from 'reactstrap';

const CurriculumAreaChart = ({ data }) => {
  const safeData = Array.isArray(data) ? data : [];

  const options = {
    chart: { toolbar: { show: false } },
    stroke: { curve: 'smooth', width: 2 },
    xaxis: { categories: safeData.map((i) => i.curriculum || 'N/A') },
    colors: ['#f1b44c'],
    fill: {
      type: 'gradient',
      gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.1 },
    },
  };

  const series = [{ name: 'Users', data: safeData.map((i) => i.count || 0) }];

  return (
    <Card>
      <CardBody>
        <CardTitle className="mb-4">Curriculum Enrollment</CardTitle>
        {safeData.length > 0 ? (
          <ReactApexChart
            options={options}
            series={series}
            type="area"
            height={325}
          />
        ) : (
          <div className="text-center py-5 text-muted">
            No data available for curriculum.
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default CurriculumAreaChart;
