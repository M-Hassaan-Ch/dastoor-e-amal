import React, { useState } from "react";
import {
  Navbar as BootstrapNavbar,
  Nav,
  Container,
  Dropdown,
} from "react-bootstrap";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  List,
  BoxArrowRight,
  Calendar3,
  Journal,
  ListTask,
  Laptop,
} from "react-bootstrap-icons";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);

  const handleBrandClick = (e) => {
    e.preventDefault();
    setExpanded(false);
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <BootstrapNavbar
      bg="dark"
      variant="dark"
      expand="lg"
      sticky={location.pathname !== "/" ? "top" : undefined}
      fixed={location.pathname === "/" ? "top" : undefined}
      className="navbar-custom"
      expanded={expanded}
      onToggle={setExpanded}
    >
      <Container fluid>
        <BootstrapNavbar.Brand
          onClick={handleBrandClick}
          className="brand-text me-3"
          style={{ cursor: "pointer" }}
        >
          Dastoor-e-Amal
        </BootstrapNavbar.Brand>

        <BootstrapNavbar.Toggle aria-controls="navbar-nav">
          <List size={20} />
        </BootstrapNavbar.Toggle>

        <BootstrapNavbar.Collapse id="navbar-nav">
          <Nav className="ms-auto align-items-center">
            <Nav.Link
              as={Link}
              to="/daily-tasks"
              className={`nav-link-custom ${isActive("/daily-tasks") ? "active" : ""}`}
              onClick={() => setExpanded(false)}
            >
              <ListTask className="nav-icon" /> Tasks
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/journal"
              className={`nav-link-custom ${isActive("/journal") ? "active" : ""}`}
              onClick={() => setExpanded(false)}
            >
              <Journal className="nav-icon" /> Journal
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/life-calendar"
              className={`nav-link-custom ${isActive("/life-calendar") ? "active" : ""}`}
              onClick={() => setExpanded(false)}
            >
              <Calendar3 className="nav-icon" /> Calendar
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/daily-routine"
              className={`nav-link-custom ${isActive("/daily-routine") ? "active" : ""}`}
              onClick={() => setExpanded(false)}
            >
              <ListTask className="nav-icon" /> Routine
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/learning-dashboard"
              className={`nav-link-custom ${isActive("/learning-dashboard") ? "active" : ""}`}
              onClick={() => setExpanded(false)}
            >
              <Laptop className="nav-icon" /> Learning
            </Nav.Link>
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;
