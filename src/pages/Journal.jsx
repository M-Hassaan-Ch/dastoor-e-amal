import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { format, parseISO } from "date-fns";
import "./Journal.css";

const JournalPage = () => {
  const [entries, setEntries] = useState(() => {
    const saved = sessionStorage.getItem("journalEntries");
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((entry) =>
        entry.id ? entry : { ...entry, id: Date.now() }
      );
    }
    return [];
  });

  const [selectedEntryId, setSelectedEntryId] = useState("");
  const [content, setContent] = useState("");
  const scrollContainerRef = useRef(null);

  // Initialize from session storage
  useEffect(() => {
    const savedLastId = sessionStorage.getItem("lastEntryId");
    const savedEntries = sessionStorage.getItem("journalEntries");

    if (savedEntries) {
      const parsedEntries = JSON.parse(savedEntries);
      const lastEntry = parsedEntries.find((e) => e.id === Number(savedLastId));

      if (lastEntry) {
        setSelectedEntryId(lastEntry.id);
        setContent(lastEntry.content);
        return;
      }
    }

    if (entries.length > 0) {
      setSelectedEntryId(entries[0].id);
    }
  }, []);

  // Handle content changes
  useEffect(() => {
    if (selectedEntryId) {
      const selectedEntry = entries.find((e) => e.id === selectedEntryId);
      if (selectedEntry) {
        setContent(selectedEntry.content);
        sessionStorage.setItem("lastEntryId", selectedEntryId);
      }
    }
  }, [selectedEntryId, entries]);

  // Persist entries to session storage
  useEffect(() => {
    sessionStorage.setItem("journalEntries", JSON.stringify(entries));
  }, [entries]);

  const createNewEntry = () => ({
    id: Date.now(),
    date: format(new Date(), "yyyy-MM-dd"),
    content: "",
  });

  const handleAddNewPage = () => {
    const newEntry = createNewEntry();
    setEntries((prev) => {
      const newEntries = [...prev, newEntry];
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollLeft =
            scrollContainerRef.current.scrollWidth;
        }
      }, 0);
      return newEntries;
    });
    setSelectedEntryId(newEntry.id);
  };

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    setEntries(
      entries.map((entry) =>
        entry.id === selectedEntryId ? { ...entry, content: newContent } : entry
      )
    );
    sessionStorage.setItem("lastEntryId", selectedEntryId);
  };

  return (
    <Container fluid className="journal-container">
      {/* Date Timeline */}
      <Row className="date-scroll-container">
        <Col className="date-scroll" ref={scrollContainerRef}>
          {entries.map((entry) => (
            <button
              key={entry.id}
              className={`date-btn ${
                selectedEntryId === entry.id ? "active" : ""
              }`}
              onClick={() => setSelectedEntryId(entry.id)}
            >
              {format(parseISO(entry.date), "MMM dd")}
              <span className="entry-counter">
                {entries.filter((e) => e.date === entry.date).length > 1
                  ? ` #${
                      entries
                        .filter((e) => e.date === entry.date)
                        .indexOf(entry) + 1
                    }`
                  : ""}
              </span>
            </button>
          ))}
          <button className="date-btn new-entry" onClick={handleAddNewPage}>
            +
          </button>
        </Col>
      </Row>

      {/* Journal Editor */}
      <Row className="journal-editor">
        <Col>
          <textarea
            value={content}
            onChange={handleContentChange}
            className="journal-content"
            placeholder="Start writing your thoughts here..."
            style={{ color: "#e0e0e0" }}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default JournalPage;
