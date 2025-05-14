"use client";

import { useState, useEffect, useRef } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { v4 as uuidv4 } from "uuid";
import {
  X,
  Plus,
  Trash2,
  Youtube,
  ChevronDown,
  ChevronUp,
  Edit,
  Save,
  Move,
} from "lucide-react";
import "./LearningDashboard.css";

// YouTube thumbnail fetcher
const getYouTubeThumbnail = (url) => {
  try {
    const videoId = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/
    )?.[1];
    return videoId
      ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
      : null;
  } catch (error) {
    console.error("Error parsing YouTube URL:", error);
    return null;
  }
};

// YouTube URL validator
const isValidYouTubeUrl = (url) => {
  const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
  return pattern.test(url);
};

// Day item component
const DayItem = ({ day, content, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);

  const handleSave = () => {
    onUpdate(day, editContent);
    setIsEditing(false);
  };

  return (
    <div className="day-item">
      <div className="day-header">
        <strong>Day {day}:</strong>
        <div className="day-actions">
          <button
            className="icon-button"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? <Save size={16} /> : <Edit size={16} />}
          </button>
          <button className="icon-button" onClick={() => onDelete(day)}>
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      {isEditing ? (
        <div className="day-edit">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="day-textarea"
          />
          <button className="save-button" onClick={handleSave}>
            Save
          </button>
        </div>
      ) : (
        <div className="day-content">{content}</div>
      )}
    </div>
  );
};

