import React from 'react';
import ReactApexChart from 'react-apexcharts';

const PerformanceAreaChart = ({ data = [] }) => {
  const categories = data.map((d) => d.label);
  const series = [{ name: 'Registrations', data: data.map((d) => d.count) }];

  const options = {
    chart: {
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
        },
      },
      zoom: { enabled: false },
    },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 4, lineCap: 'round' },
    colors: ['#34c38f'],
    xaxis: {
      categories: categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: '#74788d' } },
    },
    yaxis: { labels: { style: { colors: '#74788d' } } },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        inverseColors: false,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [20, 100],
      },
    },
    grid: { borderColor: '#f1f1f1', strokeDashArray: 3 },
    markers: {
      size: 6,
      colors: ['#34c38f'],
      strokeColors: '#fff',
      strokeWidth: 3,
      hover: { size: 8 },
    },
    tooltip: {
      theme: 'light',
      x: { show: true },
      y: { formatter: (val) => val + ' Students' },
    },
  };

  return (
    <div style={{ width: '100%' }}>
      {/* This style block forces the ApexCharts download menu
        to keep text on one line without wrapping
      */}
      <style>
        {`
          .apexcharts-menu {
            min-width: 130px !important;
          }
          .apexcharts-menu-item {
            white-space: nowrap !important;
          }
        `}
      </style>

      {data && data.length > 0 ? (
        <ReactApexChart
          options={options}
          series={series}
          type="area"
          height={350}
        />
      ) : (
        <div className="text-center py-5 text-muted">
          <i className="bx bx-analyse display-4 text-primary opacity-25 mb-2"></i>
          <p>No registration performance data available for this selection.</p>
        </div>
      )}
    </div>
  );
};

export default PerformanceAreaChart;
