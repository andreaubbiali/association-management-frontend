import api from './api.js'

/**
 * Courses API service
 */
export const coursesService = {
  /**
   * Get all active courses
   * @returns {Promise} API response with active courses
   */
  async getActiveCourses() {
    try {
      const response = await api.get('/course?active=true')
      return response.data
    } catch (error) {
      console.error('Error fetching active courses:', error)
      throw error
    }
  },

  /**
   * Get all courses with optional filters
   * @param {Object} filters - Filter parameters
   * @returns {Promise} API response
   */
  async getCourses(filters = {}) {
    try {
      const params = new URLSearchParams()
      
      // Add filters to query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          params.append(key, value)
        }
      })
      
      const response = await api.get(`/course?${params.toString()}`)
      return response.data
    } catch (error) {
      console.error('Error fetching courses:', error)
      throw error
    }
  },

  /**
   * Get a single course by ID
   * @param {number} id - Course ID
   * @returns {Promise} API response
   */
  async getCourse(id) {
    try {
      const response = await api.get(`/course/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching course:', error)
      throw error
    }
  },

  /**
   * Create a new course
   * @param {Object} courseData - Course data to create
   * @returns {Promise} API response
   */
  async createCourse(courseData) {
    try {
      const response = await api.post('/course', courseData)
      return response.data
    } catch (error) {
      console.error('Error creating course:', error)
      throw error
    }
  },

  /**
   * Get all course types
   * @returns {Promise} API response with course types
   */
  async getCourseTypes() {
    try {
      const response = await api.get('/course-type')
      return response.data
    } catch (error) {
      console.error('Error fetching course types:', error)
      throw error
    }
  }
}