// Resource link component
const ResourceLink = ({ url, onDelete }) => {
  const [thumbnail, setThumbnail] = useState(null);
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (isValidYouTubeUrl(url)) {
      const thumb = getYouTubeThumbnail(url);
      setThumbnail(thumb);

      // Try to fetch the title (this is a simplified approach)
      fetch(`https://noembed.com/embed?url=${url}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.title) {
            setTitle(data.title);
          }
        })
        .catch((err) => console.error("Error fetching video title:", err));
    }
  }, [url]);

  const openLink = (e) => {
    e.stopPropagation();
    window.open(url, "_blank");
  };

  return (
    <div className="resource-link">
      <div className="resource-content" onClick={openLink}>
        {thumbnail && (
          <div className="thumbnail-container">
            <img
              src={thumbnail || "/placeholder.svg"}
              alt="Video thumbnail"
              className="video-thumbnail"
            />
            <div className="play-overlay">
              <Youtube size={24} />
            </div>
          </div>
        )}
        <div className="resource-info">
          <div className="resource-title">{title || url}</div>
          <div className="resource-url">{url}</div>
        </div>
      </div>
      <button
        className="icon-button delete-resource"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(url);
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
};

// Card component
const Card = ({ id, card, position, onUpdate, onDelete, onAddNestedCard }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(card.title);
  const [newDayContent, setNewDayContent] = useState("");
  const [newResourceUrl, setNewResourceUrl] = useState("");
  const [showAddDay, setShowAddDay] = useState(false);
  const [showAddResource, setShowAddResource] = useState(false);
  const [nextDay, setNextDay] = useState(
    card.days.length > 0 ? Math.max(...card.days.map((day) => day.day)) + 1 : 1
  );

  const ref = useRef(null);

  // Set up drag
  const [{ isDragging }, drag] = useDrag({
    type: "CARD",
    item: { id, type: "CARD", originalPosition: position },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Apply the drag ref to our element
  drag(ref);

  const handleTitleSave = () => {
    onUpdate(id, { ...card, title: editTitle });
    setIsEditing(false);
  };

  const handleAddDay = () => {
    if (newDayContent.trim()) {
      const updatedDays = [
        ...card.days,
        { day: nextDay, content: newDayContent },
      ];
      onUpdate(id, { ...card, days: updatedDays });
      setNewDayContent("");
      setNextDay(nextDay + 1);
      setShowAddDay(false);
    }
  };

  const handleUpdateDay = (day, content) => {
    const updatedDays = card.days.map((d) =>
      d.day === day ? { ...d, content } : d
    );
    onUpdate(id, { ...card, days: updatedDays });
  };

  const handleDeleteDay = (day) => {
    const updatedDays = card.days.filter((d) => d.day !== day);
    onUpdate(id, { ...card, days: updatedDays });
  };

  const handleAddResource = () => {
    if (newResourceUrl.trim() && isValidYouTubeUrl(newResourceUrl)) {
      const updatedResources = [...card.resources, newResourceUrl];
      onUpdate(id, { ...card, resources: updatedResources });
      setNewResourceUrl("");
      setShowAddResource(false);
    } else {
      alert("Please enter a valid YouTube URL");
    }
  };

  const handleDeleteResource = (url) => {
    const updatedResources = card.resources.filter((r) => r !== url);
    onUpdate(id, { ...card, resources: updatedResources });
  };

  return (
    <div
      ref={ref}
      className={`learning-card ${isDragging ? "dragging" : ""}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div className="card-header">
        <div className="drag-handle">
          <Move size={16} />
        </div>
        {isEditing ? (
          <div className="edit-title">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="title-input"
            />
            <button className="save-button" onClick={handleTitleSave}>
              Save
            </button>
          </div>
        ) : (
          <h3 className="card-title" onClick={() => setIsEditing(true)}>
            {card.title}
          </h3>
        )}
        <div className="card-actions">
          <button
            className="icon-button"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <button className="icon-button" onClick={() => onDelete(id)}>
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="card-content">
          {/* Days section */}
          <div className="card-section">
            <h4 className="section-title">Learning Plan</h4>
            <div className="days-list">
              {card.days
                .sort((a, b) => a.day - b.day)
                .map((day) => (
                  <DayItem
                    key={day.day}
                    day={day.day}
                    content={day.content}
                    onUpdate={handleUpdateDay}
                    onDelete={handleDeleteDay}
                  />
                ))}
            </div>

            {showAddDay ? (
              <div className="add-day-form">
                <div className="form-group">
                  <label>Day {nextDay} Content:</label>
                  <textarea
                    value={newDayContent}
                    onChange={(e) => setNewDayContent(e.target.value)}
                    placeholder="What to learn on this day..."
                    className="day-textarea"
                  />
                </div>
                <div className="form-actions">
                  <button
                    className="cancel-button"
                    onClick={() => setShowAddDay(false)}
                  >
                    Cancel
                  </button>
                  <button className="add-button" onClick={handleAddDay}>
                    Add Day
                  </button>
                </div>
              </div>
            ) : (
              <button
                className="add-item-button"
                onClick={() => setShowAddDay(true)}
              >
                <Plus size={16} /> Add Day
              </button>
            )}
          </div>

          {/* Resources section */}
          <div className="card-section">
            <h4 className="section-title">Resources</h4>
            <div className="resources-list">
              {card.resources.map((url, index) => (
                <ResourceLink
                  key={index}
                  url={url}
                  onDelete={handleDeleteResource}
                />
              ))}
            </div>

            {showAddResource ? (
              <div className="add-resource-form">
                <div className="form-group">
                  <label>YouTube URL:</label>
                  <input
                    type="text"
                    value={newResourceUrl}
                    onChange={(e) => setNewResourceUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="resource-input"
                  />
                </div>
                <div className="form-actions">
                  <button
                    className="cancel-button"
                    onClick={() => setShowAddResource(false)}
                  >
                    Cancel
                  </button>
                  <button className="add-button" onClick={handleAddResource}>
                    Add Resource
                  </button>
                </div>
              </div>
            ) : (
              <button
                className="add-item-button"
                onClick={() => setShowAddResource(true)}
              >
                <Plus size={16} /> Add YouTube Resource
              </button>
            )}
          </div>

          {/* Nested cards section */}
          <div className="card-section">
            <h4 className="section-title">Sub-Topics</h4>
            <div className="nested-cards">
              {card.nestedCards.map((nestedCard) => (
                <div key={nestedCard.id} className="nested-card-preview">
                  <h5>{nestedCard.title}</h5>
                  <div className="nested-card-stats">
                    <span>{nestedCard.days.length} days</span>
                    <span>{nestedCard.resources.length} resources</span>
                  </div>
                </div>
              ))}
            </div>
            <button
              className="add-item-button"
              onClick={() => onAddNestedCard(id)}
            >
              <Plus size={16} /> Add Sub-Topic
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Dashboard component
const Dashboard = () => {
  const [cards, setCards] = useState({});
  const [nextCardId, setNextCardId] = useState(1);
  const dashboardRef = useRef(null);

  // Load data from session storage on initial render
  useEffect(() => {
    try {
      const savedData = sessionStorage.getItem("learningDashboard");
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setCards(parsedData.cards || {});
        setNextCardId(parsedData.nextCardId || 1);
        console.log("Data loaded from session storage");
      }
    } catch (error) {
      console.error("Error loading data from session storage:", error);
    }
  }, []);

  // Save data to session storage whenever cards change
  useEffect(() => {
    try {
      sessionStorage.setItem(
        "learningDashboard",
        JSON.stringify({
          cards,
          nextCardId,
        })
      );
    } catch (error) {
      console.error("Error saving data to session storage:", error);
    }
  }, [cards, nextCardId]);

  // Handle drop to position cards
  const [, drop] = useDrop({
    accept: "CARD",
    drop: (item, monitor) => {
      const delta = monitor.getDifferenceFromInitialOffset();
      const originalPosition = item.originalPosition;

      const left = Math.max(0, Math.round(originalPosition.x + delta.x));
      const top = Math.max(0, Math.round(originalPosition.y + delta.y));

      moveCard(item.id, left, top);
      return undefined;
    },
  });

  const moveCard = (id, left, top) => {
    setCards((prevCards) => {
      // Handle nested cards
      for (const cardId in prevCards) {
        const card = prevCards[cardId];
        const nestedIndex = card.nestedCards.findIndex((nc) => nc.id === id);

        if (nestedIndex >= 0) {
          // This is a nested card
          const updatedNestedCards = [...card.nestedCards];
          updatedNestedCards[nestedIndex] = {
            ...updatedNestedCards[nestedIndex],
            position: { x: left, y: top },
          };

          return {
            ...prevCards,
            [cardId]: {
              ...card,
              nestedCards: updatedNestedCards,
            },
          };
        }
      }

      // This is a top-level card
      return {
        ...prevCards,
        [id]: {
          ...prevCards[id],
          position: { x: left, y: top },
        },
      };
    });
  };

  const addCard = () => {
    const id = `card-${nextCardId}`;
    const newPosition = {
      x: Math.random() * (dashboardRef.current.clientWidth - 300),
      y: Math.random() * (dashboardRef.current.clientHeight - 300),
    };

    setCards({
      ...cards,
      [id]: {
        id,
        title: `New Learning Topic ${nextCardId}`,
        days: [],
        resources: [],
        nestedCards: [],
        position: newPosition,
      },
    });

    setNextCardId(nextCardId + 1);
  };

  const updateCard = (id, updatedCard) => {
    // Check if this is a nested card
    for (const cardId in cards) {
      const card = cards[cardId];
      const nestedIndex = card.nestedCards.findIndex((nc) => nc.id === id);

      if (nestedIndex >= 0) {
        // Update nested card
        const updatedNestedCards = [...card.nestedCards];
        updatedNestedCards[nestedIndex] = {
          ...updatedNestedCards[nestedIndex],
          ...updatedCard,
        };

        setCards({
          ...cards,
          [cardId]: {
            ...card,
            nestedCards: updatedNestedCards,
          },
        });
        return;
      }
    }

    // Update top-level card
    setCards({
      ...cards,
      [id]: {
        ...cards[id],
        ...updatedCard,
      },
    });
  };

  const deleteCard = (id) => {
    // Check if this is a nested card
    for (const cardId in cards) {
      const card = cards[cardId];
      const nestedIndex = card.nestedCards.findIndex((nc) => nc.id === id);

      if (nestedIndex >= 0) {
        // Delete nested card
        const updatedNestedCards = card.nestedCards.filter(
          (nc) => nc.id !== id
        );

        setCards({
          ...cards,
          [cardId]: {
            ...card,
            nestedCards: updatedNestedCards,
          },
        });
        return;
      }
    }

    // Delete top-level card
    const { [id]: deletedCard, ...remainingCards } = cards;
    setCards(remainingCards);
  };

  const addNestedCard = (parentId) => {
    const nestedId = `nested-${uuidv4()}`;
    const parentCard = cards[parentId];

    if (!parentCard) return;

    const newNestedCard = {
      id: nestedId,
      title: `Sub-Topic ${parentCard.nestedCards.length + 1}`,
      days: [],
      resources: [],
      nestedCards: [],
      position: {
        x: parentCard.position.x + 50,
        y: parentCard.position.y + 50,
      },
    };

    setCards({
      ...cards,
      [parentId]: {
        ...parentCard,
        nestedCards: [...parentCard.nestedCards, newNestedCard],
      },
    });
  };

  const clearDashboard = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all cards? This cannot be undone."
      )
    ) {
      setCards({});
      setNextCardId(1);
      sessionStorage.removeItem("learningDashboard");
    }
  };

  return (
    <div className="learning-dashboard" ref={dashboardRef}>
      <div className="dashboard-header">
        <h1>Learning Dashboard</h1>
        <div className="dashboard-actions">
          <button className="action-button add-card" onClick={addCard}>
            <Plus size={16} /> Add Learning Card
          </button>
          <button
            className="action-button clear-dashboard"
            onClick={clearDashboard}
          >
            <Trash2 size={16} /> Clear Dashboard
          </button>
        </div>
      </div>

      <div className="dashboard-content" ref={drop}>
        {Object.values(cards).map((card) => (
          <Card
            key={card.id}
            id={card.id}
            card={card}
            position={card.position}
            onUpdate={updateCard}
            onDelete={deleteCard}
            onAddNestedCard={addNestedCard}
          />
        ))}

        {/* Render nested cards */}
        {Object.values(cards).flatMap((card) =>
          card.nestedCards.map((nestedCard) => (
            <Card
              key={nestedCard.id}
              id={nestedCard.id}
              card={nestedCard}
              position={nestedCard.position}
              onUpdate={updateCard}
              onDelete={deleteCard}
              onAddNestedCard={addNestedCard}
            />
          ))
        )}
      </div>
    </div>
  );
};

// Main component
const LearningDashboard = () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <Dashboard />
    </DndProvider>
  );
};

export default LearningDashboard;
