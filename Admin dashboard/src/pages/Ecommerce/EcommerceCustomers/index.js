import React, { useEffect, useState, useMemo } from "react";
import {
  Card,
  CardBody,
  Col,
  Container,
  Row,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Table,
  Input,
} from "reactstrap";
import moment from "moment";

// Import Components
import Breadcrumbs from "components/Common/Breadcrumb";
import TableContainer from "../../../components/Common/TableContainer";

// Import Column Formatters
import { CustId, ChildName, EmailCol, JoiningDate } from "./EcommerceCustCol";

// IMPORT YOUR DYNAMIC API HELPERS
import { get, post } from "../../../helpers/api_helper";
import { GET_ALL_USERS, UPDATE_USER_STATUS } from "../../../helpers/url_helper";

const EcommerceCustomers = () => {
  document.title = "Registration | Konzeptes";

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [modal, setModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Status Update State
  const [statusModal, setStatusModal] = useState(false);
  const [targetUser, setTargetUser] = useState(null);

  const toggleModal = () => setModal(!modal);

  const toggleStatusModal = () => {
    setStatusModal(!statusModal);
    if (!statusModal) setTargetUser(null);
  };

  const handleViewClick = (userData) => {
    setSelectedUser(userData);
    toggleModal();
  };

  const handleStatusToggle = (userData) => {
    setTargetUser(userData);
    setStatusModal(true);
  };

  const confirmStatusChange = async () => {
    if (!targetUser) return;

    const newStatus = targetUser.status === 1 ? 0 : 1;

    try {
      // Hits the POST handler to update the DB[cite: 1]
      await post(UPDATE_USER_STATUS, {
        user_id: targetUser.user_id,
        status: newStatus,
      });

      // Update local state for immediate feedback[cite: 1]
      setUsers(
        users.map((u) =>
          u.user_id === targetUser.user_id ? { ...u, status: newStatus } : u,
        ),
      );

      setStatusModal(false);
    } catch (err) {
      console.error("Error updating status:", err);
      setStatusModal(false);
    }
  };

  useEffect(() => {
    get(GET_ALL_USERS)
      .then((data) => {
        setUsers(data.items || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("API Error:", err);
        setLoading(false);
      });
  }, []);

  const columns = useMemo(
    () => [
      {
        Header: "ID",
        accessor: "user_id",
        Cell: (cellProps) => <CustId {...cellProps} />,
      },
      {
        Header: "Child Name",
        accessor: "child_name",
        filterable: true,
        Cell: (cellProps) => <ChildName {...cellProps} />,
      },
      {
        Header: "Email",
        accessor: "email",
        filterable: true,
        Cell: (cellProps) => <EmailCol {...cellProps} />,
      },
      {
        Header: "Grade",
        accessor: "grade",
        filterable: true,
      },
      {
        Header: "Language",
        accessor: "language",
        filterable: true,
      },
      {
        Header: "Curriculum",
        accessor: "curriculum",
        filterable: true,
      },
      {
        Header: "Date Joined",
        accessor: "created_at",
        Cell: (cellProps) => <JoiningDate {...cellProps} />,
      },
      {
        Header: "Status",
        accessor: "status",
        Cell: (cellProps) => {
          const user = cellProps.row.original;
          return (
            <div className="form-check form-switch form-switch-md mb-0">
              <Input
                type="checkbox"
                className="form-check-input"
                id={`statusToggle-${user.user_id}`}
                checked={user.status === 1}
                onChange={() => handleStatusToggle(user)}
                // style={{ cursor: "pointer" }}
                style={{
                  cursor: "pointer",
                  backgroundColor: user.status === 1 ? "#556ee6" : "", // Purple when active
                  borderColor: user.status === 1 ? "#556ee6" : "",
                }}
              />
            </div>
          );
        },
      },
      {
        Header: "Action",
        accessor: "view",
        disableFilters: true,
        Cell: (cellProps) => (
          <div
            onClick={() => handleViewClick(cellProps.row.original)}
            // style={{
            //   cursor: "pointer",
            //   width: "32px",
            //   height: "32px",
            //   border: "1px solid #e9ebec",
            //   borderRadius: "8px",
            //   display: "flex",
            //   alignItems: "center",
            //   justifyContent: "center",
            //   backgroundColor: "#fff",
            // }}
            style={{
              cursor: "pointer",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderColor: "#ced4da",
              backgroundColor: "#ffffff",
            }}
          >
            {/* <i
              className="mdi mdi-eye-outline text-success"
              style={{ fontSize: "16px" }}
            /> */}
            <i className="mdi mdi-eye font-size-18" />
          </div>
        ),
      },
    ],
    [users],
  );

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs
            title="Registration"
            breadcrumbItem="Registration List"
          />
          <Row>
            <Col xs="12">
              <Card>
                <CardBody>
                  <div className="d-flex align-items-center justify-content-between mb-4">
                    <h4 className="card-title mb-0">Registration List</h4>
                  </div>

                  {loading ? (
                    <div className="text-center py-4">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
                        <span className="sr-only">Loading...</span>
                      </div>
                    </div>
                  ) : (
                    <TableContainer
                      columns={columns}
                      data={users}
                      isGlobalFilter={true}
                      customPageSize={10}
                      tableClass="align-middle table-nowrap mb-0"
                      theadClass="table-light"
                    />
                  )}
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Details Modal */}
      <Modal isOpen={modal} toggle={toggleModal} centered>
        <ModalHeader toggle={toggleModal}>Registration Details</ModalHeader>
        <ModalBody>
          {selectedUser && (
            <Table responsive borderless className="mb-0">
              <tbody>
                <tr>
                  <th scope="row" style={{ width: "40%" }}>
                    Parent Name:
                  </th>
                  <td>
                    {selectedUser.salutation}. {selectedUser.parent_name}
                  </td>
                </tr>
                <tr>
                  <th scope="row">Child Name:</th>
                  <td>{selectedUser.child_name}</td>
                </tr>
                <tr>
                  <th scope="row">Mobile:</th>
                  <td>{selectedUser.mobile}</td>
                </tr>
                <tr>
                  <th scope="row">Email:</th>
                  <td>{selectedUser.email}</td>
                </tr>
                <tr>
                  <th scope="row">Grade:</th>
                  <td>{selectedUser.grade}</td>
                </tr>
                <tr>
                  <th scope="row">Language:</th>
                  <td>{selectedUser.language}</td>
                </tr>
                <tr>
                  <th scope="row">Curriculum:</th>
                  <td>{selectedUser.curriculum}</td>
                </tr>
                <tr>
                  <th scope="row">Status:</th>
                  <td>{selectedUser.status === 1 ? "Active" : "Inactive"}</td>
                </tr>
                <tr>
                  <th scope="row">Date Joined:</th>
                  <td>
                    {moment(selectedUser.created_at).format("DD MMM YYYY")}
                  </td>
                </tr>
              </tbody>
            </Table>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggleModal}>
            Close
          </Button>
        </ModalFooter>
      </Modal>

      {/* Confirmation Modal for Status Toggle */}
      <Modal isOpen={statusModal} toggle={toggleStatusModal} centered>
        <ModalHeader
          toggle={toggleStatusModal}
          className={targetUser?.status === 1 ? "text-danger" : "text-success"}
        >
          Confirm {targetUser?.status === 1 ? "Deactivation" : "Activation"}
        </ModalHeader>
        <ModalBody>
          Are you sure you want to change{" "}
          <strong>{targetUser?.child_name}'s</strong> status to
          <strong> {targetUser?.status === 1 ? "Inactive" : "Active"}</strong>?
        </ModalBody>
        <ModalFooter>
          <Button
            color={targetUser?.status === 1 ? "danger" : "success"}
            onClick={confirmStatusChange}
          >
            Confirm
          </Button>
          <Button color="secondary" onClick={toggleStatusModal}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </React.Fragment>
  );
};

export default EcommerceCustomers;

// import React, { useEffect, useState, useMemo } from "react";
// import {
//   Card,
//   CardBody,
//   Col,
//   Container,
//   Row,
//   Modal,
//   ModalHeader,
//   ModalBody,
//   ModalFooter,
//   Button,
//   Table,
// } from "reactstrap";
// import moment from "moment";

// // Import Components
// import Breadcrumbs from "components/Common/Breadcrumb";
// import TableContainer from "../../../components/Common/TableContainer";

// // Import Column Formatters
// import { CustId, ChildName, EmailCol, JoiningDate } from "./EcommerceCustCol";

// // IMPORT YOUR DYNAMIC API HELPERS
// import { get, post } from "../../../helpers/api_helper";
// import { GET_ALL_USERS, UPDATE_USER_STATUS } from "../../../helpers/url_helper";

// const EcommerceCustomers = () => {
//   document.title = "Registration | Konzeptes";

//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // Modal States
//   const [modal, setModal] = useState(false);
//   const [selectedUser, setSelectedUser] = useState(null);

//   // Status Update State
//   const [statusModal, setStatusModal] = useState(false);
//   const [targetUser, setTargetUser] = useState(null);

//   const toggleModal = () => setModal(!modal);

//   const toggleStatusModal = () => {
//     setStatusModal(!statusModal);
//     if (statusModal) setTargetUser(null);
//   };

//   const handleViewClick = (userData) => {
//     setSelectedUser(userData);
//     toggleModal();
//   };

//   // Trigger status change confirmation
//   const handleStatusToggle = (userData) => {
//     setTargetUser(userData);
//     setStatusModal(true);
//   };

//   // API Trigger to update status (1 to 0 or 0 to 1)
//   const confirmStatusChange = async () => {
//     if (!targetUser) return;

//     // Toggle logic: If currently 1, change to 0. If 0, change to 1.
//     const newStatus = targetUser.status === 1 ? 0 : 1;

//     try {
//       // Hits the POST handler you created under users/all
//       await post(UPDATE_USER_STATUS, {
//         user_id: targetUser.user_id,
//         status: newStatus,
//       });

//       // Update the state locally so UI refreshes immediately
//       setUsers(
//         users.map((u) =>
//           u.user_id === targetUser.user_id ? { ...u, status: newStatus } : u,
//         ),
//       );

//       setStatusModal(false);
//     } catch (err) {
//       console.error("Error updating status:", err);
//       setStatusModal(false);
//     }
//   };

//   useEffect(() => {
//     get(GET_ALL_USERS)
//       .then((data) => {
//         setUsers(data.items || []);
//         setLoading(false);
//       })
//       .catch((err) => {
//         console.error("API Error:", err);
//         setLoading(false);
//       });
//   }, []);

//   const columns = useMemo(
//     () => [
//       {
//         Header: "ID",
//         accessor: "user_id",
//         Cell: (cellProps) => <CustId {...cellProps} />,
//       },
//       {
//         Header: "Child Name",
//         accessor: "child_name",
//         filterable: true,
//         Cell: (cellProps) => <ChildName {...cellProps} />,
//       },
//       {
//         Header: "Email",
//         accessor: "email",
//         filterable: true,
//         Cell: (cellProps) => <EmailCol {...cellProps} />,
//       },
//       {
//         Header: "Grade",
//         accessor: "grade",
//         filterable: true,
//       },
//       {
//         Header: "Language",
//         accessor: "language",
//         filterable: true,
//       },
//       {
//         Header: "Curriculum",
//         accessor: "curriculum",
//         filterable: true,
//       },
//       {
//         Header: "Date Joined",
//         accessor: "created_at",
//         Cell: (cellProps) => <JoiningDate {...cellProps} />,
//       },
//       {
//         Header: "Status",
//         accessor: "status",
//         Cell: (cellProps) => (
//           <span
//             className={`badge ${
//               cellProps.row.original.status === 1 ? "bg-success" : "bg-danger"
//             }`}
//           >
//             {cellProps.row.original.status === 1 ? "Active" : "Inactive"}
//           </span>
//         ),
//       },
//       {
//         Header: "Action",
//         accessor: "view",
//         disableFilters: true,
//         Cell: (cellProps) => {
//           const user = cellProps.row.original;
//           const isActive = user.status === 1;

//           return (
//             <div className="d-flex gap-2">
//               {/* View Button */}
//               <div
//                 onClick={() => handleViewClick(user)}
//                 style={{
//                   cursor: "pointer",
//                   width: "32px",
//                   height: "32px",
//                   border: "1px solid #e9ebec",
//                   borderRadius: "8px",
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   backgroundColor: "#fff",
//                 }}
//               >
//                 <i
//                   className="mdi mdi-eye-outline"
//                   style={{ color: "#2f9237ff", fontSize: "16px" }}
//                 />
//               </div>

//               {/* Status Action Button */}
//               <div
//                 onClick={() => handleStatusToggle(user)}
//                 style={{
//                   cursor: "pointer",
//                   width: "32px",
//                   height: "32px",
//                   border: isActive ? "1px solid #f5c2c7" : "1px solid #c3e6cb",
//                   borderRadius: "8px",
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   backgroundColor: isActive ? "#fff5f5" : "#f0fff4",
//                 }}
//               >
//                 <i
//                   className={
//                     isActive
//                       ? "mdi mdi-account-off-outline"
//                       : "mdi mdi-account-check-outline"
//                   }
//                   style={{
//                     color: isActive ? "#dc3545" : "#28a745",
//                     fontSize: "16px",
//                   }}
//                 />
//               </div>
//             </div>
//           );
//         },
//       },
//     ],
//     [users],
//   );

//   return (
//     <React.Fragment>
//       <div className="page-content">
//         <Container fluid>
//           <Breadcrumbs
//             title="Registration"
//             breadcrumbItem="Registration List"
//           />
//           <Row>
//             <Col xs="12">
//               <Card>
//                 <CardBody>
//                   <div className="d-flex align-items-center justify-content-between mb-4">
//                     <h4 className="card-title mb-0">Registration List</h4>
//                   </div>

//                   {loading ? (
//                     <div className="text-center py-4">
//                       <div
//                         className="spinner-border text-primary"
//                         role="status"
//                       >
//                         <span className="sr-only">Loading...</span>
//                       </div>
//                     </div>
//                   ) : (
//                     <TableContainer
//                       columns={columns}
//                       data={users}
//                       isGlobalFilter={true}
//                       customPageSize={10}
//                       tableClass="align-middle table-nowrap mb-0"
//                       theadClass="table-light"
//                     />
//                   )}
//                 </CardBody>
//               </Card>
//             </Col>
//           </Row>
//         </Container>
//       </div>

//       {/* Details Modal */}
//       <Modal isOpen={modal} toggle={toggleModal} centered>
//         <ModalHeader toggle={toggleModal}>Registration Details</ModalHeader>
//         <ModalBody>
//           {selectedUser && (
//             <Table responsive borderless className="mb-0">
//               <tbody>
//                 <tr>
//                   <th scope="row" style={{ width: "40%" }}>
//                     Parent Name:
//                   </th>
//                   <td className="text-capitalize">
//                     {selectedUser.salutation}. {selectedUser.parent_name}
//                   </td>
//                 </tr>
//                 <tr>
//                   <th scope="row">Child Name:</th>
//                   <td>{selectedUser.child_name}</td>
//                 </tr>
//                 <tr>
//                   <th scope="row">Mobile:</th>
//                   <td>{selectedUser.mobile}</td>
//                 </tr>
//                 <tr>
//                   <th scope="row">Email:</th>
//                   <td>{selectedUser.email}</td>
//                 </tr>
//                 <tr>
//                   <th scope="row">Grade:</th>
//                   <td>{selectedUser.grade}</td>
//                 </tr>
//                 <tr>
//                   <th scope="row">Language:</th>
//                   <td>{selectedUser.language}</td>
//                 </tr>
//                 <tr>
//                   <th scope="row">Curriculum:</th>
//                   <td>{selectedUser.curriculum}</td>
//                 </tr>
//                 <tr>
//                   <th scope="row">Status:</th>
//                   <td>
//                     <span
//                       className={`badge ${
//                         selectedUser.status === 1 ? "bg-success" : "bg-danger"
//                       }`}
//                     >
//                       {selectedUser.status === 1 ? "Active" : "Inactive"}
//                     </span>
//                   </td>
//                 </tr>
//                 <tr>
//                   <th scope="row">Date Joined:</th>
//                   <td>
//                     {moment(selectedUser.created_at).format("DD MMM YYYY")}
//                   </td>
//                 </tr>
//               </tbody>
//             </Table>
//           )}
//         </ModalBody>
//         <ModalFooter>
//           <Button color="secondary" onClick={toggleModal}>
//             Close
//           </Button>
//         </ModalFooter>
//       </Modal>

//       {/* Confirmation Modal for Status Toggle */}
//       <Modal isOpen={statusModal} toggle={toggleStatusModal} centered>
//         <ModalHeader
//           toggle={toggleStatusModal}
//           className={targetUser?.status === 1 ? "text-danger" : "text-success"}
//         >
//           Confirm {targetUser?.status === 1 ? "Deactivation" : "Activation"}
//         </ModalHeader>
//         <ModalBody>
//           Are you sure you want to change{" "}
//           <strong>{targetUser?.child_name}</strong> to
//           <strong> {targetUser?.status === 1 ? "Inactive" : "Active"}</strong>?
//         </ModalBody>
//         <ModalFooter>
//           <Button
//             color={targetUser?.status === 1 ? "danger" : "success"}
//             onClick={confirmStatusChange}
//           >
//             Confirm Change
//           </Button>
//           <Button color="secondary" onClick={toggleStatusModal}>
//             Cancel
//           </Button>
//         </ModalFooter>
//       </Modal>
//     </React.Fragment>
//   );
// };

// export default EcommerceCustomers;
