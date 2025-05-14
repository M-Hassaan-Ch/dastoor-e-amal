import React from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import { Link } from "react-router-dom"; // Add this import
import "bootstrap/dist/css/bootstrap.min.css";
import "./LandingPage.css";

const LandingPage = () => {
  return (
    <div className="container-fluid p-0">
      {/* Hero Section */}
      <section className="section section1 hero-section">
        <Container className="d-flex justify-content-center align-items-center">
          <h1 className="heading text-center mb-0">دستورِ عمل</h1>
        </Container>
      </section>

      {/* Content Sections */}
      <SectionContent
        title="List Down Your Daily Tasks"
        page="/daily-tasks"
        text="Make a list of all your chores and tasks for the day and keep track by crossing off activities you have completed!"
        image="2.jpg"
      />

      <SectionContent
        title="Keep A Journal"
        page="/journal"
        text="Record your ideas, daily experiences, and future plans in a journal."
        image="3.jpg"
        reverse
      />

      <SectionContent
        title="Track Your Life"
        page="/life-calendar"
        text="Through the life calendar, track the number of days you have spent on mother earth and days yet to be explored. Set long-term goals and work hard to achieve them!"
        image="4.jpg"
      />

      <SectionContent
        title="Set A Daily Routine"
        page="/daily-routine"
        text="Use the clock to set a daily routine and get reminders to help you stay consistent."
        image="6.jpg"
        reverse
      />

      {/* Learning Section */}
      <section className="section6">
        <div className="text-content text-center">
          <h2>Learning Is The Key</h2>
          <p>
            Use the learning dashboard which is designed to facilitate you in
            every way to learn a particular skill. Create a course outline, add
            links to youtube tutorials and courses, set daily goals, upload
            helpful material and Learn Away!
          </p>
        </div>
      </section>

      {/* Footer */}
      <section className="section section7">
        <Container>
          <div className="row">
            <FooterColumn
              title="Company"
              links={["About", "Careers", "Press", "Blog"]}
            />
            <FooterColumn
              title="Social Media"
              links={["Instagram", "Facebook", "Reddit", "Youtube"]}
            />
            <FooterColumn
              title="Help"
              links={["FAQ", "Contact Us", "Privacy Policy"]}
            />
          </div>
        </Container>
      </section>
    </div>
  );
};

// Reusable Section Content Component
// Update the SectionContent component in LandingPage.jsx
const SectionContent = ({ title, text, image, reverse, page }) => {
  return (
    <section className="section content-section">
      <Container>
        <div
          className={`row align-items-center ${reverse ? "order-switch" : ""}`}
        >
          <div className="col-md-6">
            <div className="text-content">
              <h2>{title}</h2>
              <p>{text}</p>
            </div>
          </div>
          <div className="col-md-6">
            <Link to={page}>
              <div className="image-content">
                <img
                  src={`/${image}`}
                  alt="Feature visual"
                  className="img-fluid"
                />
              </div>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
};

// Footer Column Component
const FooterColumn = ({ title, links }) => {
  return (
    <div className="col-md-4">
      <div className="footer-column">
        <h3>{title}</h3>
        {links.map((link, index) => (
          <a key={index} href="#">
            {link}
          </a>
        ))}
      </div>
    </div>
  );
};

export default LandingPage;
