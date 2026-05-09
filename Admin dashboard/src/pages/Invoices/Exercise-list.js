import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Card,
  CardBody,
  Col,
  Container,
  Row,
  Button,
  Spinner,
  Label,
  Input,
} from "reactstrap";
import Swal from "sweetalert2";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import TableContainer from "../../components/Common/TableContainer";
import { get, del } from "../../helpers/api_helper";
import {
  GET_ACTIVITY_LIST,
  DELETE_ACTIVITY,
  GET_ACTIVITY_DETAIL_JSON,
  GET_FIELD_LIST,
} from "../../helpers/url_helper";

const InvoicesList = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [gradeFilter, setGradeFilter] = useState("All");
  const [langFilter, setLangFilter] = useState("All");
  const [currFilter, setCurrFilter] = useState("All");

  const [fieldOptions, setFieldOptions] = useState({
    grades: [],
    languages: [],
    curriculums: [],
  });

  // Fetch the filter options from the metadata tables
  useEffect(() => {
    const fetchFields = async () => {
      try {
        const response = await get(GET_FIELD_LIST);
        if (response && response.items && response.items.length > 0) {
          const data = response.items[0];
          setFieldOptions({
            // Use JSON.parse because ORDS returns these as strings
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
        console.error("Error fetching filter options:", err);
      }
    };
    fetchFields();
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Build the query string using the state values
      const queryParams = new URLSearchParams({
        grade: gradeFilter,
        language: langFilter,
        curriculum: currFilter,
      }).toString();

      // 2. Fetch from your updated PL/SQL API
      const rawTextResponse = await get(`${GET_ACTIVITY_LIST}?${queryParams}`, {
        transformResponse: [(data) => data],
      });

      // 3. Clean and Parse (Same logic as your previous version)
      let cleanJsonText = rawTextResponse.replace(/[\r\n\t]+/g, "");
      const parsedResponse = JSON.parse(cleanJsonText);
      const apiItems = parsedResponse.items || [];
      const processedData = apiItems.map((item) => {
        // 1. Parse the JSON body safely
        let parsedBody =
          item.data_json && typeof item.data_json === "object"
            ? item.data_json
            : {};

        // 2. DEFINE displayPreview LOGIC HERE (Fixes the ReferenceError)
        let displayPreview = "No Content";

        if (item.activity_type === "match") {
          displayPreview = parsedBody?.text
            ? parsedBody.text.substring(0, 50) + "..."
            : "No Content";
        } else if (
          item.activity_type === "sequence" ||
          item.activity_type === "completeWord"
        ) {
          if (parsedBody?.text) {
            const firstLine = parsedBody.text.split("\n")[0] || "";
            displayPreview = firstLine.substring(0, 50) + "...";
          }
        } else if (parsedBody?.questions?.length > 0) {
          const first = parsedBody.questions[0];
          displayPreview = first?.qText || first?.question || "MCQ Content";
        }

        // 3. Return the mapped object
        return {
          ...item,
          id: item.id,
          card_id: item.card_id,
          label: item.label,
          type: item.activity_type,
          btnLabel: item.btn_label,
          title: parsedBody?.title || item.label,
          display_question: displayPreview, // Now defined!
          full_details: parsedBody,
          grade: item.grade || "N/A",
          language: item.language || "N/A",
          curriculum: item.curriculum || "N/A",
        };
      });

      setData(processedData);
    } catch (error) {
      console.error("Fetch Error:", error);
      Swal.fire("Error", "Failed to fetch filtered data", "error");
    } finally {
      setLoading(false);
    }
  }, [gradeFilter, langFilter, currFilter]); // This triggers a re-fetch when filters change

  useEffect(() => {
    loadData();
  }, [loadData]);

  // const handleAction = (rowData, isReadOnly = false) => {
  //   let questionsForForm = [];

  //   // Use full_details if available, otherwise fallback to the row itself
  //   const contentSource = rowData.full_details || rowData;
  //   const matchTextForForm = contentSource.text || "";

  //   if (rowData.type === "mcq" && contentSource.questions) {
  //     questionsForForm = contentSource.questions.map((q) => {
  //       let rawOptionsArray =
  //         typeof q.options === "string"
  //           ? q.options.split("\n")
  //           : Array.isArray(q.options)
  //           ? q.options
  //           : [];

  //       const correctIndex = rawOptionsArray.findIndex((opt) =>
  //         String(opt).trim().startsWith("*"),
  //       );

  //       const cleanOptions = rawOptionsArray.map((opt) =>
  //         String(opt).replace(/\*/g, "").trim(),
  //       );

  //       while (cleanOptions.length < 4) cleanOptions.push("");

  //       return {
  //         question: q.qText || q.question || "",
  //         answers: cleanOptions.slice(0, 4),
  //         correct_answer: correctIndex > -1 ? correctIndex.toString() : "0",
  //       };
  //     });
  //   }

  //   const editDataPayload = {
  //     ...rowData, // Pass all metadata (grade, language, etc.)
  //     id: rowData.id,
  //     card_id: rowData.card_id,
  //     label: rowData.label,
  //     type: rowData.type,
  //     data: {
  //       title: rowData.title || contentSource.title || "",
  //       text: matchTextForForm,
  //       questions:
  //         questionsForForm.length > 0
  //           ? questionsForForm
  //           : [
  //               {
  //                 question: "",
  //                 answers: ["", "", "", ""],
  //                 correct_answer: "0",
  //               },
  //             ],
  //     },
  //     readOnly: isReadOnly,
  //   };

  //   navigate("/Exercise-detail", { state: { editData: editDataPayload } });
  // };

  const handleAction = async (rowData, isReadOnly = false) => {
    setLoading(true);
    try {
      // 1. Fetch the specific JSON content for this activity ID
      // GET_ACTIVITY_DETAIL_JSON should be "/admin/list-detail"
      const detailResponse = await get(
        `${GET_ACTIVITY_DETAIL_JSON}/${rowData.id}`,
      );

      // 2. The detailResponse is the parsed data_json from your ORDS detail API
      const contentSource = detailResponse || {};
      const matchTextForForm = contentSource.text || "";
      let questionsForForm = [];

      // 3. Process MCQ options specifically for the form structure
      if (rowData.type === "mcq" && contentSource.questions) {
        questionsForForm = contentSource.questions.map((q) => {
          let rawOptionsArray = Array.isArray(q.options)
            ? q.options
            : typeof q.options === "string"
            ? q.options.split("\n")
            : [];

          const correctIndex = rawOptionsArray.findIndex((opt) =>
            String(opt).trim().startsWith("*"),
          );

          const cleanOptions = rawOptionsArray.map((opt) =>
            String(opt).replace(/\*/g, "").trim(),
          );

          while (cleanOptions.length < 4) cleanOptions.push("");

          return {
            question: q.qText || q.question || "",
            answers: cleanOptions.slice(0, 4),
            correct_answer: correctIndex > -1 ? correctIndex.toString() : "0",
          };
        });
      }

      // 4. Construct the payload for the Detail/Edit page
      // const editDataPayload = {
      //   ...rowData,
      //   data: {
      //     title: contentSource.title || rowData.label || "",
      //     text: matchTextForForm,
      //     questions:
      //       questionsForForm.length > 0
      //         ? questionsForForm
      //         : [
      //             {
      //               question: "",
      //               answers: ["", "", "", ""],
      //               correct_answer: "0",
      //             },
      //           ],
      //   },
      //   readOnly: isReadOnly,
      // };
      // 4. Construct the payload for the Detail/Edit page
      const editDataPayload = {
        ...rowData,
        data_json: detailResponse, // <-- ADD THIS LINE: Overwrite the truncated list JSON with the full Detail JSON
        data: {
          title: contentSource.title || rowData.label || "",
          text: matchTextForForm,
          questions:
            questionsForForm.length > 0
              ? questionsForForm
              : [
                  {
                    question: "",
                    answers: ["", "", "", ""],
                    correct_answer: "0",
                  },
                ],
        },
        readOnly: isReadOnly,
      };

      // 5. Navigate to the detail page with the full data
      navigate("/Exercise-detail", { state: { editData: editDataPayload } });
    } catch (error) {
      console.error("Detail Fetch Error:", error);
      Swal.fire("Error", "Could not load exercise details.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
    }).then(async (result) => {
      if (result.isConfirmed) {
        await del(`${DELETE_ACTIVITY}/${id}`);
        loadData();
      }
    });
  };

  // const columns = useMemo(
  //   () => [
  //     // { Header: "ID", accessor: "id" },
  //     // { Header: "Grade", accessor: "grade" },
  //     // { Header: "Language", accessor: "language" },
  //     // { Header: "Curriculum", accessor: "curriculum" },
  //     // { Header: "Label", accessor: "label" },
  //     { Header: "ID", accessor: "id" },
  //     { Header: "Grade", accessor: "grade" }, // New Column
  //     { Header: "Language", accessor: "language" }, // New Column
  //     { Header: "Curriculum", accessor: "curriculum" }, // New Column
  //     { Header: "Type", accessor: "type" },
  //     { Header: "Label", accessor: "label" },
  //     {
  //       Header: "Action",
  //       Cell: (cellProps) => {
  //         const rowData = cellProps.row.original;
  //         return (
  //           <div className="d-flex gap-2">
  //             <Link
  //               to="#"
  //               className="text-primary"
  //               onClick={() =>
  //                 navigate("/invoices-detail", {
  //                   state: { editData: { ...rowData, readOnly: true } },
  //                 })
  //               }
  //             >
  //               <i className="mdi mdi-eye font-size-18" />
  //             </Link>
  //             <Link
  //               to="#"
  //               className="text-success"
  //               onClick={() =>
  //                 navigate("/invoices-detail", { state: { editData: rowData } })
  //               }
  //             >
  //               <i className="mdi mdi-pencil font-size-18" />
  //             </Link>
  //             <Link
  //               to="#"
  //               className="text-danger"
  //               onClick={() => handleDelete(rowData.id)}
  //             >
  //               <i className="mdi mdi-delete font-size-18" />
  //             </Link>
  //           </div>
  //         );
  //       },
  //     },
  //   ],
  //   [],
  // );

  const columns = useMemo(
    () => [
      { Header: "ID", accessor: "id" },
      { Header: "Grade", accessor: "grade" },
      { Header: "Language", accessor: "language" },
      { Header: "Curriculum", accessor: "curriculum" },
      { Header: "Label", accessor: "label" },
      {
        Header: "Action",
        Cell: (cellProps) => {
          const rowData = cellProps.row.original;
          return (
            <div className="d-flex justify-content-center align-items-center gap-2">
              <Link
                to="#"
                className="text-primary border p-1 rounded"
                onClick={(e) => {
                  e.preventDefault();
                  handleAction(rowData, true); // View Mode
                }}
              >
                <i className="mdi mdi-eye font-size-18" />
              </Link>
              <Link
                to="#"
                className="text-success border p-1 rounded"
                onClick={(e) => {
                  e.preventDefault();
                  handleAction(rowData, false); // Edit Mode
                }}
              >
                <i className="mdi mdi-pencil font-size-18" />
              </Link>
              <Link
                to="#"
                className="text-danger border p-1 rounded"
                onClick={() => handleDelete(rowData.id)}
              >
                <i className="mdi mdi-delete font-size-18" />
              </Link>
            </div>
          );
        },
      },
    ],
    [data], // Add data as a dependency here!
  );

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="Admin" breadcrumbItem="Activity Dashboard" />
        <Card>
          <CardBody>
            {/* <Row className="mb-4">
              <Col md={3}>
                <Label>Grade</Label>
                <Input
                  type="select"
                  value={gradeFilter}
                  onChange={(e) => setGradeFilter(e.target.value)}
                >
                  <option value="All">All Grades</option>
                  <option value="Primary 1">Primary 1</option>
                  <option value="Primary 2">Primary 2</option>
                  <option value="Primary 3">Primary 3</option>
                  {}
                </Input>
              </Col>
              <Col md={3}>
                <Label>Language</Label>
                <Input
                  type="select"
                  value={langFilter}
                  onChange={(e) => setLangFilter(e.target.value)}
                >
                  <option value="All">All Languages</option>
                  <option value="Hindi">Hindi</option>
                  <option value="German">German</option>
                  <option value="French">French</option>
                </Input>
              </Col>
              <Col md={3}>
                <Label>Curriculum</Label>
                <Input
                  type="select"
                  value={currFilter}
                  onChange={(e) => setCurrFilter(e.target.value)}
                >
                  <option value="All">All Curriculums</option>
                  <option value="MOE">MOE</option>
                  <option value="IGCSE">IGCSE</option>
                  <option value="IB">IB</option>
                  <option value="CBSE">CBSE</option>
                </Input>
              </Col>
              <Col md={3} className="d-flex align-items-end">
                <Button
                  color="primary"
                  className="w-100"
                  onClick={() => navigate("/Exercise-detail")}
                >
                  + Add Activity
                </Button>
              </Col>
            </Row> */}
            <Row className="mb-4">
              {/* Grade Filter */}
              <Col md={3}>
                <Label>Grade</Label>
                <Input
                  type="select"
                  value={gradeFilter}
                  onChange={(e) => setGradeFilter(e.target.value)}
                >
                  <option value="All">All Grades</option>
                  {fieldOptions.grades?.map((grade, index) => (
                    <option key={index} value={grade}>
                      {grade}
                    </option>
                  ))}
                </Input>
              </Col>

              {/* Language Filter */}
              <Col md={3}>
                <Label>Language</Label>
                <Input
                  type="select"
                  value={langFilter}
                  onChange={(e) => setLangFilter(e.target.value)}
                >
                  <option value="All">All Languages</option>
                  {fieldOptions.languages?.map((lang, index) => (
                    <option key={index} value={lang}>
                      {lang}
                    </option>
                  ))}
                </Input>
              </Col>

              {/* Curriculum Filter */}
              <Col md={3}>
                <Label>Curriculum</Label>
                <Input
                  type="select"
                  value={currFilter}
                  onChange={(e) => setCurrFilter(e.target.value)}
                >
                  <option value="All">All Curriculums</option>
                  {fieldOptions.curriculums?.map((curr, index) => (
                    <option key={index} value={curr}>
                      {curr}
                    </option>
                  ))}
                </Input>
              </Col>

              <Col md={3} className="d-flex align-items-end">
                <Button
                  color="primary"
                  className="w-100"
                  onClick={() => navigate("/Exercise-detail")}
                >
                  + Add Activity
                </Button>
              </Col>
            </Row>
            {loading ? (
              <div className="text-center py-5">
                <Spinner color="primary" />
              </div>
            ) : (
              <TableContainer
                columns={columns}
                data={data}
                isGlobalFilter={true}
                customPageSize={10}
              />
            )}
          </CardBody>
        </Card>
      </Container>
    </div>
  );
};

export default InvoicesList;
