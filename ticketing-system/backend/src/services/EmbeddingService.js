const axios = require('axios');

class EmbeddingService {
  constructor() {
    this.embeddingApiUrl = process.env.EMBEDDING_API_URL || 'http://localhost:8000/embed';
    this.logger = console; // In production, use proper logger
  }

  /**
   * Generate vector embedding for ticket content
   * @param {string} title - Ticket title
   * @param {string} description - Ticket description
   * @returns {Promise<Array<number>>} Vector embedding array
   */
  async generateTicketEmbedding(title, description) {
    try {
      // Combine title and description for embedding
      const combinedText = `${title}\n\n${description}`.trim();
      
      if (!combinedText) {
        this.logger.warn('Empty text provided for embedding generation');
        return null;
      }

      this.logger.info(`Generating embedding for text of length ${combinedText.length}`);

      const response = await axios.post(this.embeddingApiUrl, {
        text: combinedText
      }, {
        timeout: 10000, // 10 second timeout
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data && response.data.embedding) {
        this.logger.info(`Successfully generated embedding with ${response.data.embedding.length} dimensions`);
        return response.data.embedding;
      } else {
        throw new Error('Invalid response format from embedding service');
      }
    } catch (error) {
      this.logger.error('Error generating ticket embedding:', error.message);
      
      // Don't fail ticket creation if embedding fails
      // Just log the error and return null
      if (error.response) {
        this.logger.error('Embedding service response error:', error.response.status, error.response.data);
      } else if (error.request) {
        this.logger.error('Embedding service request failed:', error.request);
      }
      
      return null;
    }
  }

  /**
   * Check if embedding service is available
   * @returns {Promise<boolean>} True if service is available
   */
  async isServiceAvailable() {
    try {
      const response = await axios.get(this.embeddingApiUrl.replace('/embed', '/health'), {
        timeout: 5000
      });
      return response.status === 200;
    } catch (error) {
      this.logger.warn('Embedding service health check failed:', error.message);
      return false;
    }
  }

  /**
   * Get embedding service status and configuration
   * @returns {Promise<object>} Service status information
   */
  async getServiceStatus() {
    try {
      const isAvailable = await this.isServiceAvailable();
      return {
        available: isAvailable,
        url: this.embeddingApiUrl,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        available: false,
        url: this.embeddingApiUrl,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = EmbeddingService;
