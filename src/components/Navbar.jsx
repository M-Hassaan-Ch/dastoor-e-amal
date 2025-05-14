import React, { useState } from 'react';
import { Navbar as BootstrapNavbar, Nav, Container, Button, Dropdown } from 'react-bootstrap';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { List, Person, BoxArrowRight, Calendar3, Journal, ListTask, Laptop } from 'react-bootstrap-icons';
import { authService } from '../services/authService';
import './Navbar.css';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const user = authService.getCurrentUser();
    const [expanded, setExpanded] = useState(false);

    const handleLogout = () => {
        authService.logout();
    };

    const handleBrandClick = (e) => {
        e.preventDefault();
        setExpanded(false);
        navigate('/');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <BootstrapNavbar 
            bg="dark" 
            variant="dark" 
            expand="lg" 
            fixed="top" 
            className="navbar-custom"
            expanded={expanded}
            onToggle={setExpanded}
        >
            <Container fluid>
                <Nav className="mx-auto align-items-center">
                    <BootstrapNavbar.Brand 
                        onClick={handleBrandClick}
                        className="brand-text me-3"
                        style={{ cursor: 'pointer' }}
                    >
                        Dastoor-e-Amal
                    </BootstrapNavbar.Brand>
                    
                    <BootstrapNavbar.Toggle aria-controls="navbar-nav">
                        <List size={20} />
                    </BootstrapNavbar.Toggle>
                    
                    <BootstrapNavbar.Collapse id="navbar-nav">
                        <Nav className="me-auto">
                            <Nav.Link 
                                as={Link} 
                                to="/daily-tasks" 
                                className={`nav-link-custom ${isActive('/daily-tasks') ? 'active' : ''}`}
                                onClick={() => setExpanded(false)}
                            >
                                <ListTask className="nav-icon" /> Tasks
                            </Nav.Link>
                            <Nav.Link 
                                as={Link} 
                                to="/journal" 
                                className={`nav-link-custom ${isActive('/journal') ? 'active' : ''}`}
                                onClick={() => setExpanded(false)}
                            >
                                <Journal className="nav-icon" /> Journal
                            </Nav.Link>
                            <Nav.Link 
                                as={Link} 
                                to="/life-calendar" 
                                className={`nav-link-custom ${isActive('/life-calendar') ? 'active' : ''}`}
                                onClick={() => setExpanded(false)}
                            >
                                <Calendar3 className="nav-icon" /> Calendar
                            </Nav.Link>
                            <Nav.Link 
                                as={Link} 
                                to="/daily-routine" 
                                className={`nav-link-custom ${isActive('/daily-routine') ? 'active' : ''}`}
                                onClick={() => setExpanded(false)}
                            >
                                <ListTask className="nav-icon" /> Routine
                            </Nav.Link>
                            <Nav.Link 
                                as={Link} 
                                to="/learning-dashboard" 
                                className={`nav-link-custom ${isActive('/learning-dashboard') ? 'active' : ''}`}
                                onClick={() => setExpanded(false)}
                            >
                                <Laptop className="nav-icon" /> Learning
                            </Nav.Link>
                        </Nav>
                        
                        {user && (
                            <Dropdown align="end">
                                <Dropdown.Toggle variant="dark" id="user-dropdown" className="user-dropdown">
                                    <Person className="nav-icon" />
                                    {user.name}
                                </Dropdown.Toggle>

                                <Dropdown.Menu variant="dark">
                                    <Dropdown.Item onClick={handleLogout}>
                                        <BoxArrowRight className="nav-icon" />
                                        Logout
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        )}
                    </BootstrapNavbar.Collapse>
                </Nav>
            </Container>
        </BootstrapNavbar>
    );
};

export default Navbar; 