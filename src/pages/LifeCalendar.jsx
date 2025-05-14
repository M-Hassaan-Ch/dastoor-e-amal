"use client";

import { useState, useEffect, useMemo, useCallback, memo, useRef } from "react";
import { Modal, Button, Badge, Form } from "react-bootstrap";
import { Clock, ZoomIn, ZoomOut, FullscreenExit } from "react-bootstrap-icons";
import "./LifeCalendar.css";

// Debounce function to limit how often a function can be called
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Changed to use sessionStorage instead of localStorage
const getInitialState = () => {
  if (typeof window === "undefined")
    return { age: null, duration: null, events: {} };
  const savedData = sessionStorage.getItem("lifeCalendar");
  return savedData
    ? JSON.parse(savedData)
    : { age: null, duration: null, events: {} };
};

const calculateTimeLeft = (birthYear, duration) => {
  const now = new Date();
  const endDate = new Date(birthYear + duration, 0, 1);
  const diff = endDate - now;

  if (diff <= 0) return { years: 0, months: 0, days: 0, hours: 0 };

  // Calculate years
  const years = endDate.getFullYear() - now.getFullYear();

  // Calculate months (0-11)
  let months = endDate.getMonth() - now.getMonth();
  if (months < 0) {
    months += 12;
  }

  // Calculate days
  let days = endDate.getDate() - now.getDate();
  if (days < 0) {
    const tempDate = new Date(now);
    tempDate.setMonth(now.getMonth() + 1);
    tempDate.setDate(0);
    days += tempDate.getDate();
    months--;
  }

  // Calculate hours
  let hours = endDate.getHours() - now.getHours();
  if (hours < 0) {
    hours += 24;
    days--;
  }

  return {
    years: Math.max(years, 0),
    months: Math.max(months, 0),
    days: Math.max(days, 0),
    hours: Math.max(hours, 0),
  };
};

// Memoized day component for better performance
const CalendarDay = memo(({ day, daysLived, events, onDayClick, daySize }) => {
  const hasEvent = events[day];
  const isLived = day <= daysLived;
  const showBadge = hasEvent && daySize >= 10;

  return (
    <div
      className={`calendar-day ${isLived ? "lived" : ""} ${
        hasEvent ? "has-event" : ""
      }`}
      onClick={() => onDayClick(day)}
      style={{ width: `${daySize}px`, height: `${daySize}px` }}
    >
      {showBadge && (
        <Badge bg="primary" className="event-badge">
          {events[day].length}
        </Badge>
      )}
    </div>
  );
});
CalendarDay.displayName = "CalendarDay";

// Memoized row component for better performance
const CalendarRow = memo(
  ({
    startDay,
    daysPerRow,
    totalDays,
    daysLived,
    events,
    onDayClick,
    daySize,
  }) => {
    const days = [];

    for (let i = 0; i < daysPerRow; i++) {
      const day = startDay + i;
      if (day <= totalDays) {
        days.push(
          <CalendarDay
            key={day}
            day={day}
            daysLived={daysLived}
            events={events}
            onDayClick={onDayClick}
            daySize={daySize}
          />
        );
      }
    }

    return <div className="calendar-row">{days}</div>;
  }
);
CalendarRow.displayName = "CalendarRow";

