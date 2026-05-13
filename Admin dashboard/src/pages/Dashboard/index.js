// // // import React, { useEffect, useState } from 'react';
// // // import { Container, Row, Col, Card, CardBody, Input } from 'reactstrap';
// // // import Breadcrumbs from '../../components/Common/Breadcrumb';
// // // import LatestTranaction from './Registration-list';

// // // // Charts
// // // import LanguagePieChart from './LanguagePieChart';
// // // import GradeStackedBarChart from './GradeStackedBarChart';
// // // import PerformanceAreaChart from './PerformanceAreaChart';

// // // // Helpers
// // // import { get } from '../../helpers/api_helper';
// // // import {
// // //   GET_USER_OVERVIEW_STATS,
// // //   GET_PERFORMANCE_ANALYTICS,
// // // } from '../../helpers/url_helper';

// // // const Dashboard = () => {
// // //   // Filter States
// // //   const [overviewFilter, setOverviewFilter] = useState('ALL');
// // //   const [selectedYear, setSelectedYear] = useState(
// // //     new Date().getFullYear().toString()
// // //   );
// // //   const [selectedMonth, setSelectedMonth] = useState('ALL');

// // //   // Data States
// // //   const [overviewData, setOverviewData] = useState({
// // //     languages: [],
// // //     gradesStacked: [],
// // //   });
// // //   const [performanceData, setPerformanceData] = useState([]);

// // //   // Fetch 1: Unified Overview (Pie + Bar)
// // //   const fetchOverview = () => {
// // //     get(`${GET_USER_OVERVIEW_STATS}?filter=${overviewFilter}`)
// // //       .then((res) => {
// // //         if (res && !res.error) {
// // //           setOverviewData({
// // //             languages: res.languages || [],
// // //             gradesStacked: res.gradesStacked || [],
// // //           });
// // //         }
// // //       })
// // //       .catch((err) => console.error(err));
// // //   };

// // //   // Fetch 2: Registration Performance (Line/Area)
// // //   const fetchPerformance = () => {
// // //     get(
// // //       `${GET_PERFORMANCE_ANALYTICS}?year=${selectedYear}&month=${selectedMonth}`
// // //     )
// // //       .then((res) => {
// // //         if (res && !res.error) setPerformanceData(res.performance || []);
// // //       })
// // //       .catch((err) => console.error(err));
// // //   };

// // //   useEffect(() => {
// // //     fetchOverview();
// // //   }, [overviewFilter]);
// // //   useEffect(() => {
// // //     fetchPerformance();
// // //   }, [selectedYear, selectedMonth]);

// // //   document.title = 'Dashboard | LMS Analytics';

// // //   return (
// // //     <div className="page-content">
// // //       <Container fluid>
// // //         <Breadcrumbs title="Dashboards" breadcrumbItem="LMS Analytics" />

// // //         {/* BLOCK 1: OVERVIEW (Unified Pie + Stacked Bar) */}
// // //         <Card>
// // //           <CardBody>
// // //             <div className="d-flex align-items-center justify-content-between mb-4">
// // //               <h4 className="card-title mb-0">Registration Overview</h4>
// // //               <Input
// // //                 type="select"
// // //                 className="w-auto"
// // //                 value={overviewFilter}
// // //                 onChange={(e) => setOverviewFilter(e.target.value)}
// // //               >
// // //                 <option value="ALL">All Records</option>
// // //                 <option value="MONTH">This Month</option>
// // //                 <option value="YEAR">This Year</option>
// // //               </Input>
// // //             </div>
// // //             <Row>
// // //               <Col xl="4">
// // //                 <LanguagePieChart data={overviewData.languages} />
// // //               </Col>
// // //               <Col xl="8">
// // //                 <GradeStackedBarChart data={overviewData.gradesStacked} />
// // //               </Col>
// // //             </Row>
// // //           </CardBody>
// // //         </Card>

