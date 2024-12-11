// Admin_Supplier.js
import React, { useState, useEffect } from "react";
import "./Css/Supplier.css";
import Header from "./Componets/Admin_Header";
import Footer from "./Componets/Footer";
import {
  Button,
  Table,
  Card,
  Row,
  Col,
  Form,
  Dropdown,
  Modal,
  Alert,
  Container,
} from "react-bootstrap";
import { FaPlus, FaFileExport, FaEllipsisV, FaTrashAlt, FaEdit } from "react-icons/fa";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faEyeSlash,faEye} from '@fortawesome/free-solid-svg-icons';
import { saveAs } from "file-saver";
import axios from "axios";

const AdminSupplier = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [stocks, setStocks] = useState([]); // State for product names and categories
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSupplierIndex, setEditingSupplierIndex] = useState(null);
  const [supplierDetails, setSupplierDetails] = useState({
    name: "",
    contact: "",
    email: "",
    address: "",
    productName: "",
    category: "",
    status: "active",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  // Fetch suppliers
  const fetchSuppliers = async () => {
    try {
      const response = await axios.get("/api/suppliers/suppliers");
      setSuppliers(response.data);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    }
  };

  // Fetch stocks (product names and categories)
  const fetchStocks = async () => {
    try {
      const response = await axios.get("/api/suppliers/stocks");
      setStocks(response.data);
    } catch (error) {
      console.error("Error fetching stocks:", error);
    }
  };

  // Handle adding or updating a supplier
  const handleAddOrUpdateSupplier = async () => {
    if (Object.values(supplierDetails).some((field) => !field)) {
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 2000);
      return;
    }

    try {
      if (editingSupplierIndex !== null) {
        // Update existing supplier
        const supplierId = suppliers[editingSupplierIndex]._id;
        await axios.put(`/api/suppliers/suppliers/${supplierId}`, supplierDetails);
      } else {
        // Add new supplier
        await axios.post("/api/suppliers/suppliers", supplierDetails);
      }
      fetchSuppliers(); // Refresh supplier list
      setShowSuccessAlert(true);
      setTimeout(() => setShowSuccessAlert(false), 2000);
      resetModal();
    } catch (error) {
      console.error("Error saving supplier:", error);
    }
  };

  // Delete a supplier
  const handleDeleteSupplier = async (index) => {
    try {
      const supplierId = suppliers[index]._id;
      await axios.delete(`/api/suppliers/suppliers/${supplierId}`);
      fetchSuppliers(); // Refresh supplier list
    } catch (error) {
      console.error("Error deleting supplier:", error);
    }
  };

  // Handle status change
  const handleStatusChange = async (index, newStatus) => {
    try {
      const supplierId = suppliers[index]._id;
      await axios.put(`/api/suppliers/suppliers/${supplierId}`, {
        ...suppliers[index],
        status: newStatus,
      });
      fetchSuppliers(); // Refresh supplier list
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // Reset modal and form
  const resetModal = () => {
    setSupplierDetails({
      name: "",
      contact: "",
      email: "",
      address: "",
      productName: "",
      category: "",
      status: "active",
    });
    setEditingSupplierIndex(null);
    setShowAddModal(false);
    setShowAlert(false);
    setShowSuccessAlert(false);
  };

  // Edit supplier
  const handleEditSupplier = (index) => {
    const selectedSupplier = suppliers[index];
    setEditingSupplierIndex(index);
    setSupplierDetails({
      name: selectedSupplier.name || "",
      contact: selectedSupplier.contact || "",
      email: selectedSupplier.email || "",
      address: selectedSupplier.address || "",
      productName: selectedSupplier.productName || "",
      category: selectedSupplier.category || "",
      status: selectedSupplier.status || "active",
    });
    setShowAddModal(true);
  };

  // Export suppliers to CSV
  const exportToCSV = () => {
    const csvContent = [
      [
        "Supplier Name",
        "Contact",
        "Email",
        "Address",
        "Product Name",
        "Category",
        "Status",
      ],
      ...suppliers.map((supplier) => [
        supplier.name,
        supplier.contact,
        supplier.email,
        supplier.address,
        supplier.productName,
        supplier.category,
        supplier.status,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "suppliers_data.csv");
  };

  // Fetch suppliers and stocks on component mount
  useEffect(() => {
    fetchSuppliers();
    fetchStocks();
  }, []);

  // Filter suppliers by search term
  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle product name selection to update category
  const handleProductSelection = (productName) => {
    const selectedProduct = stocks.find((stock) => stock.name === productName);
    setSupplierDetails({
      ...supplierDetails,
      productName: productName,
      category: selectedProduct ? selectedProduct.category : "",
    });
  };

  return (
    <>
      <Header />
      <h2 className="supply-txt-center">
        Supplier Management
      </h2>
      <Container fluid className="supplier-management">
        <div
          className="supplier-management-container mx-auto"
        >

          <Row className="summary-cards">
            <Col md={6}>
              <Card className="summary-card text-center">
                <Card.Body>
                  <Card.Title>Total Suppliers</Card.Title>
                  <h3>{suppliers.length}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="summary-card text-center">
                <Card.Body>
                  <Card.Title>Active Suppliers</Card.Title>
                  <h3>
                    {suppliers.filter((s) => s.status === "active").length}
                  </h3>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <hr />
          <div className="table-actions">
            <Row className="action-row d-flex justify-content-between align-items-center">
              <Col md={6} className="search-col">
                <Form.Control
                  type="text"
                  placeholder="Search Suppliers..."
                  className="search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: "500px" }}
                />
              </Col>
              <Col md={6} className="action-buttons-right d-flex justify-content-end">
                <Button
                  variant="success"
                  className="action-button me-2"
                  onClick={() => setShowAddModal(true)}
                >
                  <FaPlus /> Add Supplier
                </Button>
                <Button
                  variant="outline-secondary"
                  className="action-button"
                  onClick={exportToCSV}
                >
                  <FaFileExport /> Export
                </Button>
              </Col>
            </Row>
          </div>
          <div className="table-container">
            <Table bordered hover className="supplier-table">
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>Supplier Name</th>
                  <th style={{ textAlign: 'left' }}>Product Name</th>
                  <th>Category</th>
                  <th>Contact</th>
                  <th>Email</th>
                  <th>Address</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredSuppliers.map((supplier, index) => (
                  <tr key={index} className={supplier.status === "active" ? "active-row" : "inactive-row"}>
                    <td style={{ textAlign: 'left' }}>{supplier.name}</td>
                    <td style={{ textAlign: 'left' }}>{supplier.productName}</td>
                    <td>{supplier.category}</td>
                    <td>{supplier.contact}</td>
                    <td>{supplier.email}</td>
                    <td>{supplier.address}</td>
                    <td
                      style={{
                        color: supplier.status === "active" ? "green" : "red",
                        fontWeight: "bold",
                      }}
                    >
                      {supplier.status.charAt(0).toUpperCase() + supplier.status.slice(1)}
                    </td>
                    <td>
                      <Dropdown drop="start">
                        <Dropdown.Toggle className="supplier-dropdown-toggle-custom" variant="secondary" id={`dropdownMenuButton-${supplier._id}`}>
                          <FaEllipsisV />
                        </Dropdown.Toggle>
                        <Dropdown.Menu className="dropdown-menu-custom">
                          <Dropdown.Item as="button" onClick={() => handleEditSupplier(index)} className="dropdown-item-custom">
                            <FaEdit className="me-2" /> Edit
                          </Dropdown.Item>
                          <Dropdown.Item as="button" onClick={() => handleDeleteSupplier(index)} className="dropdown-item-custom">
                            <FaTrashAlt className="me-2" /> Delete
                          </Dropdown.Item>
                          {/* <Dropdown.Item
                            as="button"
                            onClick={() =>
                              handleStatusChange(index, supplier.status === "active" ? "inactive" : "active")
                            }
                            className="dropdown-item-custom"
                          >
                            {supplier.status === "active" ? "Mark as Inactive" : "Mark as Active"}
                          </Dropdown.Item> */}
                          <Dropdown.Item
                            as="button"
                            onClick={() =>
                              handleStatusChange(index, supplier.status === "active" ? "inactive" : "active")
                            }
                            className="dropdown-item-custom"
                          >
                            {supplier.status === "active" ? (
                              <>
                                <FontAwesomeIcon icon={faEyeSlash} className="me-2 text-danger" />
                                Mark as Inactive
                              </>
                            ) : (
                              <>
                                <FontAwesomeIcon icon={faEye} className="me-2 text-success" />
                                Mark as Active
                              </>
                            )}
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </div>
        <Modal show={showAddModal} onHide={resetModal}>
          <Modal.Header closeButton>
            <Modal.Title>
              {editingSupplierIndex !== null ? "Edit Supplier" : "Add New Supplier"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {showAlert && <Alert variant="danger">Please fill in all fields!</Alert>}
            {showSuccessAlert && <Alert variant="success">Supplier updated successfully!</Alert>}
            <Form>
              <Form.Group controlId="formSupplierName">
                <Form.Label>Supplier Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter supplier name"
                  value={supplierDetails.name}
                  onChange={(e) =>
                    setSupplierDetails({
                      ...supplierDetails,
                      name: e.target.value,
                    })
                  }
                />
              </Form.Group>

              <Form.Group controlId="formProductName">
                <Form.Label>Product Name</Form.Label>
                <Form.Select
                  value={supplierDetails.productName}
                  onChange={(e) => handleProductSelection(e.target.value)}
                >
                  <option value="">Select Product</option>
                  {stocks.map((stock, index) => (
                    <option key={index} value={stock.name}>
                      {stock.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group controlId="formCategory">
                <Form.Label>Category</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Category"
                  value={supplierDetails.category}
                  readOnly
                />
              </Form.Group>

              <Form.Group controlId="formSupplierContact">
                <Form.Label>Contact</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter contact number"
                  value={supplierDetails.contact}
                  onChange={(e) =>
                    setSupplierDetails({
                      ...supplierDetails,
                      contact: e.target.value,
                    })
                  }
                />
              </Form.Group>

              <Form.Group controlId="formSupplierEmail">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter email"
                  value={supplierDetails.email}
                  onChange={(e) =>
                    setSupplierDetails({
                      ...supplierDetails,
                      email: e.target.value,
                    })
                  }
                />
              </Form.Group>

              <Form.Group controlId="formSupplierAddress">
                <Form.Label>Address</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter address"
                  value={supplierDetails.address}
                  onChange={(e) =>
                    setSupplierDetails({
                      ...supplierDetails,
                      address: e.target.value,
                    })
                  }
                />
              </Form.Group>

              <Form.Group controlId="formStatus">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={supplierDetails.status}
                  onChange={(e) =>
                    setSupplierDetails({
                      ...supplierDetails,
                      status: e.target.value,
                    })
                  }
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Form.Select>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={resetModal}>
              Close
            </Button>
            <Button variant="primary" onClick={handleAddOrUpdateSupplier}>
              {editingSupplierIndex !== null ? "Update Supplier" : "Add Supplier"}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
      <br />
      <br />
      <Footer />
    </>
  );
};

export default AdminSupplier;
