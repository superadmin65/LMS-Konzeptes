// import React from 'react';
// import ReactApexChart from 'react-apexcharts';
// import { Card, CardBody, CardTitle } from 'reactstrap';

// const LanguagePieChart = ({ data = [] }) => {
//   const series = data.map((i) => i.count || 0);
//   const options = {
//     labels: data.map((i) => i.label || 'N/A'),
//     colors: ['#556ee6', '#34c38f', '#f1b44c', '#f46a6a'],
//     legend: { position: 'bottom' },
//     plotOptions: { pie: { donut: { size: '70%' } } },
//     dataLabels: { enabled: false },
//   };

//   return (
//     <Card>
//       <CardBody>
//         <CardTitle className="mb-4">User Languages</CardTitle>
//         {data.length > 0 ? (
//           <ReactApexChart
//             options={options}
//             series={series}
//             type="donut"
//             height={300}
//           />
//         ) : (
//           <div className="text-center py-5 text-muted">No language data</div>
//         )}
//       </CardBody>
//     </Card>
//   );
// };
// export default LanguagePieChart;

import React from 'react';
import ReactApexChart from 'react-apexcharts';

const LanguagePieChart = ({ data = [] }) => {
  const series = data.map((i) => i.count || 0);
  const options = {
    labels: data.map((i) => i.label || 'N/A'),
    colors: ['#34c38f', '#556ee6', '#f1b44c', '#f46a6a', '#74788d'],
    legend: {
      position: 'bottom',
      markers: { radius: 12, offsetX: -5 },
      itemMargin: { horizontal: 10, vertical: 5 },
    },
    stroke: { width: 3, colors: ['#ffffff'] },
    plotOptions: {
      pie: {
        donut: {
          size: '75%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total Users',
              color: '#74788d',
              fontSize: '14px',
            },
          },
        },
      },
    },
    dataLabels: { enabled: false },
  };

  return (
    <div style={{ minHeight: '300px' }}>
      {data.length > 0 ? (
        <ReactApexChart
          options={options}
          series={series}
          type="donut"
          height={300}
        />
      ) : (
        <div className="text-center py-5 text-muted">No language data</div>
      )}
    </div>
  );
};

export default LanguagePieChart;