// // //         {/* BLOCK 2: PERFORMANCE (Line/Area Chart) */}
// // //         <Card>
// // //           <CardBody>
// // //             <div className="d-flex align-items-center justify-content-between mb-4">
// // //               <h4 className="card-title mb-0">Registration Performance</h4>
// // //               <div className="d-flex gap-2">
// // //                 <Input
// // //                   type="select"
// // //                   className="w-auto"
// // //                   value={selectedYear}
// // //                   onChange={(e) => setSelectedYear(e.target.value)}
// // //                 >
// // //                   <option value="2026">2026</option>
// // //                   <option value="2025">2025</option>
// // //                 </Input>
// // //                 <Input
// // //                   type="select"
// // //                   className="w-auto"
// // //                   value={selectedMonth}
// // //                   onChange={(e) => setSelectedMonth(e.target.value)}
// // //                 >
// // //                   <option value="ALL">All Months</option>
// // //                   {[
// // //                     { val: '01', name: 'January' },
// // //                     { val: '02', name: 'February' },
// // //                     { val: '03', name: 'March' },
// // //                     { val: '04', name: 'April' },
// // //                     { val: '05', name: 'May' },
// // //                   ].map((m) => (
// // //                     <option key={m.val} value={m.val}>
// // //                       {m.name}
// // //                     </option>
// // //                   ))}
// // //                 </Input>
// // //               </div>
// // //             </div>
// // //             <PerformanceAreaChart data={performanceData} />
// // //           </CardBody>
// // //         </Card>

// // //         <Row>
// // //           <Col lg="12">
// // //             <LatestTranaction />
// // //           </Col>
// // //         </Row>
// // //       </Container>
// // //     </div>
// // //   );
// // // };

// // // export default Dashboard;

// // import React, { useEffect, useState } from 'react';
// // import { Container, Row, Col, Card, CardBody, Input } from 'reactstrap';
// // import Breadcrumbs from '../../components/Common/Breadcrumb';
// // import LatestTranaction from './Registration-list';

// // // Charts
// // import LanguagePieChart from './LanguagePieChart';
// // import GradeStackedBarChart from './GradeStackedBarChart';
// // import PerformanceAreaChart from './PerformanceAreaChart';

// // // Helpers
// // import { get } from '../../helpers/api_helper';
// // import {
// //   GET_USER_OVERVIEW_STATS,
// //   GET_PERFORMANCE_ANALYTICS,
// // } from '../../helpers/url_helper';

// // const Dashboard = () => {
// //   const [overviewFilter, setOverviewFilter] = useState('ALL');
// //   const [selectedYear, setSelectedYear] = useState(
// //     new Date().getFullYear().toString()
// //   );
// //   const [selectedMonth, setSelectedMonth] = useState('ALL');

// //   const [overviewData, setOverviewData] = useState({
// //     languages: [],
// //     gradesStacked: [],
// //   });
// //   const [performanceData, setPerformanceData] = useState([]);

// //   const fetchOverview = () => {
// //     get(`${GET_USER_OVERVIEW_STATS}?filter=${overviewFilter}`)
// //       .then((res) => {
// //         if (res && !res.error) {
// //           setOverviewData({
// //             languages: res.languages || [],
// //             gradesStacked: res.gradesStacked || [],
// //           });
// //         }
// //       })
// //       .catch((err) => console.error(err));
// //   };

// //   const fetchPerformance = () => {
// //     get(
// //       `${GET_PERFORMANCE_ANALYTICS}?year=${selectedYear}&month=${selectedMonth}`
// //     )
// //       .then((res) => {
// //         if (res && !res.error) setPerformanceData(res.performance || []);
// //       })
// //       .catch((err) => console.error(err));
// //   };

// //   useEffect(() => {
// //     fetchOverview();
// //   }, [overviewFilter]);
// //   useEffect(() => {
// //     fetchPerformance();
// //   }, [selectedYear, selectedMonth]);

// //   return (
// //     <div className="page-content" style={{ backgroundColor: '#f8f9fa' }}>
// //       <Container fluid>
// //         <Breadcrumbs title="Konzeptes" breadcrumbItem="LMS Analytics" />

