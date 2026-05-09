import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Nav,
  NavItem,
  NavLink,
  Input,
  Button,
  Table,
  Pagination,
  PaginationItem,
  PaginationLink,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Label,
} from "reactstrap";
import classnames from "classnames";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Swal from "sweetalert2";

// HELPERS
import { get, post } from "../../helpers/api_helper";
import { GET_FIELD_LIST, MANAGE_FIELD_API } from "../../helpers/url_helper";

const FieldManagement = () => {
  const [activeTab, setActiveTab] = useState("1");
  const [fieldOptions, setFieldOptions] = useState({
    grades: [],
    languages: [],
    curriculums: [],
  });

  // Modal & Edit State
  const [modal, setModal] = useState(false);
  const [newValue, setNewValue] = useState("");
  const [isEditing, setIsEditing] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const toggleModal = () => {
    setModal(!modal);
    if (modal) {
      setIsEditing(null);
      setNewValue("");
    }
  };

  const fetchAllFields = async () => {
    try {
      const response = await get(GET_FIELD_LIST);
      if (response?.items?.[0]) {
        const data = response.items[0];
        setFieldOptions({
          grades:
            typeof data.grades === "string" ? JSON.parse(data.grades) : [],
          languages:
            typeof data.languages === "string"
              ? JSON.parse(data.languages)
              : [],
          curriculums:
            typeof data.curriculums === "string"
              ? JSON.parse(data.curriculums)
              : [],
        });
      }
    } catch (err) {
      console.error("Error fetching fields:", err);
    }
  };

  useEffect(() => {
    fetchAllFields();
  }, []);

  const getTableInfo = () => {
    if (activeTab === "1")
      return { name: "Grade", table: "APP_GRADES", list: fieldOptions.grades };
    if (activeTab === "2")
      return {
        name: "Language",
        table: "APP_LANGUAGES",
        list: fieldOptions.languages,
      };
    return {
      name: "Curriculum",
      table: "APP_CURRICULUM",
      list: fieldOptions.curriculums,
    };
  };

  const current = getTableInfo();

  // Pagination
  const indexOfLastItem = currentPage * pageSize;
  const indexOfFirstItem = indexOfLastItem - pageSize;
  const currentItems = current.list.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(current.list.length / pageSize);

  const handleSave = async () => {
    if (!newValue.trim()) return;
    try {
      const result = await post(MANAGE_FIELD_API, {
        action: isEditing ? "UPDATE" : "ADD",
        table: current.table,
        oldValue: isEditing,
        newValue: newValue.trim(),
      });

      if (result.status === "success") {
        toggleModal();
        fetchAllFields();
        Swal.fire("Saved!", `${current.name} updated.`, "success");
      }
    } catch (err) {
      Swal.fire("Error", "Action failed", "error");
    }
  };

  const handleDelete = async (val) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Delete "${val}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#f46a6a",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await post(MANAGE_FIELD_API, {
            action: "DELETE",
            table: current.table,
            oldValue: val,
            newValue: null,
          });
          fetchAllFields();
          Swal.fire("Deleted!", "Field removed.", "success");
        } catch (err) {
          console.error(err);
        }
      }
    });
  };

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="Settings" breadcrumbItem="Field Management" />
        <Row>
          <Col md={3}>
            <Card>
              <CardBody>
                <Nav pills vertical className="flex-column">
                  {["Grade", "Language", "Curriculum"].map((label, idx) => (
                    <NavItem key={label}>
                      <NavLink
                        style={{ cursor: "pointer" }}
                        className={classnames({
                          active: activeTab === (idx + 1).toString(),
                        })}
                        onClick={() => {
                          setActiveTab((idx + 1).toString());
                          setCurrentPage(1);
                        }}
                      >
                        {label}
                      </NavLink>
                    </NavItem>
                  ))}
                </Nav>
              </CardBody>
            </Card>
          </Col>

          <Col md={9}>
            <Card>
              <CardBody>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="mb-0">{current.name} List</h5>
                  <Button color="success" onClick={toggleModal}>
                    <i className="mdi mdi-plus me-1" /> Add {current.name}
                  </Button>
                </div>

                <Table
                  hover
                  responsive
                  className="table-centered table-nowrap mb-0"
                >
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: "70px" }}>ID</th>
                      <th>{current.name} Name</th>
                      <th className="text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((item, idx) => (
                      <tr key={idx}>
                        <td>{indexOfFirstItem + idx + 1}</td>
                        <td>{item}</td>
                        <td className="text-end">
                          <div className="d-flex justify-content-end gap-2">
                            <Link
                              to="#"
                              className="text-success border p-1 rounded"
                              style={{ borderColor: "#ced4da" }}
                              onClick={() => {
                                setIsEditing(item);
                                setNewValue(item);
                                setModal(true);
                              }}
                            >
                              <i className="mdi mdi-pencil font-size-18" />
                            </Link>
                            <Link
                              to="#"
                              className="text-danger border p-1 rounded"
                              style={{ borderColor: "#f46a6a" }}
                              onClick={() => handleDelete(item)}
                            >
                              <i className="mdi mdi-delete font-size-18" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>

                {/* Pagination Footer */}
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div className="text-muted">
                    Showing {indexOfFirstItem + 1} to{" "}
                    {Math.min(indexOfLastItem, current.list.length)} of{" "}
                    {current.list.length} entries
                  </div>
                  <Pagination className="pagination-rounded">
                    <PaginationItem disabled={currentPage <= 1}>
                      <PaginationLink
                        previous
                        onClick={() => setCurrentPage(currentPage - 1)}
                      />
                    </PaginationItem>
                    {[...Array(totalPages)].map((_, i) => (
                      <PaginationItem active={i + 1 === currentPage} key={i}>
                        <PaginationLink onClick={() => setCurrentPage(i + 1)}>
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem disabled={currentPage >= totalPages}>
                      <PaginationLink
                        next
                        onClick={() => setCurrentPage(currentPage + 1)}
                      />
                    </PaginationItem>
                  </Pagination>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Add/Edit Popup Modal */}
      <Modal isOpen={modal} toggle={toggleModal} centered>
        <ModalHeader toggle={toggleModal}>
          {isEditing ? `Edit ${current.name}` : `Add New ${current.name}`}
        </ModalHeader>
        <ModalBody>
          <div className="mb-3">
            <Label>{current.name} Name</Label>
            <Input
              type="text"
              value={newValue}
              placeholder={`Enter ${current.name.toLowerCase()} name`}
              onChange={(e) => setNewValue(e.target.value)}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggleModal}>
            Cancel
          </Button>
          <Button color="primary" onClick={handleSave}>
            {isEditing ? "Update" : "Save"}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default FieldManagement;
