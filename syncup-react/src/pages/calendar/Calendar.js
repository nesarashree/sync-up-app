import React, { useState, useEffect } from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { Link } from 'react-router-dom';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { collection, addDoc, getDocs, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Container, Modal, Button, Form, Navbar, Badge } from 'react-bootstrap';
import './Calendar.css';
import logo from '../../assets/logo.png';

// Setup the localizer for react-big-calendar
const localizer = momentLocalizer(moment);

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    start: new Date(),
    end: new Date(),
    location: '',
    description: ''
  });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Authentication state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user ? user.uid : 'No user');
      setCurrentUser(user);
      setAuthChecked(true);
    });
    
    return () => unsubscribe(); // Cleanup subscription
  }, []);

  // Initialize with empty events
  useEffect(() => {
    const initializeCalendar = () => {
      try {
        console.log('Demo mode: Using local events only');
        // Start with an empty calendar
        setEvents([]);
        // No sample events, just an empty array
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeCalendar();
  }, []);

  // Open modal for creating a new event
  const handleSelectSlot = ({ start, end }) => {
    setSelectedEvent(null);
    setNewEvent({
      title: '',
      start,
      end,
      location: '',
      description: ''
    });
    setShowModal(true);
  };

  // Open modal to view/edit existing event
  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setNewEvent(event);
    setShowModal(true);
  };

  // Handle event creation/update - simplified to use local state only
  const handleSaveEvent = () => {
    console.log('Save event button clicked');
    console.log('Current event data:', newEvent);
    
    // Validate form data
    if (!newEvent.title) {
      alert('Please enter an event title');
      return;
    }
    
    try {      
      // Create a unique ID for the event
      const generateId = () => Math.random().toString(36).substr(2, 9);
      
      if (selectedEvent) {
        // Update existing event - local state only
        setEvents(events.map(event => 
          event.id === selectedEvent.id ? {
            ...event,
            title: newEvent.title,
            start: new Date(newEvent.start),
            end: new Date(newEvent.end),
            location: newEvent.location || '',
            description: newEvent.description || ''
          } : event
        ));
        
        console.log('Updated event locally');
      } else {
        // Create new event - local state only
        const newId = generateId();
        
        // Add event to local state
        setEvents([...events, { 
          id: newId,
          title: newEvent.title,
          start: new Date(newEvent.start),
          end: new Date(newEvent.end),
          location: newEvent.location || '',
          description: newEvent.description || ''
        }]);
        
        console.log('Added new event locally with ID:', newId);
      }

      // Close modal
      setShowModal(false);
      
    } catch (error) {
      console.error('Error handling event:', error);
    }
  };

  // Handle event deletion - simplified to use local state only
  const handleDeleteEvent = () => {
    if (!selectedEvent || !selectedEvent.id) return;
    
    try {
      // Remove from local state only
      setEvents(events.filter(event => event.id !== selectedEvent.id));
      setShowModal(false);
      console.log('Deleted event locally:', selectedEvent.id);
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  return (
    <div className="calendar-page">
      <Navbar bg="light" expand="lg" className="calendar-navbar">
        <Container>
          <Navbar.Brand as={Link} to="/home">
            <img src={logo} alt="StudyBuddy" className="nav-logo" /> StudyBuddy
          </Navbar.Brand>
          <div className="navbar-buttons">
            <Link to="/home" className="nav-link">
              Back to Home
            </Link>
            <Badge bg="primary" className="today-badge" onClick={() => window.location.reload()}>
              Today: {moment().format('MMM D')}
            </Badge>
          </div>
        </Container>
      </Navbar>
      
      <Container className="calendar-container">
        <div className="calendar-header">
          <h1>Study Calendar</h1>
          <p className="calendar-date">Today is {moment().format('dddd, MMMM D, YYYY')}</p>
          <p className="calendar-subheading">Schedule study sessions and track your meetings</p>
        </div>
        
        {loading ? (
          <div className="calendar-loading">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p>Loading your events...</p>
          </div>
        ) : (
          <div className="calendar-wrapper">
            <BigCalendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 600 }}
              selectable
              onSelectSlot={handleSelectSlot}
              onSelectEvent={handleSelectEvent}
              views={['month', 'week', 'day', 'agenda']}
              defaultView="month"
              tooltipAccessor={event => `${event.title} - ${event.location || 'No location'}`}
            />
          </div>
        )}
        
        <div className="calendar-tips">
          <h4>Quick Tips</h4>
          <ul>
            <li>Click on any day to schedule a new study session</li>
            <li>Click on an existing event to edit or delete it</li>
            <li>Switch between month, week, and day views using the buttons above</li>
          </ul>
        </div>
      </Container>
      
      {/* Event Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{selectedEvent ? 'Edit Event' : 'Create Event'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Event title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Start Date & Time</Form.Label>
              <Form.Control 
                type="datetime-local" 
                value={moment(newEvent.start).format('YYYY-MM-DDTHH:mm')}
                onChange={(e) => setNewEvent({
                  ...newEvent, 
                  start: new Date(e.target.value)
                })}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>End Date & Time</Form.Label>
              <Form.Control 
                type="datetime-local" 
                value={moment(newEvent.end).format('YYYY-MM-DDTHH:mm')}
                onChange={(e) => setNewEvent({
                  ...newEvent, 
                  end: new Date(e.target.value)
                })}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Location</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Event location"
                value={newEvent.location || ''}
                onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3}
                placeholder="Event description"
                value={newEvent.description || ''}
                onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          
          {selectedEvent && (
            <Button variant="danger" onClick={handleDeleteEvent}>
              Delete
            </Button>
          )}
          
          <Button 
            variant="primary" 
            onClick={handleSaveEvent}
            disabled={!newEvent.title}
          >
            {selectedEvent ? 'Update' : 'Create'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Calendar;