// //         {/* SECTION 1: REGISTRATION OVERVIEW */}
// //         <Card
// //           className="border-0 shadow-sm mb-4"
// //           style={{ borderRadius: '15px' }}
// //         >
// //           <CardBody>
// //             <div className="d-flex align-items-center justify-content-between mb-4">
// //               <div>
// //                 <h4
// //                   className="card-title mb-1"
// //                   style={{ fontWeight: '700', color: '#495057' }}
// //                 >
// //                   Registration Overview
// //                 </h4>
// //                 <p className="text-muted mb-0 font-size-13">
// //                   Consolidated language and grade analytics
// //                 </p>
// //               </div>
// //               <Input
// //                 type="select"
// //                 className="form-select border-primary-subtle fw-semibold text-primary"
// //                 value={overviewFilter}
// //                 onChange={(e) => setOverviewFilter(e.target.value)}
// //                 style={{
// //                   cursor: 'pointer',
// //                   width: 'auto',
// //                   borderRadius: '20px',
// //                 }}
// //               >
// //                 <option value="ALL">All-Time Records</option>
// //                 <option value="MONTH">Current Month</option>
// //                 <option value="YEAR">Current Year</option>
// //               </Input>
// //             </div>

// //             <Row>
// //               <Col xl="4">
// //                 <Card
// //                   className="shadow-none border-0 h-100"
// //                   style={{
// //                     backgroundColor: 'rgba(52, 195, 143, 0.03)',
// //                     borderRadius: '12px',
// //                   }}
// //                 >
// //                   <CardBody className="text-center">
// //                     <h5 className="font-size-15 mb-4 fw-bold text-dark">
// //                       User Languages
// //                     </h5>
// //                     <LanguagePieChart data={overviewData.languages} />
// //                   </CardBody>
// //                 </Card>
// //               </Col>
// //               <Col xl="8">
// //                 <Card
// //                   className="shadow-none border-0 h-100"
// //                   style={{
// //                     backgroundColor: 'rgba(85, 110, 230, 0.03)',
// //                     borderRadius: '12px',
// //                   }}
// //                 >
// //                   <CardBody>
// //                     <h5 className="font-size-15 mb-4 fw-bold text-dark">
// //                       Users by Grade & Curriculum
// //                     </h5>
// //                     <GradeStackedBarChart data={overviewData.gradesStacked} />
// //                   </CardBody>
// //                 </Card>
// //               </Col>
// //             </Row>
// //           </CardBody>
// //         </Card>

// //         {/* SECTION 2: REGISTRATION REPORT */}
// //         <Card
// //           className="border-0 shadow-sm mb-4"
// //           style={{ borderRadius: '15px' }}
// //         >
// //           <CardBody>
// //             <div className="d-flex align-items-center justify-content-between mb-4">
// //               <h4
// //                 className="card-title mb-0"
// //                 style={{ fontWeight: '700', color: '#495057' }}
// //               >
// //                 Registration Report
// //               </h4>
// //               <div className="d-flex gap-2">
// //                 <Input
// //                   type="select"
// //                   className="form-select border-light shadow-sm"
// //                   value={selectedYear}
// //                   onChange={(e) => setSelectedYear(e.target.value)}
// //                   style={{
// //                     minWidth: '100px',
// //                     borderRadius: '20px',
// //                     cursor: 'pointer',
// //                   }}
// //                 >
// //                   <option value="2026">2026</option>
// //                   <option value="2025">2025</option>
// //                 </Input>
// //                 <Input
// //                   type="select"
// //                   className="form-select border-light shadow-sm"
// //                   value={selectedMonth}
// //                   onChange={(e) => setSelectedMonth(e.target.value)}
// //                   style={{
// //                     minWidth: '135px',
// //                     borderRadius: '20px',
// //                     cursor: 'pointer',
// //                   }}
// //                 >
// //                   <option value="ALL">All Months</option>
// //                   {[
// //                     { v: '01', n: 'January' },
// //                     { v: '02', n: 'February' },
// //                     { v: '03', n: 'March' },
// //                     { v: '04', n: 'April' },
// //                     { v: '05', n: 'May' },
// //                   ].map((m) => (
// //                     <option key={m.v} value={m.v}>
// //                       {m.n}
// //                     </option>
// //                   ))}
// //                 </Input>
// //               </div>
// //             </div>
// //             <PerformanceAreaChart data={performanceData} />
// //           </CardBody>
// //         </Card>

// //         <Row>
// //           <Col lg="12">
// //             <LatestTranaction />
// //           </Col>
// //         </Row>
// //       </Container>
// //     </div>
// //   );
// // };

// // export default Dashboard;

// import React, { useEffect, useState } from 'react';
// import { Container, Row, Col, Card, CardBody, Input } from 'reactstrap';
// import Breadcrumbs from '../../components/Common/Breadcrumb';
// import LatestTranaction from './Registration-list';