const LifeCalendar = () => {
  const [state, setState] = useState(getInitialState);
  const [showSetup, setShowSetup] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);
  const [eventText, setEventText] = useState("");
  const [timeLeft, setTimeLeft] = useState({});
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 3000 });
  const [containerWidth, setContainerWidth] = useState(1000);
  const [containerHeight, setContainerHeight] = useState(800);
  const [isInitialized, setIsInitialized] = useState(false);
  const [formValues, setFormValues] = useState({ age: "", duration: "" });
  const [scrollPosition, setScrollPosition] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(() => {
    // Initialize from sessionStorage if available
    if (typeof window !== "undefined") {
      const savedData = sessionStorage.getItem("lifeCalendar");
      if (savedData) {
        const parsed = JSON.parse(savedData);
        return parsed.zoomLevel || 20;
      }
    }
    return 20;
  });
  const [isZooming, setIsZooming] = useState(false);

  // Refs for performance optimization
  const calendarWrapperRef = useRef(null);
  const debouncedZoomRef = useRef(null);
  const zoomTimerRef = useRef(null);

  // Initialize setup modal state
  useEffect(() => {
    // Only set showSetup to false if we have both age and duration
    if (state.age && state.duration) {
      setShowSetup(false);
      setIsInitialized(true);
    } else {
      setShowSetup(true);
    }
  }, []);

  // Save zoom level to state when it changes
  useEffect(() => {
    if (typeof window !== "undefined" && !isZooming) {
      setState((prev) => ({ ...prev, zoomLevel }));
    }
  }, [zoomLevel, isZooming]);

  // Memoized calculations
  const { totalDays, daysLived, daysPerRow, daySize, bufferSize, showAll } =
    useMemo(() => {
      if (!state.age || !state.duration)
        return {
          totalDays: 0,
          daysLived: 0,
          daysPerRow: 30,
          daySize: 20,
          bufferSize: 100,
          showAll: false,
        };

      // Use zoom level from state
      const daySize = zoomLevel;
      const gap = 2;
      const dayWidth = daySize + gap;

      // Calculate days per row based on container width
      const calculatedDaysPerRow = Math.max(
        10,
        Math.floor((containerWidth - 40) / dayWidth)
      );

      // Very large buffer to prevent disappearing content
      const bufferSize = calculatedDaysPerRow * 50;

      // Determine if we should show all days (when zoomed out enough)
      const totalDays = state.duration * 365;
      const showAll = daySize <= 5 || (daySize <= 10 && totalDays <= 20000);

      return {
        totalDays,
        daysLived: state.age * 365,
        daysPerRow: calculatedDaysPerRow,
        daySize,
        bufferSize,
        showAll,
      };
    }, [state.age, state.duration, containerWidth, zoomLevel]);

  // Persist state to sessionStorage instead of localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("lifeCalendar", JSON.stringify(state));
    }
  }, [state]);

  // Time updates
  useEffect(() => {
    if (state.age) {
      const birthYear = new Date().getFullYear() - state.age;
      setTimeLeft(calculateTimeLeft(birthYear, state.duration));

      const timer = setInterval(() => {
        setTimeLeft(calculateTimeLeft(birthYear, state.duration));
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [state.age, state.duration]);

  // Create debounced zoom function
  useEffect(() => {
    debouncedZoomRef.current = debounce((newZoomLevel) => {
      setZoomLevel(newZoomLevel);
      setIsZooming(false);
    }, 150);
  }, []);

  // Handle scroll and resize
  useEffect(() => {
    if (typeof window === "undefined" || !isInitialized) return;

    const handleScroll = () => {
      if (!calendarWrapperRef.current) return;

      const scrollTop = calendarWrapperRef.current.scrollTop;
      setScrollPosition(scrollTop);

      // Skip calculation if showing all
      if (showAll) return;

      const viewportHeight = calendarWrapperRef.current.clientHeight;
      setContainerHeight(viewportHeight);

      // Calculate visible range based on scroll position with a MUCH larger buffer
      const rowHeight = daySize + 2; // day height + gap
      const rowsPerScreen = Math.ceil(viewportHeight / rowHeight);

      // Calculate rows with a very large buffer
      const bufferRows = Math.ceil(bufferSize / daysPerRow);
      const startRow = Math.max(
        0,
        Math.floor(scrollTop / rowHeight) - bufferRows
      );
      const endRow = Math.min(
        Math.ceil(totalDays / daysPerRow),
        startRow + rowsPerScreen + bufferRows * 2
      );

      const startDay = startRow * daysPerRow;
      const endDay = Math.min(totalDays, (endRow + 1) * daysPerRow);

      setVisibleRange({ start: startDay, end: endDay });
    };

    const handleResize = () => {
      if (!calendarWrapperRef.current) return;

      setContainerWidth(calendarWrapperRef.current.clientWidth);
      setContainerHeight(calendarWrapperRef.current.clientHeight);

      // Use requestAnimationFrame for smoother handling
      requestAnimationFrame(handleScroll);
    };

    // Initial setup with a delay to ensure DOM is ready
    setTimeout(() => {
      handleResize();
      // Initial render with full content for small calendars or when zoomed out
      if (showAll) {
        setVisibleRange({ start: 0, end: totalDays });
      }
    }, 100);

    if (calendarWrapperRef.current) {
      calendarWrapperRef.current.addEventListener("scroll", handleScroll, {
        passive: true,
      });
    }

    window.addEventListener("resize", handleResize);

    return () => {
      if (calendarWrapperRef.current) {
        calendarWrapperRef.current.removeEventListener("scroll", handleScroll);
      }
      window.removeEventListener("resize", handleResize);
    };
  }, [daysPerRow, totalDays, isInitialized, daySize, bufferSize, showAll]);

  const handleSetup = useCallback(
    (e) => {
      e.preventDefault(); // Prevent form submission

      // Parse values as numbers
      const age = Number.parseInt(formValues.age, 10);
      const duration = Number.parseInt(formValues.duration, 10);

      // Validate inputs
      if (isNaN(age) || age <= 0 || isNaN(duration) || duration <= 0) {
        alert(
          "Please enter valid values for age and duration (greater than 0)"
        );
        return;
      }

      // Update state with validated values
      setState((prev) => ({ ...prev, age, duration, zoomLevel }));
      setShowSetup(false);
      setIsInitialized(true);
    },
    [formValues, zoomLevel]
  );

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleAddEvent = useCallback(() => {
    if (eventText.trim() && selectedDay) {
      setState((prev) => ({
        ...prev,
        events: {
          ...prev.events,
          [selectedDay]: [...(prev.events[selectedDay] || []), eventText],
        },
      }));
      setEventText("");
      setSelectedDay(null);
    }
  }, [eventText, selectedDay]);

  // Optimized zoom handlers
  const handleZoomIn = useCallback(() => {
    setIsZooming(true);
    const newZoomLevel = Math.min(30, zoomLevel + 2);

    // Apply zoom immediately for visual feedback
    document.documentElement.style.setProperty("--calendar-scale", "1.05");

    // Clear previous timer if exists
    if (zoomTimerRef.current) clearTimeout(zoomTimerRef.current);

    // Reset scale after animation
    zoomTimerRef.current = setTimeout(() => {
      document.documentElement.style.setProperty("--calendar-scale", "1");
    }, 150);

    // Use debounced function to update state
    debouncedZoomRef.current(newZoomLevel);
  }, [zoomLevel]);

  const handleZoomOut = useCallback(() => {
    setIsZooming(true);
    const newZoomLevel = Math.max(2, zoomLevel - 2);

    // Apply zoom immediately for visual feedback
    document.documentElement.style.setProperty("--calendar-scale", "0.95");

    // Clear previous timer if exists
    if (zoomTimerRef.current) clearTimeout(zoomTimerRef.current);

    // Reset scale after animation
    zoomTimerRef.current = setTimeout(() => {
      document.documentElement.style.setProperty("--calendar-scale", "1");
    }, 150);

    // Use debounced function to update state
    debouncedZoomRef.current(newZoomLevel);
  }, [zoomLevel]);

  const handleFitToScreen = useCallback(() => {
    if (!totalDays || !containerWidth || !containerHeight) return;

    setIsZooming(true);

    // Calculate the optimal day size to fit the entire calendar on screen
    const totalRows = Math.ceil(totalDays / (containerWidth / 10)); // Estimate with minimum day size
    const optimalDaySize = Math.min(
      Math.floor((containerWidth - 40) / Math.ceil(Math.sqrt(totalDays))),
      Math.floor((containerHeight - 40) / Math.ceil(Math.sqrt(totalDays)))
    );

    // Set a reasonable minimum size
    const newZoomLevel = Math.max(2, Math.min(10, optimalDaySize));

    // Apply zoom immediately for visual feedback
    document.documentElement.style.setProperty("--calendar-scale", "0.9");

    // Clear previous timer if exists
    if (zoomTimerRef.current) clearTimeout(zoomTimerRef.current);

    // Reset scale after animation
    zoomTimerRef.current = setTimeout(() => {
      document.documentElement.style.setProperty("--calendar-scale", "1");
    }, 150);

    // Use debounced function to update state
    debouncedZoomRef.current(newZoomLevel);
  }, [totalDays, containerWidth, containerHeight]);

  // Add a reset function to clear session data
  const handleReset = useCallback(() => {
    if (
      confirm(
        "Are you sure you want to reset the calendar? All data will be lost."
      )
    ) {
      sessionStorage.removeItem("lifeCalendar");
      window.location.reload();
    }
  }, []);

  const renderCalendarDays = useCallback(() => {
    if (!totalDays) return null;

    // For small calendars or when zoomed out enough, render everything at once
    if (showAll) {
      return renderAllDays();
    }

    // For larger calendars, use virtualization with large buffers
    return renderVirtualizedDays();
  }, [
    totalDays,
    daysLived,
    daysPerRow,
    state.events,
    visibleRange,
    daySize,
    scrollPosition,
    showAll,
  ]);

  // Render all days without virtualization (for small calendars or when zoomed out)
  const renderAllDays = useCallback(() => {
    const rows = [];
    const totalRows = Math.ceil(totalDays / daysPerRow);

    // Use CalendarRow component for better performance
    for (let row = 0; row < totalRows; row++) {
      const startDay = row * daysPerRow + 1;
      rows.push(
        <CalendarRow
          key={`row-${row}`}
          startDay={startDay}
          daysPerRow={daysPerRow}
          totalDays={totalDays}
          daysLived={daysLived}
          events={state.events}
          onDayClick={setSelectedDay}
          daySize={daySize}
        />
      );
    }

    return rows;
  }, [totalDays, daysLived, daysPerRow, state.events, daySize]);

  // Render days with virtualization (for large calendars)
  const renderVirtualizedDays = useCallback(() => {
    // Create chunks of days for each row
    const rows = [];
    const totalRows = Math.ceil(totalDays / daysPerRow);

    // Calculate which rows are visible
    const startRow = Math.floor(visibleRange.start / daysPerRow);
    const endRow = Math.ceil(visibleRange.end / daysPerRow);

    // Create placeholder for invisible rows above
    if (startRow > 0) {
      rows.push(
        <div
          key="top-spacer"
          style={{ height: `${startRow * (daySize + 2)}px` }}
          className="calendar-spacer"
        />
      );
    }

    // Render visible rows using CalendarRow component
    for (let row = startRow; row < endRow && row < totalRows; row++) {
      const startDay = row * daysPerRow + 1;
      rows.push(
        <CalendarRow
          key={`row-${row}`}
          startDay={startDay}
          daysPerRow={daysPerRow}
          totalDays={totalDays}
          daysLived={daysLived}
          events={state.events}
          onDayClick={setSelectedDay}
          daySize={daySize}
        />
      );
    }

    // Create placeholder for invisible rows below
    const remainingRows = totalRows - endRow;
    if (remainingRows > 0) {
      rows.push(
        <div
          key="bottom-spacer"
          style={{ height: `${remainingRows * (daySize + 2)}px` }}
          className="calendar-spacer"
        />
      );
    }

    return rows;
  }, [totalDays, daysLived, daysPerRow, state.events, visibleRange, daySize]);

  return (
    <div className="life-calendar-container">
      {/* Time Display */}
      {state.age && state.duration && (
        <div className="time-display">
          <Clock className="me-2" />
          <span>
            {timeLeft.years}y {timeLeft.months}m {timeLeft.days}d{" "}
            {timeLeft.hours}h left
          </span>
        </div>
      )}

      {/* Zoom Controls */}
      {state.age && state.duration && (
        <div className="zoom-controls">
          <Button
            variant="dark"
            onClick={handleZoomOut}
            className="zoom-btn"
            title="Zoom Out"
          >
            <ZoomOut />
          </Button>
          <Button
            variant="dark"
            onClick={handleFitToScreen}
            className="zoom-btn"
            title="Fit to Screen"
          >
            <FullscreenExit />
          </Button>
          <Button
            variant="dark"
            onClick={handleZoomIn}
            className="zoom-btn"
            title="Zoom In"
          >
            <ZoomIn />
          </Button>
        </div>
      )}

      {/* Reset Button */}
      {state.age && state.duration && (
        <div className="reset-control">
          <Button variant="danger" size="sm" onClick={handleReset}>
            Reset Calendar
          </Button>
        </div>
      )}

      {/* Setup Modal */}
      <Modal show={showSetup} centered backdrop="static" className="dark-modal">
        <Form onSubmit={handleSetup}>
          <Modal.Header className="bg-dark text-light">
            <Modal.Title>Life Calendar Setup</Modal.Title>
          </Modal.Header>
          <Modal.Body className="bg-dark">
            <Form.Group className="mb-3">
              <Form.Label>Current Age</Form.Label>
              <Form.Control
                type="number"
                name="age"
                value={formValues.age}
                onChange={handleInputChange}
                min="1"
                required
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Calendar Duration (years)</Form.Label>
              <Form.Control
                type="number"
                name="duration"
                value={formValues.duration}
                onChange={handleInputChange}
                min="1"
                required
              />
            </Form.Group>
            <div className="mt-3 text-muted small">
              <p>
                Note: Calendar data is stored only for the current browser
                session.
              </p>
            </div>
          </Modal.Body>
          <Modal.Footer className="bg-dark">
            <Button type="submit">Create Calendar</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Event Modal */}
      <Modal
        show={!!selectedDay}
        onHide={() => setSelectedDay(null)}
        className="dark-modal"
      >
        <Modal.Header closeButton className="bg-dark text-light">
          <Modal.Title>Day {selectedDay}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark">
          <Form.Control
            as="textarea"
            rows={3}
            value={eventText}
            onChange={(e) => setEventText(e.target.value)}
            placeholder="Enter event description..."
            className="bg-secondary text-light"
          />
          {state.events[selectedDay] &&
            state.events[selectedDay].length > 0 && (
              <div className="mt-3">
                <h6>Existing Events:</h6>
                <ul className="list-group">
                  {state.events[selectedDay].map((event, idx) => (
                    <li
                      key={idx}
                      className="list-group-item bg-dark text-light"
                    >
                      {event}
                    </li>
                  ))}
                </ul>
              </div>
            )}
        </Modal.Body>
        <Modal.Footer className="bg-dark">
          <Button variant="secondary" onClick={() => setSelectedDay(null)}>
            Cancel
          </Button>
          <Button onClick={handleAddEvent}>Save Event</Button>
        </Modal.Footer>
      </Modal>

      {/* Calendar Grid */}
      {state.age && state.duration && isInitialized && (
        <div className="calendar-wrapper" ref={calendarWrapperRef}>
          <div className={`calendar-container ${isZooming ? "zooming" : ""}`}>
            {renderCalendarDays()}
          </div>
        </div>
      )}
    </div>
  );
};

export default LifeCalendar;
