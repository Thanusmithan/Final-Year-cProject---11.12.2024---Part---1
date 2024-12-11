// Admin_Stock.js
import React, { useState, useEffect } from 'react';
import './Css/Stock.css';
import Header from './Componets/Admin_Header';
import Footer from './Componets/Footer';
import Container from 'react-bootstrap/Container';
import { Button, Table, Badge, Card, Row, Col, Form, Dropdown, Modal } from 'react-bootstrap';
import {FaFileExport, FaEdit, FaTrashAlt, FaEllipsisV } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle} from '@fortawesome/free-solid-svg-icons';
import { saveAs } from 'file-saver';

const StockManagement = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    sku: '',
    incoming: 0,
    price: 0,
    stock: 0,
    value: 0,
  });
  const [editedProduct, setEditedProduct] = useState(null);

  // Fetch products from the backend
  useEffect(() => {
    fetch('http://localhost:5000/api/stocks')
      .then((response) => response.json())
      .then((data) => setProducts(data))
      .catch((error) => console.error('Error fetching stock data:', error));
  }, []);

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  // Filter products based on search term
  const filteredProducts = products.filter((product) =>
    product?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportToCSV = () => {
    const csvRows = [
      ['Product Name', 'Category', 'SKU', 'Incoming Now', 'Unit Price', 'In Stock', 'Total Value', 'Status'],
      ...filteredProducts.map((product) => [
        product.name,
        product.category,
        product.sku,
        product.incoming,
        `LKR ${product.price}`,
        product.stock,
        `LKR ${product.value}`,
        product.status,
      ]),
    ];

    const csvContent = csvRows.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'stock_data.csv');
  };

  const handleAddProductChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.category || !newProduct.sku || newProduct.price <= 0 || newProduct.stock <= 0) {
      alert('Please fill all fields correctly!');
      return;
    }

    fetch('http://localhost:5000/api/stocks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProduct),
    })
      .then((response) => response.json())
      .then((addedProduct) => {
        setProducts((prev) => [...prev, addedProduct]);
        setShowAddModal(false);
        setNewProduct({
          name: '',
          category: '',
          sku: '',
          incoming: 0,
          price: 0,
          stock: 0,
          value: 0,
        });
      })
      .catch((error) => console.error('Error adding product:', error));
  };

  const handleEditToggle = (product) => {
    setEditedProduct({ ...product });
    setShowEditModal(true);
  };

  const handleEditProductChange = (e) => {
    const { name, value } = e.target;
    setEditedProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = () => {
    fetch(`http://localhost:5000/api/stocks/${editedProduct._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editedProduct),
    })
      .then((response) => response.json())
      .then((updatedProduct) => {
        setProducts((prev) =>
          prev.map((product) =>
            product._id === updatedProduct._id ? updatedProduct : product
          )
        );
        setShowEditModal(false);
        setEditedProduct(null);
      })
      .catch((error) => console.error('Error updating product:', error));
  };

  const handleDeleteProduct = (productId) => {
    fetch(`http://localhost:5000/api/stocks/${productId}`, {
      method: 'DELETE',
    })
      .then(() => {
        setProducts((prev) => prev.filter((product) => product._id !== productId));
      })
      .catch((error) => console.error('Error deleting product:', error));
  };

  const getStatusClass = (status) => {
    return status === 'Low Stock' ? 'bg-danger text-white' : 'bg-success text-white';
  };

  return (
    <>
       <Header />
      <div className="admin-stock-wrapper" >
      <Container fluid className="stock-management">
        <br/>
        <br/>
        <br/>
        <h2 className="stock-txt-center">Stock Management</h2>
        <div className="stock-management-container">
          <Row className="summary-cards">
            <Col md={4}>
            <Card className="summary-card text-center">
                <Card.Body>
                  {/* <Card.Title style={{color:'black'}}>Total Products</Card.Title> */}
                  <Card.Text>Products</Card.Text>
                  <h3>{products.length}</h3>
                </Card.Body>
              </Card>
             
            </Col>
            <Col md={4}>
            <Card className="summary-card text-center">
                <Card.Body>
                  {/* <Card.Title style={{color:'black'}}>Total Categories</Card.Title> */}
                  <Card.Text>Categories</Card.Text>
                  <h3>{[...new Set(products.map((product) => product.category))].length}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="summary-card text-center">
                <Card.Body>
                  {/* <Card.Title style={{color:'black'}}>Reorder Needed Product/s</Card.Title> */}
                  <Card.Text>Needed Product/s</Card.Text>
                  <h3 style={{color:'red'}}>{products.filter((product) => product.stock <= 10).length}</h3>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <hr />

          <div className="table-actions mb-3">
            <Row>
              <Col md={6}>
                <Form.Control
                  type="text"
                  placeholder="Search Products..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </Col>
              <Col md={6} className="d-flex justify-content-end">
                <Button variant="success" className="me-3" onClick={() => setShowAddModal(true)}>
                <FontAwesomeIcon icon={faPlusCircle}/> Add Product
                </Button>
                <Button variant="outline-secondary" onClick={exportToCSV}>
                  <FaFileExport /> Export
                </Button>
              </Col>
            </Row>
          </div>
          <Table bordered hover>
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Product Name</th>
                <th style={{ textAlign: 'left' }}>Category</th>
                <th>SKU</th>
                <th>Incoming Now</th>
                <th>Unit Price</th>
                <th>In Stock</th>
                <th>Total Value</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product._id}>
                  <td style={{ textAlign: 'left' }}>{product.name}</td>
                  <td style={{ textAlign: 'left' }}>{product.category}</td>
                  <td>{product.sku}</td>
                  <td>{product.incoming}</td>
                  <td>{`LKR ${product.price}`}</td>
                  <td>{product.stock}</td>
                  <td>{`LKR ${product.value}`}</td>
                  <td>
                    <Badge className={getStatusClass(product.status)}>{product.status}</Badge>
                  </td>
                  <td>
                    <Dropdown drop='start'>
                      <Dropdown.Toggle style={{backgroundColor:'#636363'}}  className="supplier-dropdown-toggle-custom" variant="secondary">
                        <FaEllipsisV />
                      </Dropdown.Toggle>
                      <Dropdown.Menu style={{backgroundColor:'#636363'}}>
                        <Dropdown.Item as="button" onClick={() => handleEditToggle(product)}>
                          <FaEdit className="me-2" /> Edit
                        </Dropdown.Item>
                        <Dropdown.Item as="button" onClick={() => handleDeleteProduct(product._id)}>
                          <FaTrashAlt className="me-2" /> Delete
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        {/* Add Product Modal */}
        <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Add New Product</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              {['name', 'category', 'sku'].map((field) => (
                <Form.Group key={field} className="mb-3">
                  <Form.Label>{field.charAt(0).toUpperCase() + field.slice(1)}</Form.Label>
                  <Form.Control
                    type="text"
                    name={field}
                    placeholder={`Enter ${field}`}
                    value={newProduct[field]}
                    onChange={handleAddProductChange}
                  />
                </Form.Group>
              ))}
              {['incoming', 'price', 'stock'].map((field) => (
                <Form.Group key={field} className="mb-3">
                  <Form.Label>{field.charAt(0).toUpperCase() + field.slice(1)}</Form.Label>
                  <Form.Control
                    type="number"
                    name={field}
                    placeholder={`Enter ${field}`}
                    value={newProduct[field]}
                    onChange={handleAddProductChange}
                  />
                </Form.Group>
              ))}
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Close
            </Button>
            <Button variant="primary" onClick={handleAddProduct}>
              Add Product
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Edit Product Modal */}
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Product</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              {['name', 'category', 'sku'].map((field) => (
                <Form.Group key={field} className="mb-3">
                  <Form.Label>{field.charAt(0).toUpperCase() + field.slice(1)}</Form.Label>
                  <Form.Control
                    type="text"
                    name={field}
                    placeholder={`Enter ${field}`}
                    value={editedProduct?.[field]}
                    onChange={handleEditProductChange}
                  />
                </Form.Group>
              ))}
              {['incoming', 'price', 'stock'].map((field) => (
                <Form.Group key={field} className="mb-3">
                  <Form.Label>{field.charAt(0).toUpperCase() + field.slice(1)}</Form.Label>
                  <Form.Control
                    type="number"
                    name={field}
                    placeholder={`Enter ${field}`}
                    value={editedProduct?.[field]}
                    onChange={handleEditProductChange}
                  />
                </Form.Group>
              ))}
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Close
            </Button>
            <Button variant="primary" onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
      </div>
      <Footer />
    </>
  );
};

export default StockManagement;