// // Charts
// import LanguagePieChart from './LanguagePieChart';
// import GradeStackedBarChart from './GradeStackedBarChart';
// import PerformanceAreaChart from './PerformanceAreaChart';

// // Helpers
// import { get } from '../../helpers/api_helper';
// import {
//   GET_USER_OVERVIEW_STATS,
//   GET_PERFORMANCE_ANALYTICS,
// } from '../../helpers/url_helper';

// const Dashboard = () => {
//   const [overviewFilter, setOverviewFilter] = useState('ALL');
//   const [selectedYear, setSelectedYear] = useState(
//     new Date().getFullYear().toString()
//   );
//   const [selectedMonth, setSelectedMonth] = useState('ALL');

//   const [overviewData, setOverviewData] = useState({
//     languages: [],
//     gradesStacked: [],
//   });
//   const [performanceData, setPerformanceData] = useState([]);

//   const fetchOverview = () => {
//     get(`${GET_USER_OVERVIEW_STATS}?filter=${overviewFilter}`)
//       .then((res) => {
//         if (res && !res.error) {
//           setOverviewData({
//             languages: res.languages || [],
//             gradesStacked: res.gradesStacked || [],
//           });
//         }
//       })
//       .catch((err) => console.error(err));
//   };

//   const fetchPerformance = () => {
//     get(
//       `${GET_PERFORMANCE_ANALYTICS}?year=${selectedYear}&month=${selectedMonth}`
//     )
//       .then((res) => {
//         if (res && !res.error) setPerformanceData(res.performance || []);
//       })
//       .catch((err) => console.error(err));
//   };

//   useEffect(() => {
//     fetchOverview();
//   }, [overviewFilter]);
//   useEffect(() => {
//     fetchPerformance();
//   }, [selectedYear, selectedMonth]);

//   return (
//     <div className="page-content" style={{ backgroundColor: '#f8f9fa' }}>
//       <Container fluid>
//         <Breadcrumbs title="Konzeptes" breadcrumbItem="LMS Analytics" />

//         {/* SECTION 1: REGISTRATION OVERVIEW */}
//         <Card
//           className="border-0 shadow-sm mb-4"
//           style={{ borderRadius: '15px' }}
//         >
//           <CardBody>
//             <div className="d-flex align-items-center justify-content-between mb-4">
//               <div>
//                 <h4
//                   className="card-title mb-1"
//                   style={{ fontWeight: '700', color: '#495057' }}
//                 >
//                   Registration Overview
//                 </h4>
//                 <p className="text-muted mb-0 font-size-13">
//                   Consolidated language and grade analytics
//                 </p>
//               </div>
//               <Input
//                 type="select"
//                 className="form-select border-primary-subtle fw-semibold text-primary"
//                 value={overviewFilter}
//                 onChange={(e) => setOverviewFilter(e.target.value)}
//                 style={{
//                   cursor: 'pointer',
//                   width: 'auto',
//                   borderRadius: '20px',
//                 }}
//               >
//                 <option value="ALL">All-Time Records</option>
//                 <option value="MONTH">Current Month</option>
//                 <option value="YEAR">Current Year</option>
//               </Input>
//             </div>

//             <Row>
//               <Col xl="4">
//                 <Card
//                   className="shadow-none border-0 h-100"
//                   style={{
//                     backgroundColor: 'rgba(52, 195, 143, 0.03)',
//                     borderRadius: '12px',
//                   }}
//                 >
//                   <CardBody className="text-center">
//                     <h5 className="font-size-15 mb-4 fw-bold text-dark">
//                       User Languages
//                     </h5>
//                     <LanguagePieChart data={overviewData.languages} />
//                   </CardBody>
//                 </Card>
//               </Col>
//               <Col xl="8">
//                 <Card
//                   className="shadow-none border-0 h-100"
//                   style={{
//                     backgroundColor: 'rgba(85, 110, 230, 0.03)',
//                     borderRadius: '12px',
//                   }}
//                 >
//                   <CardBody>
//                     <h5 className="font-size-15 mb-4 fw-bold text-dark">
//                       Users by Grade & Curriculum
//                     </h5>
//                     <GradeStackedBarChart data={overviewData.gradesStacked} />
//                   </CardBody>
//                 </Card>
//               </Col>
//             </Row>
//           </CardBody>
//         </Card>

