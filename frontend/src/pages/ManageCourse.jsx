import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCourseById, addLesson, updateCourse, deleteLesson } from "../services/courseService";
import { 
  FaArrowLeft, 
  FaBook, 
  FaPlus, 
  FaTimes, 
  FaFileAlt, 
  FaVideo, 
  FaUnlockAlt, 
  FaLock,
  FaUpload,
  FaChevronDown,
  FaCheck,
  FaPlay,
  FaEye,
  FaClock
} from "react-icons/fa";

import "../styles/manageCourse.css";

const ManageCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [editingDetails, setEditingDetails] = useState(false);
  const [courseForm, setCourseForm] = useState({ title: "", description: "", price: "" });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [lesson, setLesson] = useState({
    title: "",
    type: "text",
    textContent: "",
    isFree: false,
  });

  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");

  const loadCourse = async () => {
    try {
      setLoading(true);
      const res = await getCourseById(id);
      setCourse(res.data);
      setCourseForm({ title: res.data.title || "", description: res.data.description || "", price: res.data.price || "" });
      setError(null);
    } catch (err) {
      setError("Failed to load course. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourse();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("title", lesson.title);
      formData.append("type", lesson.type);
      formData.append("isFree", lesson.isFree);

      if (lesson.type === "text") {
        formData.append("textContent", lesson.textContent);
      } else if (file) {
        formData.append("file", file);
      }

      await addLesson(id, formData);
      setShowForm(false);
      setLesson({ 
        title: "", 
        type: "text", 
        textContent: "", 
        isFree: false 
      });
      setFile(null);
      setFileName("");
      loadCourse();
    } catch (err) {
      setError("Failed to add lesson. Please try again.");
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setLesson({ 
      title: "", 
      type: "text", 
      textContent: "", 
      isFree: false 
    });
    setFile(null);
    setFileName("");
  };

  if (loading) {
    return (
      <div className="manage-loading-container">
        <div className="manage-loading-spinner"></div>
        <p>Loading course...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="manage-error-container">
        <div className="manage-error-message">
          <p>{error}</p>
          <button 
            onClick={() => loadCourse()}
            className="manage-btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="manage-error-container">
        <div className="manage-error-message">
          <p>Course not found.</p>
          <button 
            onClick={() => navigate(-1)}
            className="manage-btn-secondary"
          >
            <FaArrowLeft /> Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="manage-course-container">
      {/* Header */}
      <header className="manage-header">
        <div className="manage-header-top">
          <button 
            onClick={() => navigate(-1)}
            className="manage-back-btn"
          >
            <FaArrowLeft /> Back
          </button>
          <h1 className="manage-title">Manage Course</h1>
        </div>
        
        <div className="course-info-card">
          <div className="course-info-header">
            <FaBook className="course-info-icon" />
            <div>
              <h2 className="course-title">{course.title}</h2>
              <div className="course-meta-info">
                <span className="course-meta-item">
                  <FaClock /> {course.lessons?.length || 0} lessons
                </span>
                <span className="course-meta-item">
                  • Created by Instructor
                </span>
              </div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <button className="manage-btn-secondary" onClick={() => setEditingDetails(!editingDetails)}>
                {editingDetails ? 'Cancel' : 'Edit Details'}
              </button>
            </div>
          </div>
        {editingDetails && (
          <form className="edit-course-form" onSubmit={async (e) => {
            e.preventDefault();
            try {
              await updateCourse(id, courseForm);
              alert('Course updated');
              setEditingDetails(false);
              loadCourse();
            } catch (err) {
              alert('Failed to update course');
            }
          }}>
            <input value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} placeholder="Title" required />
            <textarea value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} placeholder="Description" rows={3} />
            <input value={courseForm.price} onChange={(e) => setCourseForm({ ...courseForm, price: e.target.value })} placeholder="Price" type="number" min="0" />
            <button type="submit" className="manage-btn-primary">Save</button>
          </form>
        )}
        </div>
      </header>

      {/* Main Content */}
      <main className="manage-main-content">
        <div className={`content-layout ${selectedLesson || showForm ? 'with-sidebar' : ''}`}>
          {/* Left Column - Lessons List */}
          <section className="lessons-panel">
            <div className="panel-header">
              <h3 className="panel-title">
                <FaBook /> Course Lessons
              </h3>
              <span className="lesson-count-badge">
                {course.lessons?.length || 0}
              </span>
            </div>

            {course.lessons && course.lessons.length > 0 ? (
              <>
                <div className="lessons-list">
                  {course.lessons.map((l, index) => (
                    <div 
                      key={l._id || index}
                      className={`lesson-card ${selectedLesson?._id === l._id ? 'selected' : ''}`}
                      onClick={() => setSelectedLesson(l)}
                    >
                      <div className="lesson-card-icon">
                        {l.type === "text" ? <FaFileAlt /> : <FaVideo />}
                      </div>
                      
                      <div className="lesson-card-content">
                        <div className="lesson-card-header">
                          <h4 className="lesson-card-title">{l.title}</h4>
                          {l.isFree && (
                            <span className="free-tag">
                              <FaUnlockAlt /> Free
                            </span>
                          )}
                        </div>
                        <div className="lesson-card-meta">
                          <span className="lesson-number">Lesson {index + 1}</span>
                          <span className="lesson-type-tag">
                            {l.type === "text" ? "Text" : "Video"}
                          </span>
                        </div>
                      </div>
                      
                      <button className="lesson-preview-btn">
                        <FaEye />
                      </button>
                    </div>
                  ))}
                </div>
                
                <button 
                  onClick={() => setShowForm(true)}
                  className="add-lesson-btn"
                >
                  <FaPlus /> Add New Lesson
                </button>
              </>
            ) : (
              <div className="empty-lessons-state">
                <div className="empty-icon-container">
                  <FaBook className="empty-icon" />
                </div>
                <h4>No Lessons Yet</h4>
                <p className="empty-description">
                  Start by adding your first lesson to this course
                </p>
                <button 
                  onClick={() => setShowForm(true)}
                  className="add-lesson-btn"
                >
                  <FaPlus /> Add First Lesson
                </button>
              </div>
            )}
          </section>

          {/* Right Column - Selected Lesson or Form */}
          {(selectedLesson || showForm) && (
            <aside className="sidebar-panel">
              {showForm ? (
                <div className="form-panel">
                  <div className="form-panel-header">
                    <h3>Add New Lesson</h3>
                    <button 
                      onClick={handleCancel}
                      className="close-form-btn"
                    >
                      <FaTimes />
                    </button>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="lesson-form">
                    <div className="form-group">
                      <label htmlFor="lessonTitle">Lesson Title *</label>
                      <input
                        id="lessonTitle"
                        type="text"
                        className="form-input"
                        placeholder="Enter lesson title"
                        value={lesson.title}
                        onChange={(e) =>
                          setLesson({ ...lesson, title: e.target.value })
                        }
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="lessonType">Lesson Type</label>
                      <div className="select-wrapper">
                        <select
                          id="lessonType"
                          className="form-select"
                          value={lesson.type}
                          onChange={(e) =>
                            setLesson({ ...lesson, type: e.target.value })
                          }
                        >
                          <option value="text">Text Lesson</option>
                          <option value="video">Video Lesson</option>
                        </select>
                        <FaChevronDown className="select-arrow" />
                      </div>
                    </div>
                    
                    {lesson.type === "text" ? (
                      <div className="form-group">
                        <label htmlFor="textContent">Lesson Content</label>
                        <textarea
                          id="textContent"
                          className="form-textarea"
                          placeholder="Enter lesson content here..."
                          rows={8}
                          value={lesson.textContent}
                          onChange={(e) =>
                            setLesson({ ...lesson, textContent: e.target.value })
                          }
                        />
                      </div>
                    ) : (
                      <div className="form-group">
                        <label>Upload Video *</label>
                        <div className="upload-area">
                          <input
                            type="file"
                            accept="video/*"
                            onChange={handleFileChange}
                            className="file-input"
                            required={lesson.type === "video"}
                          />
                          <div className="upload-prompt">
                            <FaUpload className="upload-icon" />
                            <p className="upload-title">Choose video file</p>
                            <p className="upload-subtitle">
                              MP4, MOV, AVI up to 500MB
                            </p>
                          </div>
                        </div>
                        {fileName && (
                          <div className="file-selected">
                            <span className="file-name">{fileName}</span>
                            <span className="file-size">
                              {file ? Math.round(file.size / 1024 / 1024) : 0} MB
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="form-group">
                      <div className="access-toggle">
                        <label className="toggle-label">
                          <input
                            type="checkbox"
                            className="toggle-input"
                            checked={lesson.isFree}
                            onChange={(e) =>
                              setLesson({ ...lesson, isFree: e.target.checked })
                            }
                          />
                          <span className="toggle-slider"></span>
                          <span className="toggle-text">
                            {lesson.isFree ? (
                              <>
                                <FaUnlockAlt /> Free Preview
                              </>
                            ) : (
                              <>
                                <FaLock /> Premium Content
                              </>
                            )}
                          </span>
                        </label>
                        <p className="toggle-description">
                          {lesson.isFree 
                            ? "This lesson will be available for free preview"
                            : "This lesson requires course enrollment"
                          }
                        </p>
                      </div>
                    </div>
                    
                    <div className="form-actions">
                      <button type="submit" className="manage-btn-primary">
                        <FaCheck /> Save Lesson
                      </button>
                      <button 
                        type="button" 
                        onClick={handleCancel}
                        className="manage-btn-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              ) : selectedLesson ? (
                <div className="preview-panel">
                  <div className="preview-header">
                    <div className="preview-title-section">
                      {selectedLesson.type === "text" ? (
                        <FaFileAlt className="preview-icon" />
                      ) : (
                        <FaVideo className="preview-icon" />
                      )}
                      <h3>Lesson Preview</h3>
                    </div>
                    {selectedLesson.isFree && (
                      <span className="free-preview-badge">
                        <FaUnlockAlt /> Free Preview
                      </span>
                    )}
                  </div>
                  
                  <div className="preview-content">
                    <h2 className="preview-lesson-title">{selectedLesson.title}</h2>
                    <div className="preview-meta">
                      <span className="preview-type">
                        {selectedLesson.type === "text" ? "Text Lesson" : "Video Lesson"}
                      </span>
                      <span className="preview-date">
                        • Added recently
                      </span>
                    </div>
                    
                    <div className="preview-body">
                      {selectedLesson.type === "text" ? (
                        <div className="text-preview">
                          <p>{selectedLesson.content || selectedLesson.textContent}</p>
                        </div>
                      ) : (
                        <div className="video-preview">
                          <div className="video-wrapper">
                            <video 
                              src={selectedLesson.content} 
                              controls 
                              className="preview-video"
                            />
                            <div className="video-placeholder">
                              <FaPlay className="play-btn" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="preview-info">
                      <div className="info-row">
                        <span className="info-label">Type:</span>
                        <span className="info-value">
                          {selectedLesson.type === "text" ? "Text" : "Video"}
                        </span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Access:</span>
                        <span className={`info-value ${selectedLesson.isFree ? 'free' : 'premium'}`}>
                          {selectedLesson.isFree ? "Free Preview" : "Premium"}
                        </span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Status:</span>
                        <span className="info-value published">
                          Published
                        </span>
                      </div>
                    </div>
                    <div style={{ marginTop: 12 }}>
                      <button
                        className="manage-btn-secondary"
                        onClick={async () => {
                          if (!window.confirm('Delete this lesson?')) return;
                          try {
                            await deleteLesson(id, selectedLesson._id);
                            alert('Lesson deleted');
                            setSelectedLesson(null);
                            loadCourse();
                          } catch (err) {
                            alert('Failed to delete lesson');
                          }
                        }}
                      >
                        <FaTimes /> Delete Lesson
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </aside>
          )}
        </div>
      </main>
    </div>
  );
};

export default ManageCourse; 
