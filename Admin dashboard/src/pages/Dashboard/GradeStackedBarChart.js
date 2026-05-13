// // import React from 'react';
// // import ReactApexChart from 'react-apexcharts';
// // import { Card, CardBody, CardTitle } from 'reactstrap';

// // const GradeStackedBarChart = ({ data = [] }) => {
// //   const allGrades = [
// //     ...new Set(data.flatMap((c) => c.data.map((g) => g.grade))),
// //   ];

// //   const series = data.map((curr) => ({
// //     name: curr.curriculum,
// //     data: allGrades.map((gName) => {
// //       const found = curr.data.find((d) => d.grade === gName);
// //       return found ? found.count : 0;
// //     }),
// //   }));

// //   const options = {
// //     chart: { stacked: true, toolbar: { show: false } },
// //     plotOptions: {
// //       bar: { horizontal: false, columnWidth: '35%', borderRadius: 4 },
// //     },
// //     xaxis: { categories: allGrades },
// //     colors: ['#556ee6', '#34c38f', '#f1b44c', '#f46a6a'],
// //     legend: { position: 'top', horizontalAlign: 'right' },
// //   };

// //   return (
// //     <Card>
// //       <CardBody>
// //         <CardTitle className="mb-4">Users by Grade (By Curriculum)</CardTitle>
// //         <ReactApexChart
// //           options={options}
// //           series={series}
// //           type="bar"
// //           height={300}
// //         />
// //       </CardBody>
// //     </Card>
// //   );
// // };
// // export default GradeStackedBarChart;

// import React from 'react';
// import ReactApexChart from 'react-apexcharts';

// const GradeStackedBarChart = ({ data = [] }) => {
//   const allGrades = [
//     ...new Set(data.flatMap((c) => c.data.map((g) => g.grade))),
//   ];

//   const series = data.map((curr) => ({
//     name: curr.curriculum,
//     data: allGrades.map((gName) => {
//       const found = curr.data.find((d) => d.grade === gName);
//       return found ? found.count : 0;
//     }),
//   }));

//   const options = {
//     chart: {
//       stacked: true,
//       toolbar: { show: false },
//       zoom: { enabled: false },
//     },
//     plotOptions: {
//       bar: {
//         horizontal: false,
//         columnWidth: '22%',
//         borderRadius: 6,
//         dataLabels: { total: { enabled: true, style: { fontWeight: 800 } } },
//       },
//     },
//     xaxis: {
//       categories: allGrades,
//       axisBorder: { show: false },
//       labels: { style: { colors: '#74788d', fontWeight: 500 } },
//     },
//     yaxis: { labels: { style: { colors: '#74788d' } } },
//     colors: ['#34c38f', '#556ee6', '#f1b44c', '#f46a6a'],
//     legend: {
//       position: 'top',
//       horizontalAlign: 'right',
//       markers: { radius: 12 },
//     },
//     grid: { borderColor: '#f1f1f1', strokeDashArray: 4 },
//     dataLabels: { enabled: false },
//   };

//   return (
//     <ReactApexChart options={options} series={series} type="bar" height={300} />
//   );
// };
// export default GradeStackedBarChart;

import React from 'react';
import ReactApexChart from 'react-apexcharts';

const GradeStackedBarChart = ({ data = [] }) => {
  const allGrades = [
    ...new Set(data.flatMap((c) => c.data.map((g) => g.grade))),
  ];

  const series = data.map((curr) => ({
    name: curr.curriculum,
    data: allGrades.map((gName) => {
      const found = curr.data.find((d) => d.grade === gName);
      return found ? found.count : 0;
    }),
  }));

  const options = {
    chart: {
      stacked: true,
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '22%',
        borderRadius: 6,
        dataLabels: { total: { enabled: true, style: { fontWeight: 800 } } },
      },
    },
    xaxis: {
      categories: allGrades,
      axisBorder: { show: false },
      labels: { style: { colors: '#74788d', fontWeight: 500 } },
    },
    yaxis: { labels: { style: { colors: '#74788d' } } },
    colors: ['#34c38f', '#556ee6', '#f1b44c', '#f46a6a'],
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      markers: { radius: 12 },
    },
    grid: { borderColor: '#f1f1f1', strokeDashArray: 4 },
    dataLabels: { enabled: false },
  };

  return (
    <div>
      {data.length > 0 ? (
        <ReactApexChart
          options={options}
          series={series}
          type="bar"
          height={300}
        />
      ) : (
        <div className="text-center py-5 text-muted">No grade data found</div>
      )}
    </div>
  );
};

export default GradeStackedBarChart;