//         {/* SECTION 2: REGISTRATION REPORT */}
//         <Card
//           className="border-0 shadow-sm mb-4"
//           style={{ borderRadius: '15px' }}
//         >
//           <CardBody>
//             <div className="d-flex align-items-center justify-content-between mb-4">
//               <h4
//                 className="card-title mb-0"
//                 style={{ fontWeight: '700', color: '#495057' }}
//               >
//                 Registration Report
//               </h4>
//               <div className="d-flex gap-2">
//                 <Input
//                   type="select"
//                   className="form-select border-light shadow-sm"
//                   value={selectedYear}
//                   onChange={(e) => setSelectedYear(e.target.value)}
//                   style={{
//                     minWidth: '100px',
//                     borderRadius: '20px',
//                     cursor: 'pointer',
//                   }}
//                 >
//                   <option value="2026">2026</option>
//                   <option value="2025">2025</option>
//                 </Input>
//                 <Input
//                   type="select"
//                   className="form-select border-light shadow-sm"
//                   value={selectedMonth}
//                   onChange={(e) => setSelectedMonth(e.target.value)}
//                   style={{
//                     minWidth: '135px',
//                     borderRadius: '20px',
//                     cursor: 'pointer',
//                   }}
//                 >
//                   <option value="ALL">All Months</option>
//                   {[
//                     { v: '01', n: 'January' },
//                     { v: '02', n: 'February' },
//                     { v: '03', n: 'March' },
//                     { v: '04', n: 'April' },
//                     { v: '05', n: 'May' },
//                   ].map((m) => (
//                     <option key={m.v} value={m.v}>
//                       {m.n}
//                     </option>
//                   ))}
//                 </Input>
//               </div>
//             </div>
//             <PerformanceAreaChart data={performanceData} />
//           </CardBody>
//         </Card>

//         <Row>
//           <Col lg="12">
//             <LatestTranaction />
//           </Col>
//         </Row>
//       </Container>
//     </div>
//   );
// };

// export default Dashboard;

import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, CardBody, Input } from 'reactstrap';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import LatestTranaction from './Registration-list';

// Charts
import LanguagePieChart from './LanguagePieChart';
import GradeStackedBarChart from './GradeStackedBarChart';
import PerformanceAreaChart from './PerformanceAreaChart';

// Helpers
import { get } from '../../helpers/api_helper';
import {
  GET_USER_OVERVIEW_STATS,
  GET_PERFORMANCE_ANALYTICS,
} from '../../helpers/url_helper';

const Dashboard = () => {
  const currentYearStr = new Date().getFullYear().toString();

  const [overviewFilter, setOverviewFilter] = useState('ALL');
  const [selectedYear, setSelectedYear] = useState(currentYearStr);
  const [selectedMonth, setSelectedMonth] = useState('ALL');
  const [overviewData, setOverviewData] = useState({
    languages: [],
    gradesStacked: [],
  });
  const [performanceData, setPerformanceData] = useState([]);

  // --- DYNAMIC MONTH GENERATOR ---
  // Calculates how many months to show based on the selected year
  const getAvailableMonths = () => {
    const currentMonthNum = new Date().getMonth() + 1; // JS months are 0-indexed (0-11)

    // If viewing the current year, limit to the current month. Otherwise, show all 12.
    const monthLimit = selectedYear === currentYearStr ? currentMonthNum : 12;

    // Generate the array of objects dynamically
    return Array.from({ length: monthLimit }, (_, i) => {
      const monthNumber = (i + 1).toString().padStart(2, '0');
      // Create a dummy date to extract the proper month name (e.g., 'January', 'February')
      const monthName = new Date(2000, i, 1).toLocaleString('default', {
        month: 'long',
      });

      return { val: monthNumber, name: monthName };
    });
  };

  const dynamicMonths = getAvailableMonths();

  useEffect(() => {
    get(`${GET_USER_OVERVIEW_STATS}?filter=${overviewFilter}`)
      .then((res) =>
        setOverviewData({
          languages: res.languages || [],
          gradesStacked: res.gradesStacked || [],
        })
      )
      .catch((err) => console.error(err));
  }, [overviewFilter]);

  useEffect(() => {
    // Safety check: If switching to current year and the selected month is now in the future, reset to 'ALL'
    const currentMonthNum = new Date().getMonth() + 1;
    if (
      selectedYear === currentYearStr &&
      selectedMonth !== 'ALL' &&
      parseInt(selectedMonth) > currentMonthNum
    ) {
      setSelectedMonth('ALL');
    }

    get(
      `${GET_PERFORMANCE_ANALYTICS}?year=${selectedYear}&month=${selectedMonth}`
    )
      .then((res) => setPerformanceData(res.performance || []))
      .catch((err) => console.error(err));
  }, [selectedYear, selectedMonth]);

  return (
    <div className="page-content" style={{ backgroundColor: '#fbfbfb' }}>
      <Container fluid>
        <Breadcrumbs title="Konzeptes" breadcrumbItem="LMS Analytics" />

        {/* SECTION 1: REGISTRATION OVERVIEW */}
        <Card
          className="border-0 shadow-sm mb-4"
          style={{ borderRadius: '15px' }}
        >
          <CardBody>
            <div className="d-flex align-items-center justify-content-between mb-4">
              <div>
                <h4
                  className="card-title mb-1"
                  style={{ fontWeight: '700', color: '#495057' }}
                >
                  Registration Overview
                </h4>
                <p className="text-muted mb-0 font-size-13">
                  Consolidated language and grade analytics
                </p>
              </div>
              <Input
                type="select"
                className="form-select border-primary-subtle fw-semibold text-primary"
                value={overviewFilter}
                onChange={(e) => setOverviewFilter(e.target.value)}
                style={{
                  cursor: 'pointer',
                  width: 'auto',
                  borderRadius: '20px',
                }}
              >
                <option value="ALL">All-Time Records</option>
                <option value="MONTH">Current Month</option>
                <option value="YEAR">Current Year</option>
              </Input>
            </div>
            <Row>
              <Col xl="4">
                <Card
                  className="shadow-none border-0 h-100"
                  style={{
                    backgroundColor: 'rgba(52, 195, 143, 0.03)',
                    borderRadius: '12px',
                  }}
                >
                  <CardBody className="text-center">
                    <h5 className="font-size-15 mb-4 fw-bold text-dark">
                      User Languages
                    </h5>
                    <LanguagePieChart data={overviewData.languages} />
                  </CardBody>
                </Card>
              </Col>
              <Col xl="8">
                <Card
                  className="shadow-none border-0 h-100"
                  style={{
                    backgroundColor: 'rgba(85, 110, 230, 0.03)',
                    borderRadius: '12px',
                  }}
                >
                  <CardBody>
                    <h5 className="font-size-15 mb-4 fw-bold text-dark">
                      Grade & Curriculum Distribution
                    </h5>
                    <GradeStackedBarChart data={overviewData.gradesStacked} />
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </CardBody>
        </Card>

        {/* SECTION 2: REGISTRATION REPORT */}
        <Card
          className="border-0 shadow-sm mb-4"
          style={{ borderRadius: '15px' }}
        >
          <CardBody>
            <div className="d-flex align-items-center justify-content-between mb-4">
              <h4
                className="card-title mb-0"
                style={{ fontWeight: '700', color: '#495057' }}
              >
                Registration Report
              </h4>
              <div className="d-flex gap-2">
                <Input
                  type="select"
                  className="form-select border-light shadow-sm"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  style={{
                    minWidth: '100px',
                    borderRadius: '20px',
                    cursor: 'pointer',
                  }}
                >
                  <option value={currentYearStr}>{currentYearStr}</option>
                  <option value={(parseInt(currentYearStr) - 1).toString()}>
                    {parseInt(currentYearStr) - 1}
                  </option>
                </Input>

                {/* DYNAMIC MONTH DROPDOWN */}
                <Input
                  type="select"
                  className="form-select border-light shadow-sm"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  style={{
                    minWidth: '135px',
                    borderRadius: '20px',
                    cursor: 'pointer',
                  }}
                >
                  <option value="ALL">All Months</option>
                  {dynamicMonths.map((m) => (
                    <option key={m.val} value={m.val}>
                      {m.name}
                    </option>
                  ))}
                </Input>
              </div>
            </div>
            <PerformanceAreaChart data={performanceData} />
          </CardBody>
        </Card>

        <LatestTranaction />
      </Container>
    </div>
  );
};

export default Dashboard;
